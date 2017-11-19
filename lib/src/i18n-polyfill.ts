import {
  Inject,
  Injectable,
  InjectionToken,
  LOCALE_ID,
  MissingTranslationStrategy,
  Optional,
  TRANSLATIONS,
  TRANSLATIONS_FORMAT
} from "@angular/core";
import {xliffDigest, xliffLoadToI18n} from "./serializers/xliff";
import {xliff2Digest, xliff2LoadToI18n} from "./serializers/xliff2";
import {xtbDigest, xtbLoadToI18n, xtbMapper} from "./serializers/xtb";
import {HtmlParser, TranslationBundle} from "./parser/html";
import {I18nMessagesById, serializeNodes} from "./serializers/serializer";
import {Message} from "./ast/i18n_ast";

export declare interface I18n {
  (def: string | I18nDef, params?: {[key: string]: any}): string;
}

export interface I18nDef {
  value: string;
  id?: string;
  meaning?: string;
  description?: string;
}

export const MISSING_TRANSLATION_STRATEGY = new InjectionToken<MissingTranslationStrategy>(
  "MissingTranslationStrategy"
);

/**
 * A speculative polyfill to use i18n code translations
 */
@Injectable()
export class I18n {
  constructor(
    @Inject(TRANSLATIONS_FORMAT) format: string,
    @Inject(TRANSLATIONS) translations: string,
    @Inject(LOCALE_ID) locale: string,
    @Optional()
    @Inject(MISSING_TRANSLATION_STRATEGY)
    missingTranslationStrategy: MissingTranslationStrategy = MissingTranslationStrategy.Warning
  ) {
    let loadFct: (content: string, url: string) => I18nMessagesById;
    let digest: (message: Message) => string;
    let createMapper = (message: Message) => null;
    format = (format || "xlf").toLowerCase();
    switch (format) {
      case "xtb":
        loadFct = xtbLoadToI18n;
        digest = xtbDigest;
        createMapper = xtbMapper;
        break;
      case "xliff2":
      case "xlf2":
        loadFct = xliff2LoadToI18n;
        digest = xliff2Digest;
        break;
      case "xliff":
      case "xlf":
        loadFct = xliffLoadToI18n;
        digest = xliffDigest;
        break;
      default:
        throw new Error(`Unknown translations format ${format}`);
    }
    const htmlParser = new HtmlParser();

    const translationsBundle = TranslationBundle.load(
      translations,
      "i18n",
      digest,
      createMapper,
      loadFct,
      missingTranslationStrategy
    );

    // todo use interpolation config
    return (def: string | I18nDef, params: {[key: string]: any} = {}) => {
      const content = typeof def === "string" ? def : def.value;
      const metadata = {};
      if (typeof def === "object") {
        metadata["id"] = def.id;
        metadata["meaning"] = def.meaning;
        metadata["description"] = def.description;
      }
      const htmlParserResult = htmlParser.parse(content, "", true);

      if (htmlParserResult.errors.length) {
        throw htmlParserResult.errors;
      }

      const mergedNodes = htmlParser.mergeTranslations(
        htmlParserResult.rootNodes,
        translationsBundle,
        params,
        metadata,
        ["wrapper"]
      );

      return serializeNodes(mergedNodes.rootNodes, locale, params).join("");
    };
  }
}
