import * as ts from "typescript";
import {existsSync, readFileSync, statSync} from "fs";
import * as glob from "glob";
import {AbstractAstParser} from "./abstract-ast-parser";
import {xliff2Digest, xliff2LoadToXml, xliff2Write} from "../../src/serializers/xliff2";
import {xliffDigest, xliffLoadToXml, xliffWrite} from "../../src/serializers/xliff";
import {xtbDigest, xtbMapper} from "../../src/serializers/xtb";
import {Message} from "../../src/ast/i18n_ast";
import {xmbLoadToXml, xmbWrite} from "../../src/serializers/xmb";
import {Node} from "../../src/serializers/xml_helper";
import {MessageBundle} from "./message-bundle";
import {XmlMessagesById} from "../../src/serializers/serializer";
import {I18nDef} from "../../src/i18n-polyfill";

export function getAst(paths: string[]): {[url: string]: (string | I18nDef)[]} {
  const files = [];
  paths.forEach(path => {
    files.push(...glob.sync(path));
  });
  const parser = new ServiceParser();
  const collection: {[url: string]: (string | I18nDef)[]} = {};
  files.forEach(path => {
    if (statSync(path).isDirectory) {
      // this._options.verbose && this._out(chalk.gray('- %s'), path);
      const contents: string = readFileSync(path, "utf-8");
      const entries = parser.extract(contents, path);
      if (entries.length) {
        collection[path] = entries;
      }
    }
  });
  // save file
  return collection;
}

// source: https://github.com/biesbjerg/ngx-translate-extract/blob/master/src/parsers/service.parser.ts
export class ServiceParser extends AbstractAstParser {
  protected _sourceFile: ts.SourceFile;

  public extract(contents: string, path?: string): (string | I18nDef)[] {
    const entries: (string | I18nDef)[] = [];

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
        entries.push(...this._getCallArgStrings(callNode));
      });
    });

    return entries;
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

export function getFileContent(messages: {[url: string]: (string|I18nDef)[]}, sourcePath: string, format?: string, locale = "en"): string {
  let loadFct: (content: string, url: string) => XmlMessagesById;
  let writeFct: (messages: Message[], locale: string | null, existingNodes: Node[]) => string;
  let digest: (message: Message) => string;
  let createMapper = (message: Message) => null;
  format = (format || "xlf").toLowerCase();
  switch (format) {
    case "xmb":
      loadFct = xmbLoadToXml;
      writeFct = xmbWrite;
      digest = xtbDigest;
      createMapper = xtbMapper;
      break;
    case "xliff2":
    case "xlf2":
      loadFct = xliff2LoadToXml;
      writeFct = xliff2Write;
      digest = xliff2Digest;
      break;
    case "xliff":
    case "xlf":
    default:
      loadFct = xliffLoadToXml;
      writeFct = xliffWrite;
      digest = xliffDigest;
      break;
  }

  let xmlMessagesById: XmlMessagesById = {};
  if (existsSync(sourcePath)) {
    xmlMessagesById = loadFct(readFileSync(sourcePath, {encoding: "utf8"}), sourcePath);
  }
  const messageBundle = new MessageBundle(locale);
  Object.keys(messages).forEach(url => {
    messages[url].forEach(entry => messageBundle.updateFromTemplate(entry, url));
  });
  return messageBundle.write(writeFct, digest, xmlMessagesById, createMapper);
}
