import {TestBed} from "@angular/core/testing";
import {LOCALE_ID, MissingTranslationStrategy, StaticProvider, TRANSLATIONS, TRANSLATIONS_FORMAT} from "@angular/core";
import {I18n, MISSING_TRANSLATION_STRATEGY} from "../lib/public_api";
import {CommonModule} from "@angular/common";

const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="f4661fab0bda1dae3620088f290a8f086a6ca26e" datatype="html">
        <source>{VAR_SELECT, select, other {deeply nested} }</source>
        <target>{VAR_SELECT, select, other {profondément imbriqué} }</target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="78e9f3aab47c6cf393131413e0c51dedaa37766b" datatype="html">
        <source>This is a test <x id="INTERPOLATION" equiv-text="{{ok}}"/> !</source>
        <target>Ceci est un test <x id="INTERPOLATION" equiv-text="{{ok}}"/> !</target>
        <context-group purpose="location">
          <context context-type="sourcefile">src/app/app.component.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="9161da7236814a71c5fec94eb42161651f6b4967" datatype="html">
        <source>This is a test message <x id="ICU" equiv-text="{sex, select, other {...}}"/></source>
        <target>Ceci est un message de test <x id="ICU" equiv-text="{sex, select, other {...}}"/></target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="custom" datatype="html">
        <source>Custom message <x id="ICU" equiv-text="{sex, select, other {...}}"/> !!</source>
        <target><x id="ICU" equiv-text="{sex, select, other {...}}"/> et personnalisé !!</target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
    </body>
  </file>
</xliff>
`;

function getService(providers: StaticProvider[] = []) {
  TestBed.configureTestingModule({
    imports: [CommonModule],
    providers: [
      ...providers,
      {provide: TRANSLATIONS_FORMAT, useValue: "xlf"},
      {provide: TRANSLATIONS, useValue: XLIFF},
      {provide: LOCALE_ID, useValue: "fr"},
      I18n
    ]
  });
  return TestBed.get(I18n);
}

describe("Polyfill", () => {
  it("Should return content if unable to find a translation", () => {
    const i18nService = getService();
    expect(i18nService("anything")).toBe("anything");
  });

  it("Should throw is missing translation strategy is Error & if unable to find a translation", () => {
    const i18nService = getService([
      {provide: MISSING_TRANSLATION_STRATEGY, useValue: MissingTranslationStrategy.Error}
    ]);
    expect(() => i18nService("anything")).toThrow(/Missing translation for message/);
  });

  it("Should return translated content if it finds the translations", () => {
    const i18nService = getService();
    expect(i18nService("This is a test message {sex, select, other {deeply nested}}")).toBe(
      "Ceci est un message de test profondément imbriqué"
    );
  });

  it("Should support custom ids", () => {
    const i18nService = getService();
    expect(
      i18nService({
        value: "Custom message {sex, select, other {deeply nested}} !!",
        id: "custom"
      })
    ).toBe("profondément imbriqué et personnalisé !!");
  });

  it("Should support parameters", () => {
    const i18nService = getService();
    expect(i18nService("This is a test {{ok}} !", {ok: "\\o/"})).toBe("Ceci est un test \\o/ !");
  });
});
