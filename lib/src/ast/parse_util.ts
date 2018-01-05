import {I18nDef} from "../i18n-polyfill";

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class ParseLocation {
  constructor(public file: ParseSourceFile, public offset: number, public line: number, public col: number) {}

  toString(): string {
    return this.offset != null ? `${this.line}:${this.col}` : "";
  }

  // Return the source around the location
  // Up to `maxChars` or `maxLines` on each side of the location
  getContext(maxChars: number, maxLines: number): {before: string; after: string} | null {
    const content = this.file.content;
    let startOffset = this.offset;

    if (startOffset != null) {
      if (startOffset > content.length - 1) {
        startOffset = content.length - 1;
      }
      let endOffset = startOffset;
      let ctxChars = 0;
      let ctxLines = 0;

      while (ctxChars < maxChars && startOffset > 0) {
        startOffset--;
        ctxChars++;
        if (content[startOffset] === "\n") {
          if (++ctxLines === maxLines) {
            break;
          }
        }
      }

      ctxChars = 0;
      ctxLines = 0;
      while (ctxChars < maxChars && endOffset < content.length - 1) {
        endOffset++;
        ctxChars++;
        if (content[endOffset] === "\n") {
          if (++ctxLines === maxLines) {
            break;
          }
        }
      }

      return {
        before: content.substring(startOffset, this.offset),
        after: content.substring(this.offset, endOffset + 1)
      };
    }

    return null;
  }
}

export class ParseSourceFile {
  constructor(public content: string, public url = "") {}
}

export class ParseSourceSpan {
  constructor(public start: ParseLocation, public end: ParseLocation, public details: string | null = null) {}

  toString(): string {
    return this.start.file.content.substring(this.start.offset, this.end.offset);
  }
}

export enum ParseErrorLevel {
  WARNING,
  ERROR
}

export class ParseError {
  constructor(
    public span: ParseSourceSpan,
    public msg: string,
    public level: ParseErrorLevel = ParseErrorLevel.ERROR
  ) {}

  contextualMessage(): string {
    const ctx = this.span.start.getContext(100, 3);
    return ctx ? ` ("${ctx.before}[${ParseErrorLevel[this.level]} ->]${ctx.after}")` : "";
  }

  toString(): string {
    const details = this.span.details ? `, ${this.span.details}` : "";
    return `${this.msg}${this.contextualMessage()}: ${this.span.start}${details}`;
  }
}

/**
 * An i18n error.
 */
export class I18nError extends ParseError {
  constructor(span: ParseSourceSpan, msg: string) {
    super(span, msg);
  }
}

export function escapeRegExp(s: string): string {
  return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
}
