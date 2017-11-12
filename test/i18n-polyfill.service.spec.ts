import {TestBed} from "@angular/core/testing";
import {TRANSLATIONS, TRANSLATIONS_FORMAT} from "@angular/core";
import {I18n} from "../src/i18n-polyfill.service";
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

describe("Polyfill", () => {
  let test: I18n;

  beforeEach(() => {
    const i = TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [{provide: TRANSLATIONS_FORMAT, useValue: "xlf"}, {provide: TRANSLATIONS, useValue: XLIFF}, I18n]
    });
    test = TestBed.get(I18n);

    // fixture = TestBed.createComponent(SampleComponent);
    //
    // comp = fixture.componentInstance; // BannerComponent test instance
    // query for the title <h1> by CSS element selector
    // de = fixture.debugElement.query(By.css("h1"));
    // el = de.nativeElement;
  });

  xit("Should return content if unable to find a translation", () => {
    expect(test("anything")).toBe("anything");
  });

  xit("Should return translated content if it finds the translations", () => {
    expect(test("This is a test message {sex, select, other {deeply nested}}")).toBe(
      "Ceci est un message de test profondément imbriqué"
    );
  });

  it("Should support custom ids", () => {
    expect(
      test({
        value: "Custom message {sex, select, other {deeply nested}} !!",
        id: "custom"
      })
    ).toBe("profondément imbriqué et personnalisé !!");
  });
});
