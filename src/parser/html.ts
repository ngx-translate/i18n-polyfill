import * as html from "../ast/ast";
import * as i18n from "../ast/i18n_ast";
import {I18nError, ParseError} from "../ast/parse_util";
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from "../ast/interpolation_config";
import {createI18nMessageFactory} from "./i18n";
import {Parser, ParseTreeResult} from "../ast/parser";
import {getHtmlTagDefinition} from "../ast/html_tags";

const _I18N_ATTR = "i18n";
const MEANING_SEPARATOR = "|";
const ID_SEPARATOR = "@@";

export class HtmlParser extends Parser {
  constructor() {
    super(getHtmlTagDefinition);
  }

  parse(
    source: string,
    url: string,
    parseExpansionForms: boolean = false,
    interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG
  ): ParseTreeResult {
    return super.parse(source, url, parseExpansionForms, interpolationConfig);
  }

  /**
   * Extract translatable messages from an html AST
   */
  extractMessages(nodes: html.Node[], interpolationConfig: InterpolationConfig): ExtractionResult {
    const visitor = new _Visitor();
    return visitor.extract(nodes, interpolationConfig);
  }
}

export class ExtractionResult {
  constructor(public messages: i18n.Message[], public errors: I18nError[]) {}
}

enum _VisitorMode {
  Extract,
  Merge
}

/**
 * This Visitor is used:
 * 1. to extract all the translatable strings from an html AST (see `extract()`),
 * 2. to replace the translatable strings with the actual translations (see `merge()`)
 *
 * @internal
 */
class _Visitor implements html.Visitor {
  private _depth: number;

  // <el i18n>...</el>
  private _inI18nNode: boolean;
  private _inImplicitNode: boolean;

  // <!--i18n-->...<!--/i18n-->
  private _inI18nBlock: boolean;
  private _blockMeaningAndDesc: string;
  private _blockChildren: html.Node[];
  private _blockStartDepth: number;

  // {<icu message>}
  private _inIcu: boolean;

  // set to void 0 when not in a section
  private _msgCountAtSectionStart: number | undefined;
  private _errors: I18nError[];
  private _mode: _VisitorMode;

  // _VisitorMode.Extract only
  private _messages: i18n.Message[];

  // _VisitorMode.Merge only
  private _createI18nMessage: (msg: html.Node[], meaning: string, description: string, id: string) => i18n.Message;

  /**
   * Extracts the messages from the tree
   */
  extract(nodes: html.Node[], interpolationConfig: InterpolationConfig): ExtractionResult {
    this._init(_VisitorMode.Extract, interpolationConfig);

    nodes.forEach(node => node.visit(this, null));

    if (this._inI18nBlock) {
      this._reportError(nodes[nodes.length - 1], "Unclosed block");
    }

    this._addMessage(nodes, "");

    return new ExtractionResult(this._messages, this._errors);
  }

  visitExpansionCase(icuCase: html.ExpansionCase, context: any): any {
    // Parse cases for translatable html attributes
    const expression = html.visitAll(this, icuCase.expression, context);

    if (this._mode === _VisitorMode.Merge) {
      return new html.ExpansionCase(
        icuCase.value,
        expression,
        icuCase.sourceSpan,
        icuCase.valueSourceSpan,
        icuCase.expSourceSpan
      );
    }
  }

  visitExpansion(icu: html.Expansion, context: any): html.Expansion {
    if (!this._inIcu && this._depth == this._blockStartDepth) {
      this._blockChildren.push(icu);
    }
    // console.log(icu);
    const wasInIcu = this._inIcu;

    if (!this._inIcu) {
      // nested ICU messages should not be extracted but top-level translated as a whole
      this._addMessage([icu]);
      this._inIcu = true;
    }

    const cases = html.visitAll(this, icu.cases, context);

    if (this._mode === _VisitorMode.Merge) {
      icu = new html.Expansion(icu.switchValue, icu.type, cases, icu.sourceSpan, icu.switchValueSourceSpan);
    }

    this._inIcu = wasInIcu;

    return icu;
  }

  visitComment(comment: html.Comment, context: any): any {
    return;
  }

  visitText(text: html.Text, context: any): html.Text {
    return text;
  }

  visitElement(el: html.Element, context: any): html.Element {
    return;
  }

  visitAttribute(attribute: html.Attribute, context: any): any {
    return;
  }

  private _init(mode: _VisitorMode, interpolationConfig: InterpolationConfig): void {
    this._mode = mode;
    this._inI18nNode = false;
    this._depth = 0;
    this._inIcu = false;
    this._msgCountAtSectionStart = undefined;
    this._errors = [];
    this._messages = [];
    this._inImplicitNode = false;
    this._createI18nMessage = createI18nMessageFactory(interpolationConfig);
  }

  // add a translatable message
  private _addMessage(ast: html.Node[], msgMeta?: string): i18n.Message | null {
    if (ast.length == 0 || (ast.length == 1 && ast[0] instanceof html.Attribute && !(<html.Attribute>ast[0]).value)) {
      // Do not create empty messages
      return null;
    }

    const {meaning, description, id} = _parseMessageMeta(msgMeta);
    const message = this._createI18nMessage(ast, meaning, description, id);
    this._messages.push(message);
    return message;
  }

  /**
   * Marks the start of a section, see `_closeTranslatableSection`
   */
  private _openTranslatableSection(node: html.Node): void {
    if (this._isInTranslatableSection) {
      this._reportError(node, "Unexpected section start");
    } else {
      this._msgCountAtSectionStart = this._messages.length;
    }
  }

  /**
   * A translatable section could be:
   * - the content of translatable element,
   * - nodes between `<!-- i18n -->` and `<!-- /i18n -->` comments
   */
  private get _isInTranslatableSection(): boolean {
    return this._msgCountAtSectionStart !== void 0;
  }

  /**
   * Terminates a section.
   *
   * If a section has only one significant children (comments not significant) then we should not
   * keep the message from this children:
   *
   * `<p i18n="meaning|description">{ICU message}</p>` would produce two messages:
   * - one for the <p> content with meaning and description,
   * - another one for the ICU message.
   *
   * In this case the last message is discarded as it contains less information (the AST is
   * otherwise identical).
   *
   * Note that we should still keep messages extracted from attributes inside the section (ie in the
   * ICU message here)
   */
  private _closeTranslatableSection(node: html.Node, directChildren: html.Node[]): void {
    if (!this._isInTranslatableSection) {
      this._reportError(node, "Unexpected section end");
      return;
    }

    const startIndex = this._msgCountAtSectionStart;
    const significantChildren: number = directChildren.reduce(
      (count: number, node: html.Node): number => count + (node instanceof html.Comment ? 0 : 1),
      0
    );

    if (significantChildren == 1) {
      for (let i = this._messages.length - 1; i >= startIndex!; i--) {
        const ast = this._messages[i].nodes;
        if (!(ast.length == 1 && ast[0] instanceof i18n.Text)) {
          this._messages.splice(i, 1);
          break;
        }
      }
    }

    this._msgCountAtSectionStart = undefined;
  }

  private _reportError(node: html.Node, msg: string): void {
    this._errors.push(new I18nError(node.sourceSpan!, msg));
  }
}

function _isOpeningComment(n: html.Node): boolean {
  return !!(n instanceof html.Comment && n.value && n.value.startsWith("i18n"));
}

function _isClosingComment(n: html.Node): boolean {
  return !!(n instanceof html.Comment && n.value && n.value === "/i18n");
}

function _getI18nAttr(p: html.Element): html.Attribute | null {
  return p.attrs.find(attr => attr.name === _I18N_ATTR) || null;
}

function _parseMessageMeta(i18n?: string): {meaning: string; description: string; id: string} {
  if (!i18n) return {meaning: "", description: "", id: ""};

  const idIndex = i18n.indexOf(ID_SEPARATOR);
  const descIndex = i18n.indexOf(MEANING_SEPARATOR);
  const [meaningAndDesc, id] = idIndex > -1 ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ""];
  const [meaning, description] =
    descIndex > -1 ? [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] : ["", meaningAndDesc];

  return {meaning, description, id};
}
