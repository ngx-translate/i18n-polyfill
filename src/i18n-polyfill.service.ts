import {
  COMPILER_OPTIONS,
  CompilerOptions,
  Inject,
  Injectable,
  LOCALE_ID,
  MissingTranslationStrategy,
  TRANSLATIONS,
  TRANSLATIONS_FORMAT
} from "@angular/core";
import {xliffDigest, xliffLoadToI18n} from "./serializers/xliff";
import {xliff2Digest, xliff2LoadToI18n} from "./serializers/xliff2";
import {xtbDigest, xtbLoadToI18n} from "./serializers/xtb";
import {MessageBundle} from "./parser/message-bundle";
import {DEFAULT_INTERPOLATION_CONFIG} from "./ast/interpolation_config";
import {HtmlParser} from "./parser/html";
import {I18nMessagesById, IcuContent, IcuContentStr} from "./serializers/serializer";
import * as i18n from "./ast/i18n_ast";
import {I18nPluralPipe, I18nSelectPipe, NgLocaleLocalization} from "@angular/common";

export declare interface I18n {
  (def: string | I18nDef, params?: {[key: string]: any}): string;
}

export interface I18nDef {
  value: string;
  id?: string;
  meaning?: string;
  description?: string;
}

/**
 * A speculative polyfill to use i18n code translations
 */
@Injectable()
export class I18n {
  // serializer: Serializer;
  // messages: I18nMessagesById;

  constructor(
    @Inject(TRANSLATIONS_FORMAT) format: string,
    @Inject(TRANSLATIONS) translations: string,
    @Inject(COMPILER_OPTIONS) compilerOptions: CompilerOptions,
    @Inject(LOCALE_ID) locale: string
  ) {
    format = (format || "xlf").toLowerCase();
    let decoded: I18nMessagesById, digest;
    switch (format) {
      case "xtb":
        decoded = xtbLoadToI18n(translations);
        digest = xtbDigest;
        break;
      case "xliff2":
      case "xlf2":
        decoded = xliff2LoadToI18n(translations);
        digest = xliff2Digest;
        break;
      case "xliff":
      case "xlf":
      default:
        decoded = xliffLoadToI18n(translations);
        digest = xliffDigest;
        break;
    }

    const htmlParser = new HtmlParser();
    const i18nSelectPipe = new I18nSelectPipe();
    const i18nPluralPipe = new I18nPluralPipe(new NgLocaleLocalization(locale));

    return function(def: string | I18nDef, params: {[key: string]: any} = {}) {
      const content = typeof def === "string" ? def : def.value;
      // todo use interpolation config
      const htmlParserResult = htmlParser.parse(content, "", true, DEFAULT_INTERPOLATION_CONFIG);

      if (htmlParserResult.errors.length) {
        throw htmlParserResult.errors;
      }

      const {messages} = htmlParser.extractMessages(htmlParserResult.rootNodes, DEFAULT_INTERPOLATION_CONFIG);
      const translations: (string | IcuContent | IcuContentStr)[] = [];

      function err(value: any) {
        const error = `Unable to find translation for message: ${value}`;
        switch (compilerOptions.missingTranslation || MissingTranslationStrategy.Warning) {
          case MissingTranslationStrategy.Error:
            throw new Error(error);
          case MissingTranslationStrategy.Warning:
          default:
            console.warn(error);
            break;
        }
      }

      // the last message is always the top level one
      const message = messages[messages.length - 1];

      if (typeof def === "object" && def.id) {
        message.id = def.id;
      }

      const id = message.id || digest(message);
      const match = decoded[id];
      if (match) {
        if (match.length > 1) {
          console.log(match);
          message.nodes.forEach((node: i18n.Node, index: number) => {
            console.log(node.sourceSpan);
            if (node instanceof i18n.Text) {
              translations.push(match[index]);
            } else if (node instanceof i18n.IcuPlaceholder) {
              const placeholderMsg = message.placeholderToMessage[node.name];
              const placeholderId = digest(placeholderMsg);
              const placeholderMatch = decoded[placeholderId];
              if (placeholderMatch) {
                // todo we should actually detect if an ICU is a placeholder or not
                placeholderMatch.forEach((placeholder: IcuContent) => {
                  const index = translations.indexOf(placeholder);
                  if (index !== -1) {
                    translations.splice(index, 1);
                  }
                  placeholder.expression = placeholderMsg.placeholders[placeholder.expression];
                  Object.keys(placeholder.cases).forEach((key: string) => {
                    placeholder.cases[key] = <any>placeholder.cases[key].map(node => node.toString());
                  });
                  translations.push(placeholder);
                });
              } else {
                err(match[index]);
              }
            } else {
              throw new Error(`Unhandled node type: ${node}`);
            }
          });
        } else {
          translations.push(...match);
        }
      }

      if (translations.length) {
        let res = "";
        translations.forEach((value: string | IcuContentStr) => {
          if (typeof value === "string") {
            res += value;
          } else {
            switch (value.type) {
              case "select":
                res += i18nSelectPipe.transform(params[value.expression] || "", value.cases);
                break;
              case "plural":
                res += i18nPluralPipe.transform(params[value.expression], value.cases);
                break;
            }
          }
        });
        return res;
      }

      // if (decoded[id]) {
      //   return decoded[id];
      // }

      err(content);

      return content;
    };
  }
}
//
//
// export declare interface I18n {
//   __defs: {[key: string]: {[key: string]: I18nDef}};
//
//   (str: string | I18nDef, params?: any[] | { [key: string]: any }): string;
//
//   // example for later, not used yet
//   html(str: string): string;
// }
//
// /**
//  * Based on goog.getMsg
//  * Use parameters with {$key} with key in params as {key: value}
//  * Or use numerical parameters like {$0}
//  * Ref: https://github.com/google/closure-library/blob/db9bc1a2e71d4b6ee8f57eebe37eb0c6494e9d7e/closure/goog/base.js#L2379-L2387
//  * @param str message to translate
//  * @param params an object or array of parameters
//  */
// export const I18n: I18n = function(def: string | I18nDef, params?: any[] | { [key: string]: any }): string {
//   let msg: string;
//   if(typeof def === 'string') {
//     msg = def;
//   } else {
//     const translatedMsg = I18n.__defs[def.scope || 'default'][def.id];
//     msg = typeof translatedMsg.value !== 'undefined' ? translatedMsg.value : translatedMsg.toString();
//   }
//   if(params) {
//     msg = msg.replace(/\{\$([^}]+)}/g, function(match, key) {
//       return (params != null && key in params) ? params[key] : match;
//     });
//   }
//   return msg;
// } as I18n;
//
// export function initI18n(...defClasses: I18nDefs[]) {
//   const defs: {[key: string]: {[key: string]: I18nDef}} = {};
//   for(const defClass of defClasses) {
//     for(const key in defClass) {
//       if(defClass.hasOwnProperty(key)) {
//         const def = defClass[key];
//         if(!defs[def.scope]) {
//           defs[def.scope] = {};
//         }
//         if(!def.id) {
//           def.id = key;
//         }
//         defs[def.scope][def.id] = def;
//       }
//     }
//   }
//   I18nService['__defs'] = defs;
//   console.log(defs);
//   return I18nService;
// }

// export const test = new I18n() as I18N;
