/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ml from "../ast/ast";

export interface IVisitor {
  visitTag(tag: Tag): any;
  visitElement(element: ml.Element): any;
  visitText(text: Text): any;
  visitDeclaration(decl: Declaration): any;
  visitDoctype(doctype: Doctype): any;
}

class Visitor implements IVisitor {
  visitTag(tag: Tag): string {
    const strAttrs = this._serializeAttributes(tag.attrs);
    if (tag.children.length === 0) {
      return `<${tag.name}${strAttrs}/>`;
    }

    const strChildren = tag.children.map(node => node.visit(this));
    return `<${tag.name}${strAttrs}>${strChildren.join("")}</${tag.name}>`;
  }

  visitText(text: Text): string {
    return _escapeXml(text.value);
  }

  visitElement(element: ml.Element) {
    const attrs = {};
    element.attrs.forEach((attr: ml.Attribute) => {
      attrs[attr.name] = attr.value;
    });
    const tag = new Tag(element.name, attrs, element.children as any);
    return this.visitTag(tag);
  }

  visitDeclaration(decl: Declaration): string {
    return `<?xml${this._serializeAttributes(decl.attrs)} ?>`;
  }

  private _serializeAttributes(attrs: {[k: string]: string}) {
    const strAttrs = Object.keys(attrs)
      .map((name: string) => `${name}="${_escapeXml(attrs[name])}"`)
      .join(" ");
    return strAttrs.length > 0 ? " " + strAttrs : "";
  }

  visitDoctype(doctype: Doctype): any {
    return `<!DOCTYPE ${doctype.rootTag} [\n${doctype.dtd}\n]>`;
  }
}

const _visitor = new Visitor();

export function serialize(nodes: Node[]): string {
  return nodes.map((node: Node): string => node.visit(_visitor)).join("");
}

export interface Node {
  visit(visitor: IVisitor): any;
}

export class Declaration implements Node {
  constructor(public attrs: {[k: string]: string}) {}

  visit(visitor: IVisitor): any {
    return visitor.visitDeclaration(this);
  }
}

export class Doctype implements Node {
  constructor(public rootTag: string, public dtd: string) {}

  visit(visitor: IVisitor): any {
    return visitor.visitDoctype(this);
  }
}

export class Tag implements Node {
  constructor(public name: string, public attrs: {[k: string]: string} = {}, public children: Node[] = []) {}

  visit(visitor: IVisitor): any {
    return visitor.visitTag(this);
  }
}

export class Text implements Node {
  constructor(public value: string) {}

  visit(visitor: IVisitor): any {
    return visitor.visitText(this);
  }
}

export class CR extends Text {
  constructor(ws = 0) {
    super(`\n${new Array(ws + 1).join(" ")}`);
  }
}

const _ESCAPED_CHARS: [RegExp, string][] = [
  [/&/g, "&amp;"],
  [/"/g, "&quot;"],
  [/'/g, "&apos;"],
  [/</g, "&lt;"],
  [/>/g, "&gt;"]
];

function _escapeXml(text: string): string {
  return _ESCAPED_CHARS.reduce((str: string, entry: [RegExp, string]) => str.replace(entry[0], entry[1]), text);
}
