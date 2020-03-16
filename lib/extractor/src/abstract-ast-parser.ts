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
    return this._getStringsFromExpression(firstArg);
  }

  /**
   * Get strings from an arbitrary JS expression
   */
  protected _getStringsFromExpression(expression: ts.Expression): (string | I18nDef)[] {
    switch (expression.kind) {
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.FirstTemplateToken:
        // Example: this.i18n('This is a sentence.')
        return [(expression as ts.StringLiteral).text];
      case ts.SyntaxKind.ArrayLiteralExpression:
        return (expression as ts.ArrayLiteralExpression).elements.map((element: ts.StringLiteral) => element.text);
      case ts.SyntaxKind.BinaryExpression:
        // Example: this.i18n('str1' + 'str2')
        const binExp = expression as ts.BinaryExpression;
        const left = this._getStringsFromExpression(binExp.left)[0],
              right = this._getStringsFromExpression(binExp.right)[0];
        if (binExp.operatorToken.kind === ts.SyntaxKind.PlusToken &&
            typeof left === 'string' && typeof right === 'string') {
          return [left + right];
        }
        console.log(`SKIP: Unknown BinaryExpression: `, expression);
        break;
      case ts.SyntaxKind.ObjectLiteralExpression:
        // Example: this.i18n({value: 'My value', description: 'Desc'})
        // or:      this.i18n({value: 'My ' + 'value'})
        const i18nDef: I18nDef = {value: ""};
        (expression as ts.ObjectLiteralExpression).properties.forEach((prop: ts.PropertyAssignment) => {
          const text = this._getStringsFromExpression(prop.initializer)[0];
          i18nDef[(prop.name as ts.Identifier).text] = text;
        });
        if (!i18nDef.value) {
          throw new Error(
            `An I18nDef requires a value property on '${this.syntaxKindToName(expression.kind)}' for ${expression}`
          );
        }
        return [i18nDef];
      case ts.SyntaxKind.Identifier:
        console.log("WARNING: We cannot extract variable values passed to TranslateService (yet)");
        break;
      default:
        console.log(`SKIP: Unknown argument type: '${this.syntaxKindToName(expression.kind)}'`, expression);
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
