import * as html from "../ast/ast";
import * as i18n from "../ast/i18n_ast";
import {I18nError} from "../ast/parse_util";
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from "../ast/interpolation_config";
import {createI18nMessageFactory} from "./i18n";
import {Parser, ParseTreeResult} from "../ast/parser";
import {getHtmlTagDefinition} from "../ast/html_tags";
import {I18nMessagesById, PlaceholderMapper} from "../serializers/serializer";
import {MissingTranslationStrategy} from "@angular/core";

const _I18N_ATTR = "i18n";

export interface MessageMetadata {
  meaning?: string;
  description?: string;
  id?: string;
}

export class HtmlParser extends Parser {
  constructor(private interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG) {
    super(getHtmlTagDefinition);
  }

  parse(source: string, url: string, parseExpansionForms = false): ParseTreeResult {
    return super.parse(source, url, parseExpansionForms, this.interpolationConfig);
  }

  /**
   * Extract translatable messages from an html AST
   */
  extractMessages(nodes: html.Node[]): ExtractionResult {
    const visitor = new Visitor(["wrapper"]);
    // Construct a single fake root element
    const wrapper = new html.Element("wrapper", [], nodes, undefined!, undefined, undefined);
    return visitor.extract(wrapper, this.interpolationConfig);
  }

  mergeTranslations(
    nodes: html.Node[],
    translations: TranslationBundle,
    params: {[key: string]: any},
    metadata?: MessageMetadata,
    implicitTags: string[] = []
  ): ParseTreeResult {
    const visitor = new Visitor(implicitTags);
    // Construct a single fake root element
    const wrapper = new html.Element("wrapper", [], nodes, undefined!, undefined, undefined);
    return visitor.merge(wrapper, translations, this.interpolationConfig, params, metadata);
  }
}

export class ExtractionResult {
  constructor(public messages: i18n.Message[], public errors: I18nError[]) {}
}

/**
 * A container for translated messages
 */
export class TranslationBundle {
  private i18nToHtml: I18nToHtmlVisitor;

  constructor(
    private i18nNodesByMsgId: {[msgId: string]: i18n.Node[]} = {},
    public digest: (m: i18n.Message) => string,
    interpolationConfig: InterpolationConfig,
    missingTranslationStrategy: MissingTranslationStrategy,
    public mapperFactory?: (m: i18n.Message) => PlaceholderMapper,
    console?: Console
  ) {
    this.i18nToHtml = new I18nToHtmlVisitor(
      i18nNodesByMsgId,
      digest,
      mapperFactory!,
      missingTranslationStrategy,
      interpolationConfig,
      console
    );
  }

  // Creates a `TranslationBundle` by parsing the given `content` with the `serializer`.
  static load(
    content: string,
    url: string,
    digest: (message: i18n.Message) => string,
    createNameMapper: (message: i18n.Message) => PlaceholderMapper | null,
    loadFct: (content: string, url: string) => I18nMessagesById,
    missingTranslationStrategy: MissingTranslationStrategy,
    interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG
  ): TranslationBundle {
    const i18nNodesByMsgId = loadFct(content, url);
    const digestFn = (m: i18n.Message) => digest(m);
    const mapperFactory = (m: i18n.Message) => createNameMapper(m)!;
    return new TranslationBundle(
      i18nNodesByMsgId,
      digestFn,
      interpolationConfig,
      missingTranslationStrategy,
      mapperFactory,
      console
    );
  }

  // Returns the translation as HTML nodes from the given source message.
  get(srcMsg: i18n.Message, params): html.Node[] {
    const htmlRes = this.i18nToHtml.convert(srcMsg, params);
    if (htmlRes.errors.length) {
      throw new Error(htmlRes.errors.join("\n"));
    }

    return htmlRes.nodes;
  }

  has(srcMsg: i18n.Message): boolean {
    return this.digest(srcMsg) in this.i18nNodesByMsgId;
  }
}

class I18nToHtmlVisitor implements i18n.Visitor {
  private _srcMsg: i18n.Message;
  private _contextStack: {msg: i18n.Message; mapper: (name: string) => string}[] = [];
  private _errors: I18nError[] = [];
  private _mapper: (name: string) => string;
  private _params: {[key: string]: any};
  private _paramKeys: string[];

  constructor(
    private _i18nNodesByMsgId: {[msgId: string]: i18n.Node[]} = {},
    private _digest: (m: i18n.Message) => string,
    private _mapperFactory: (m: i18n.Message) => PlaceholderMapper,
    private _missingTranslationStrategy: MissingTranslationStrategy,
    private _interpolationConfig?: InterpolationConfig,
    private _console?: Console
  ) {}

  convert(srcMsg: i18n.Message, params: {[key: string]: any}): {nodes: html.Node[]; errors: I18nError[]} {
    this._contextStack.length = 0;
    this._errors.length = 0;
    this._params = params;
    this._paramKeys = Object.keys(params);

    // i18n to text
    const text = this.convertToText(srcMsg);

    // text to html
    const url = srcMsg.nodes[0].sourceSpan.start.file.url;
    const htmlParser = new HtmlParser().parse(text, url, true);

    return {
      nodes: htmlParser.rootNodes,
      errors: [...this._errors, ...htmlParser.errors]
    };
  }

  visitText(text: i18n.Text, context?: any): string {
    return text.value;
  }

  visitContainer(container: i18n.Container, context?: any): any {
    return container.children.map(n => n.visit(this)).join("");
  }

  visitIcu(icu: i18n.Icu, context?: any): any {
    const cases = Object.keys(icu.cases).map(k => `${k} {${icu.cases[k].visit(this)}}`);

    // TODO(vicb): Once all format switch to using expression placeholders
    // we should throw when the placeholder is not in the source message
    const exp = this._srcMsg.placeholders.hasOwnProperty(icu.expression)
      ? this._srcMsg.placeholders[icu.expression]
      : icu.expression;

    return `{${exp}, ${icu.type}, ${cases.join(" ")}}`;
  }

  visitPlaceholder(ph: i18n.Placeholder, context?: any): string {
    const phName = this._mapper(ph.name);
    if (this._srcMsg.placeholders.hasOwnProperty(phName)) {
      return this.convertToValue(this._srcMsg.placeholders[phName]);
    }

    if (this._srcMsg.placeholderToMessage.hasOwnProperty(phName)) {
      return this.convertToText(this._srcMsg.placeholderToMessage[phName]);
    }

    this._addError(ph, `Unknown placeholder "${ph.name}"`);
    return "";
  }

  // Loaded message contains only placeholders (vs tag and icu placeholders).
  // However when a translation can not be found, we need to serialize the source message
  // which can contain tag placeholders
  visitTagPlaceholder(ph: i18n.TagPlaceholder, context?: any): string {
    const tag = `${ph.tag}`;
    const attrs = Object.keys(ph.attrs)
      .map(name => `${name}="${ph.attrs[name]}"`)
      .join(" ");
    if (ph.isVoid) {
      return `<${tag} ${attrs}/>`;
    }
    const children = ph.children.map((c: i18n.Node) => c.visit(this)).join("");
    return `<${tag} ${attrs}>${children}</${tag}>`;
  }

  // Loaded message contains only placeholders (vs tag and icu placeholders).
  // However when a translation can not be found, we need to serialize the source message
  // which can contain tag placeholders
  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): string {
    // An ICU placeholder references the source message to be serialized
    return this.convertToText(this._srcMsg.placeholderToMessage[ph.name]);
  }

  /**
   * Convert a source message to a translated text string:
   * - text nodes are replaced with their translation,
   * - placeholders are replaced with their content,
   * - ICU nodes are converted to ICU expressions.
   */
  private convertToText(srcMsg: i18n.Message): string {
    const id = this._digest(srcMsg);

    const mapper = this._mapperFactory ? this._mapperFactory(srcMsg) : null;
    let nodes: i18n.Node[];

    this._contextStack.push({msg: this._srcMsg, mapper: this._mapper});
    this._srcMsg = srcMsg;

    if (this._i18nNodesByMsgId.hasOwnProperty(id)) {
      // When there is a translation use its nodes as the source
      // And create a mapper to convert serialized placeholder names to internal names
      nodes = this._i18nNodesByMsgId[id];
      this._mapper = (name: string) => (mapper ? mapper.toInternalName(name)! : name);
    } else {
      // When no translation has been found
      // - report an error / a warning / nothing,
      // - use the nodes from the original message
      // - placeholders are already internal and need no mapper
      if (this._missingTranslationStrategy === MissingTranslationStrategy.Error) {
        this._addError(srcMsg.nodes[0], `Missing translation for message "${id}"`);
      } else if (this._console && this._missingTranslationStrategy === MissingTranslationStrategy.Warning) {
        this._console.warn(`Missing translation for message "${id}"`);
      }
      nodes = srcMsg.nodes;
      this._mapper = (name: string) => name;
    }
    const text = nodes.map(node => node.visit(this)).join("");
    const context = this._contextStack.pop()!;
    this._srcMsg = context.msg;
    this._mapper = context.mapper;
    return text;
  }

  private convertToValue(placeholder: string): string {
    const param = placeholder.replace(this._interpolationConfig.start, "").replace(this._interpolationConfig.end, "");
    return this._paramKeys.indexOf(param) !== -1 ? this._params[param] : placeholder;
  }

  private _addError(el: i18n.Node, msg: string) {
    this._errors.push(new I18nError(el.sourceSpan, msg));
  }
}

enum VisitorMode {
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
class Visitor implements html.Visitor {
  private depth: number;

  // <el i18n>...</el>
  private inI18nNode: boolean;
  private inImplicitNode: boolean;

  // <!--i18n-->...<!--/i18n-->
  private inI18nBlock: boolean;
  private blockChildren: html.Node[] = [];
  private blockStartDepth: number;

  // {<icu message>}
  private inIcu: boolean;

  // set to void 0 when not in a section
  private msgCountAtSectionStart: number | undefined;
  private errors: I18nError[];
  private mode: VisitorMode;

  // VisitorMode.Extract only
  private messages: i18n.Message[];

  // VisitorMode.Merge only
  private translations: TranslationBundle;
  private createI18nMessage: (msg: html.Node[], meaning: string, description: string, id: string) => i18n.Message;
  private metadata: MessageMetadata;
  private params: {[key: string]: any};

  constructor(private _implicitTags: string[] = []) {}

  /**
   * Extracts the messages from the tree
   */
  extract(node: html.Node, interpolationConfig: InterpolationConfig): ExtractionResult {
    this.init(VisitorMode.Extract, interpolationConfig);

    node.visit(this, null);

    if (this.inI18nBlock) {
      this._reportError(node, "Unclosed block");
    }

    return new ExtractionResult(this.messages, this.errors);
  }

  /**
   * Returns a tree where all translatable nodes are translated
   */
  merge(
    node: html.Node,
    translations: TranslationBundle,
    interpolationConfig: InterpolationConfig,
    params: {[key: string]: any},
    metadata: MessageMetadata = {}
  ): ParseTreeResult {
    this.init(VisitorMode.Merge, interpolationConfig, params);
    this.translations = translations;
    this.metadata = metadata;

    const translatedNode = node.visit(this, null);

    if (this.inI18nBlock) {
      this._reportError(node, "Unclosed block");
    }

    return new ParseTreeResult(translatedNode.children, this.errors);
  }

  visitExpansionCase(icuCase: html.ExpansionCase, context: any): any {
    // Parse cases for translatable html attributes
    const expression = html.visitAll(this, icuCase.expression, context);

    if (this.mode === VisitorMode.Merge) {
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
    this.mayBeAddBlockChildren(icu);

    const wasInIcu = this.inIcu;

    if (!this.inIcu) {
      // nested ICU messages should not be extracted but top-level translated as a whole
      if (this.isInTranslatableSection) {
        this.addMessage([icu]);
      }
      this.inIcu = true;
    }

    const cases = html.visitAll(this, icu.cases, context);

    if (this.mode === VisitorMode.Merge) {
      icu = new html.Expansion(icu.switchValue, icu.type, cases, icu.sourceSpan, icu.switchValueSourceSpan);
    }

    this.inIcu = wasInIcu;

    return icu;
  }

  visitComment(comment: html.Comment, context: any): any {
    return;
  }

  visitText(text: html.Text, context: any): html.Text {
    if (this.isInTranslatableSection) {
      this.mayBeAddBlockChildren(text);
    }
    return text;
  }

  visitElement(el: html.Element, context: any): html.Element | null {
    this.mayBeAddBlockChildren(el);
    this.depth++;
    const wasInI18nNode = this.inI18nNode;
    const wasInImplicitNode = this.inImplicitNode;
    let childNodes: html.Node[] = [];
    let translatedChildNodes: html.Node[] = undefined!;

    // Extract:
    // - top level nodes with the (implicit) "i18n" attribute if not already in a section
    // - ICU messages
    const i18nAttr = getI18nAttr(el);
    const isImplicit = this._implicitTags.some(tag => el.name === tag) && !this.inIcu && !this.isInTranslatableSection;
    const isTopLevelImplicit = !wasInImplicitNode && isImplicit;
    this.inImplicitNode = wasInImplicitNode || isImplicit;
    if (!this.isInTranslatableSection && !this.inIcu) {
      if (i18nAttr || isTopLevelImplicit) {
        this.inI18nNode = true;
        const message = this.addMessage(el.children, this.metadata)!;
        translatedChildNodes = this.translateMessage(el, message);
      }

      if (this.mode === VisitorMode.Extract) {
        const isTranslatable = i18nAttr || isTopLevelImplicit;
        if (isTranslatable) {
          this.openTranslatableSection(el);
        }
        html.visitAll(this, el.children);
        if (isTranslatable) {
          this._closeTranslatableSection(el, el.children);
        }
      }
    } else {
      if (i18nAttr || isTopLevelImplicit) {
        this._reportError(el, "Could not mark an element as translatable inside a translatable section");
      }

      if (this.mode === VisitorMode.Extract) {
        // Descend into child nodes for extraction
        html.visitAll(this, el.children);
      }
    }

    if (this.mode === VisitorMode.Merge) {
      const visitNodes = translatedChildNodes || el.children;
      visitNodes.forEach(child => {
        const visited = child.visit(this, context);
        if (visited && !this.isInTranslatableSection) {
          // Do not add the children from translatable sections (= i18n blocks here)
          // They will be added later in this loop when the block closes (i.e. on `<!-- /i18n -->`)
          childNodes = childNodes.concat(visited);
        }
      });
    }

    this.depth--;
    this.inI18nNode = wasInI18nNode;
    this.inImplicitNode = wasInImplicitNode;

    if (this.mode === VisitorMode.Merge) {
      return new html.Element(el.name, [], childNodes, el.sourceSpan, el.startSourceSpan, el.endSourceSpan);
    }
    return null;
  }

  visitAttribute(attribute: html.Attribute, context: any): any {
    throw new Error("unreachable code");
  }

  private init(mode: VisitorMode, interpolationConfig: InterpolationConfig, params: {[key: string]: any} = {}): void {
    this.mode = mode;
    this.inI18nBlock = false;
    this.inI18nNode = false;
    this.depth = 0;
    this.inIcu = false;
    this.msgCountAtSectionStart = undefined;
    this.errors = [];
    this.messages = [];
    this.inImplicitNode = false;
    this.createI18nMessage = createI18nMessageFactory(interpolationConfig);
    this.params = params;
  }

  // add a translatable message
  private addMessage(ast: html.Node[], {meaning = "", description = "", id = ""} = {}): i18n.Message | null {
    if (
      ast.length === 0 ||
      (ast.length === 1 && ast[0] instanceof html.Attribute && !(ast[0] as html.Attribute).value)
    ) {
      // Do not create empty messages
      return null;
    }

    const message = this.createI18nMessage(ast, meaning, description, id);
    this.messages.push(message);
    return message;
  }

  // Translates the given message given the `TranslationBundle`
  // This is used for translating elements / blocks - see `_translateAttributes` for attributes
  // no-op when called in extraction mode (returns [])
  private translateMessage(el: html.Node, message: i18n.Message): html.Node[] {
    if (message && this.mode === VisitorMode.Merge) {
      const nodes = this.translations.get(message, this.params);
      if (nodes) {
        return nodes;
      }

      this._reportError(el, `Translation unavailable for message id="${this.translations.digest(message)}"`);
    }

    return [];
  }

  /**
   * Add the node as a child of the block when:
   * - we are in a block,
   * - we are not inside a ICU message (those are handled separately),
   * - the node is a "direct child" of the block
   */
  private mayBeAddBlockChildren(node: html.Node): void {
    if (this.inI18nBlock && !this.inIcu && this.depth === this.blockStartDepth) {
      this.blockChildren.push(node);
    }
  }

  /**
   * Marks the start of a section, see `_closeTranslatableSection`
   */
  private openTranslatableSection(node: html.Node): void {
    if (this.isInTranslatableSection) {
      this._reportError(node, "Unexpected section start");
    } else {
      this.msgCountAtSectionStart = this.messages.length;
    }
  }

  /**
   * A translatable section could be:
   * - the content of translatable element,
   * - nodes between `<!-- i18n -->` and `<!-- /i18n -->` comments
   */
  private get isInTranslatableSection(): boolean {
    return this.msgCountAtSectionStart !== void 0;
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
    if (!this.isInTranslatableSection) {
      this._reportError(node, "Unexpected section end");
      return;
    }

    const startIndex = this.msgCountAtSectionStart;
    const significantChildren: number = directChildren.reduce(
      (count: number, n: html.Node): number => count + (n instanceof html.Comment ? 0 : 1),
      0
    );

    if (significantChildren === 1) {
      for (let i = this.messages.length - 1; i >= startIndex!; i--) {
        const ast = this.messages[i].nodes;
        if (!(ast.length === 1 && ast[0] instanceof i18n.Text)) {
          this.messages.splice(i, 1);
          break;
        }
      }
    }

    this.msgCountAtSectionStart = undefined;
  }

  private _reportError(node: html.Node, msg: string): void {
    this.errors.push(new I18nError(node.sourceSpan!, msg));
  }
}

function getI18nAttr(p: html.Element): html.Attribute | null {
  return p.attrs.find(attr => attr.name === _I18N_ATTR) || null;
}
