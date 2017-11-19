/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as html from "../ast/ast";
import * as i18n from "../ast/i18n_ast";
import {getHtmlTagDefinition} from "../ast/html_tags";
import {I18nPluralPipe, I18nSelectPipe, NgLocaleLocalization} from "@angular/common";
import {Parser} from "../ast/parser";
import {getXmlTagDefinition} from "../ast/xml_tags";
import {I18nError} from "../ast/parse_util";
import * as xml from "./xml_helper";

export interface I18nMessagesById {
  [msgId: string]: i18n.Node[];
}

export interface XmlMessagesById {
  [id: string]: xml.Node;
}

export interface IcuContent {
  cases: {[value: string]: html.Node[]};
  expression: string;
  type: string;
}

export interface IcuContentStr {
  cases: {[value: string]: string};
  expression: string;
  type: string;
}

/**
 * A `PlaceholderMapper` converts placeholder names from internal to serialized representation and
 * back.
 *
 * It should be used for serialization format that put constraints on the placeholder names.
 */
export interface PlaceholderMapper {
  toPublicName(internalName: string): string | null;

  toInternalName(publicName: string): string | null;
}

/**
 * A simple mapper that take a function to transform an internal name to a public name
 */
export class SimplePlaceholderMapper extends i18n.RecurseVisitor implements PlaceholderMapper {
  private internalToPublic: {[k: string]: string} = {};
  private publicToNextId: {[k: string]: number} = {};
  private publicToInternal: {[k: string]: string} = {};

  // create a mapping from the message
  constructor(message: i18n.Message, private mapName: (name: string) => string) {
    super();
    message.nodes.forEach(node => node.visit(this));
  }

  toPublicName(internalName: string): string | null {
    return this.internalToPublic.hasOwnProperty(internalName) ? this.internalToPublic[internalName] : null;
  }

  toInternalName(publicName: string): string | null {
    return this.publicToInternal.hasOwnProperty(publicName) ? this.publicToInternal[publicName] : null;
  }

  visitText(text: i18n.Text, context?: any): any {
    return null;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context?: any): any {
    this.visitPlaceholderName(ph.startName);
    super.visitTagPlaceholder(ph, context);
    this.visitPlaceholderName(ph.closeName);
  }

  visitPlaceholder(ph: i18n.Placeholder, context?: any): any {
    this.visitPlaceholderName(ph.name);
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    this.visitPlaceholderName(ph.name);
  }

  // XMB placeholders could only contains A-Z, 0-9 and _
  private visitPlaceholderName(internalName: string): void {
    if (!internalName || this.internalToPublic.hasOwnProperty(internalName)) {
      return;
    }

    let publicName = this.mapName(internalName);

    if (this.publicToInternal.hasOwnProperty(publicName)) {
      // Create a new XMB when it has already been used
      const nextId = this.publicToNextId[publicName];
      this.publicToNextId[publicName] = nextId + 1;
      publicName = `${publicName}_${nextId}`;
    } else {
      this.publicToNextId[publicName] = 1;
    }

    this.internalToPublic[internalName] = publicName;
    this.publicToInternal[publicName] = internalName;
  }
}

const i18nSelectPipe = new I18nSelectPipe();
class SerializerVisitor implements html.Visitor {
  private i18nPluralPipe: I18nPluralPipe;
  constructor(locale: string, private params: {[key: string]: any}) {
    this.i18nPluralPipe = new I18nPluralPipe(new NgLocaleLocalization(locale));
  }
  visitElement(element: html.Element, context: any): any {
    if (getHtmlTagDefinition(element.name).isVoid) {
      return `<${element.name}${this.serializeNodes(element.attrs, " ")}/>`;
    }

    return `<${element.name}${this.serializeNodes(element.attrs, " ")}>${this.serializeNodes(element.children)}</${
      element.name
    }>`;
  }

  visitAttribute(attribute: html.Attribute, context: any): any {
    return `${attribute.name}="${attribute.value}"`;
  }

  visitText(text: html.Text, context: any): any {
    return text.value;
  }

  visitComment(comment: html.Comment, context: any): any {
    return `<!--${comment.value}-->`;
  }

  visitExpansion(expansion: html.Expansion, context: any): any {
    const cases = {};
    expansion.cases.forEach(c => (cases[c.value] = this.serializeNodes(c.expression)));

    switch (expansion.type) {
      case "select":
        return i18nSelectPipe.transform(this.params[expansion.switchValue] || "", cases);
      case "plural":
        return this.i18nPluralPipe.transform(this.params[expansion.switchValue], cases);
    }
    throw new Error(`Unknown expansion type "${expansion.type}"`);
  }

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {
    return ` ${expansionCase.value} {${this.serializeNodes(expansionCase.expression)}}`;
  }

  private serializeNodes(nodes: html.Node[], join = ""): string {
    if (nodes.length === 0) {
      return "";
    }
    return join + nodes.map(a => a.visit(this, null)).join(join);
  }
}

export function serializeNodes(nodes: html.Node[], locale: string, params: {[key: string]: any}): string[] {
  return nodes.map(node => node.visit(new SerializerVisitor(locale, params), null));
}

export class HtmlToXmlParser implements html.Visitor {
  private errors: I18nError[];
  private xmlMessagesById: {[id: string]: xml.Node};

  constructor(private MESSAGE_TAG: string) {}

  parse(content: string) {
    this.xmlMessagesById = {};

    const parser = new Parser(getXmlTagDefinition).parse(content, "", false);

    this.errors = parser.errors;
    html.visitAll(this, parser.rootNodes, null);

    return {
      xmlMessagesById: this.xmlMessagesById,
      errors: this.errors
    };
  }

  visitElement(element: html.Element, context: any): any {
    switch (element.name) {
      case this.MESSAGE_TAG:
        const id = element.attrs.find(attr => attr.name === "id");
        if (id) {
          this.xmlMessagesById[id.value] = (element as any) as xml.Node;
        }
        break;
      default:
        html.visitAll(this, element.children, null);
    }
  }

  visitAttribute(attribute: html.Attribute, context: any): any {}

  visitText(text: html.Text, context: any): any {}

  visitComment(comment: html.Comment, context: any): any {}

  visitExpansion(expansion: html.Expansion, context: any): any {}

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {}
}
