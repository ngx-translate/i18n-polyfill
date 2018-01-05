import * as ts from "typescript";
import {I18nDef} from "../../src/i18n-polyfill";

// source: https://github.com/biesbjerg/ngx-translate-extract/blob/master/src/parsers/abstract-ast.parser.ts
export abstract class AbstractAstParser {
  protected _sourceFile: ts.SourceFile;

  protected _createSourceFile(path: string, contents: string): ts.SourceFile {
    return ts.createSourceFile(path, contents, ts.ScriptTarget.ES5, /*setParentNodes */ false);
  }

  /**
   * Get strings from function call's first argument
   */
  protected _getCallArgStrings(callNode: ts.CallExpression): (string | I18nDef)[] {
    if (!callNode.arguments.length) {
      return [];
    }

    const firstArg = callNode.arguments[0];
    switch (firstArg.kind) {
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.FirstTemplateToken:
        return [(firstArg as ts.StringLiteral).text];
      case ts.SyntaxKind.ArrayLiteralExpression:
        return (firstArg as ts.ArrayLiteralExpression).elements.map((element: ts.StringLiteral) => element.text);
      case ts.SyntaxKind.ObjectLiteralExpression:
        const i18nDef: I18nDef = {value: ""};
        (firstArg as ts.ObjectLiteralExpression).properties.forEach((prop: ts.PropertyAssignment) => {
          i18nDef[(prop.name as ts.Identifier).text] = (prop.initializer as ts.StringLiteral).text;
        });
        if (!i18nDef.value) {
          throw new Error(
            `An I18nDef requires a value property on '${this.syntaxKindToName(firstArg.kind)}' for ${firstArg}`
          );
        }
        return [i18nDef];
      case ts.SyntaxKind.Identifier:
        console.log("WARNING: We cannot extract variable values passed to TranslateService (yet)");
        break;
      default:
        console.log(`SKIP: Unknown argument type: '${this.syntaxKindToName(firstArg.kind)}'`, firstArg);
    }
    return [];
  }

  /**
   * Find all child nodes of a kind
   */
  protected _findNodes(node: ts.Node, kind: ts.SyntaxKind): ts.Node[] {
    const childrenNodes: ts.Node[] = node.getChildren(this._sourceFile);
    const initialValue: ts.Node[] = node.kind === kind ? [node] : [];

    return childrenNodes.reduce((result: ts.Node[], childNode: ts.Node) => {
      return result.concat(this._findNodes(childNode, kind));
    }, initialValue);
  }

  protected syntaxKindToName(kind: ts.SyntaxKind): string {
    return ts.SyntaxKind[kind];
  }
}
