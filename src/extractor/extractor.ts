import * as ts from "typescript";
import {readdirSync, readFileSync} from "fs";
import * as glob from "glob";
import {AbstractAstParser} from "./abstract-ast-parser";
import {TranslationCollection} from "./translation-collection";

export function getAst(path: string) {
  const files = glob.sync(path);
  const parser = new ServiceParser();
  let collection: TranslationCollection = new TranslationCollection();
  files.forEach(path => {
    // this._options.verbose && this._out(chalk.gray('- %s'), path);
    const contents: string = readFileSync(path, "utf-8");
    collection = collection.union(parser.extract(contents, path));
  });
  return collection.keys();
}

// source: https://github.com/biesbjerg/ngx-translate-extract/blob/master/src/parsers/service.parser.ts
export class ServiceParser extends AbstractAstParser {
  protected _sourceFile: ts.SourceFile;

  public extract(contents: string, path?: string): TranslationCollection {
    let collection: TranslationCollection = new TranslationCollection();

    this._sourceFile = this._createSourceFile(path, contents);
    const classNodes = this._findClassNodes(this._sourceFile);
    classNodes.forEach(classNode => {
      const constructorNode = this._findConstructorNode(classNode);
      if (!constructorNode) {
        return;
      }

      const propertyName: string = this._findTranslateServicePropertyName(constructorNode);
      if (!propertyName) {
        return;
      }

      const callNodes = this._findCallNodes(classNode, propertyName);
      callNodes.forEach(callNode => {
        const keys: string[] = this._getCallArgStrings(callNode);
        if (keys && keys.length) {
          collection = collection.addKeys(keys);
        }
      });
    });

    return collection;
  }

  /**
   * Detect what the TranslateService instance property
   * is called by inspecting constructor arguments
   */
  protected _findTranslateServicePropertyName(constructorNode: ts.ConstructorDeclaration): string {
    if (!constructorNode) {
      return null;
    }

    const result = constructorNode.parameters.find(parameter => {
      // Skip if visibility modifier is not present (we want it set as an instance property)
      /*if (!parameter.modifiers) {
        return false;
      }*/

      // Parameter has no type
      if (!parameter.type) {
        return false;
      }

      // Make sure className is of the correct type
      const parameterType: ts.Identifier = (parameter.type as ts.TypeReferenceNode).typeName as ts.Identifier;
      if (!parameterType) {
        return false;
      }
      const className: string = parameterType.text;

      return className === "I18n";
    });

    if (result) {
      return (result.name as ts.Identifier).text;
    }
  }

  /**
   * Find class nodes
   */
  protected _findClassNodes(node: ts.Node): ts.ClassDeclaration[] {
    return this._findNodes(node, ts.SyntaxKind.ClassDeclaration) as ts.ClassDeclaration[];
  }

  /**
   * Find constructor
   */
  protected _findConstructorNode(node: ts.ClassDeclaration): ts.ConstructorDeclaration {
    const constructorNodes = this._findNodes(node, ts.SyntaxKind.Constructor) as ts.ConstructorDeclaration[];
    if (constructorNodes) {
      return constructorNodes[0];
    }
  }

  /**
   * Find all calls to TranslateService methods
   */
  protected _findCallNodes(node: ts.Node, propertyIdentifier: string): ts.CallExpression[] {
    let callNodes = this._findNodes(node, ts.SyntaxKind.CallExpression) as ts.CallExpression[];
    callNodes = callNodes.filter(callNode => {
      // Only call expressions with arguments
      if (callNode.arguments.length < 1) {
        return false;
      }
      const expression = callNode.expression as ts.PropertyAccessExpression & ts.Identifier;
      return expression.text === propertyIdentifier || (expression.name && expression.name.text === propertyIdentifier);
    });

    return callNodes;
  }
}
