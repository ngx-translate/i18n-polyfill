import {getAst, getFileContent} from "../lib/extractor/src/extractor";

describe("Extractor", () => {
  it("should extract AST", () => {
    const messages = getAst(["example/src/**/*.ts"]);
    const url = "example/src/app/app.component.ts";
    expect(messages[url]).toBeDefined();
    expect(messages[url]).toEqual([
      {description: "Custom desc", id: "customId", meaning: "Custom meaning", value: "Some value"},
      "This is a test {{ok}} !",
      "another test ^_^"
    ]);
  });

  it("should generate content", () => {
    const messages = getAst(["example/src/**/*.ts"]);
    const content = getFileContent(messages, "xlf");
    expect(content).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="customId" datatype="html">
        <source>Some value</source>
        <context-group purpose="location">
          <context context-type="sourcefile">example/src/app/app.component.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
        <note priority="1" from="description">Custom desc</note>
        <note priority="1" from="meaning">Custom meaning</note>
      </trans-unit>
      <trans-unit id="78e9f3aab47c6cf393131413e0c51dedaa37766b" datatype="html">
        <source>This is a test <x id="INTERPOLATION" equiv-text="{{ok}}"/> !</source>
        <context-group purpose="location">
          <context context-type="sourcefile">example/src/app/app.component.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="f9ec330a3324eff5b27f13b259df96618c503488" datatype="html">
        <source>another test ^_^</source>
        <context-group purpose="location">
          <context context-type="sourcefile">example/src/app/app.component.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
    </body>
  </file>
</xliff>
`);
  });

  it("should use locale specified", () => {
    const messages = getAst(["example/src/**/*.ts"]);
    const content = getFileContent(messages, null, "xlf", "de");
    expect(content).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="de" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="customId" datatype="html">
        <source>Some value</source>
        <context-group purpose="location">
          <context context-type="sourcefile">example/src/app/app.component.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
        <note priority="1" from="description">Custom desc</note>
        <note priority="1" from="meaning">Custom meaning</note>
      </trans-unit>
      <trans-unit id="78e9f3aab47c6cf393131413e0c51dedaa37766b" datatype="html">
        <source>This is a test <x id="INTERPOLATION" equiv-text="{{ok}}"/> !</source>
        <context-group purpose="location">
          <context context-type="sourcefile">example/src/app/app.component.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="f9ec330a3324eff5b27f13b259df96618c503488" datatype="html">
        <source>another test ^_^</source>
        <context-group purpose="location">
          <context context-type="sourcefile">example/src/app/app.component.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
    </body>
  </file>
</xliff>
`);
  });

  it("should merge content", () => {
    const messages = getAst(["example/src/**/*.ts"]);
    const content = getFileContent(messages, "example/src/i18n/source.xlf", "xlf");
    expect(content).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="2d6e40995b5d5bec0e172fd29e05f869645e7c5f" datatype="html">
        <source>
    Welcome to <x id="INTERPOLATION" equiv-text="{{title}}"/>!
  </source>
        <context-group purpose="location">
          <context context-type="sourcefile">app\\app.component.ts</context>
          <context context-type="linenumber">3</context>
        </context-group>
      </trans-unit><trans-unit id="54f29f9a6da150fc7c4fcd0b7e6d9a1b0314fd35" datatype="html">
        <source>Here are some links to help you start: </source>
        <context-group purpose="location">
          <context context-type="sourcefile">app\\app.component.ts</context>
          <context context-type="linenumber">8</context>
        </context-group>
      </trans-unit><trans-unit id="78e9f3aab47c6cf393131413e0c51dedaa37766b" datatype="html">
        <source>This is a test <x id="INTERPOLATION" equiv-text="{{ok}}"/> !</source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/app/app.component.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit><trans-unit id="f9ec330a3324eff5b27f13b259df96618c503488" datatype="html">
        <source>another test ^_^</source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/app/app.component.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit><trans-unit id="0cd84cefa60f8c0e31d02904644807a6" datatype="html">
        <source>special &amp; characters</source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/app/app.component.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="customId" datatype="html">
        <source>Some value</source>
        <context-group purpose="location">
          <context context-type="sourcefile">example/src/app/app.component.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
        <note priority="1" from="description">Custom desc</note>
        <note priority="1" from="meaning">Custom meaning</note>
      </trans-unit>
    </body>
  </file>
</xliff>
`);
  });
});
