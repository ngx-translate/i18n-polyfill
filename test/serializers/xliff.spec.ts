/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {xliffDigest, xliffLoadToI18n, xliffLoadToXml, xliffWrite} from "../../lib/src/serializers/xliff";
import {MessageBundle} from "../../lib/extractor/src/message-bundle";

const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="983775b9a51ce14b036be72d4cfd65d68d64e231" datatype="html">
        <source>translatable attribute</source>
        <target>etubirtta elbatalsnart</target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="ec1d033f2436133c14ab038286c4f5df4697484a" datatype="html">
        <source>translatable element <x id="START_BOLD_TEXT" ctype="b"/>with placeholders<x id="CLOSE_BOLD_TEXT" ctype="b"/> <x id="INTERPOLATION"/></source>
        <target><x id="INTERPOLATION"/> footnemele elbatalsnart <x id="START_BOLD_TEXT" ctype="x-b"/>sredlohecalp htiw<x id="CLOSE_BOLD_TEXT" ctype="x-b"/></target>
      </trans-unit>
      <trans-unit id="e2ccf3d131b15f54aa1fcf1314b1ca77c14bfcc2" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {<x id="START_PARAGRAPH" ctype="x-p"/>test<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} }</source>
        <target>{VAR_PLURAL, plural, =0 {<x id="START_PARAGRAPH" ctype="x-p"/>TEST<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} }</target>
      </trans-unit>
      <trans-unit id="db3e0a6a5a96481f60aec61d98c3eecddef5ac23" datatype="html">
        <source>foo</source>
        <target>oof</target>
      </trans-unit>
      <trans-unit id="i" datatype="html">
        <source>foo</source>
        <target>toto</target>
      </trans-unit>
      <trans-unit id="bar" datatype="html">
        <source>foo</source>
        <target>tata</target>
      </trans-unit>
      <trans-unit id="d7fa2d59aaedcaa5309f13028c59af8c85b8c49d" datatype="html">
        <source><x id="LINE_BREAK" ctype="lb"/><x id="TAG_IMG" ctype="image"/><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/></source>
        <target><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/><x id="TAG_IMG" ctype="image"/><x id="LINE_BREAK" ctype="lb"/></target>
      </trans-unit>            
      <trans-unit id="empty target" datatype="html">
        <source><x id="LINE_BREAK" ctype="lb"/><x id="TAG_IMG" ctype="image"/><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/></source>
        <target/>
      </trans-unit>
      <trans-unit id="baz" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>deeply nested<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>profondément imbriqué<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } }</target>
      </trans-unit>
      <trans-unit id="52ffa620dcd76247a56d5331f34e73f340a43cdb" datatype="html">
        <source>Test: <x id="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></source>
        <target>Test: <x id="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></target>
      </trans-unit>
      <trans-unit id="1503afd0ccc20ff01d5e2266a9157b7b342ba494" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>deeply nested<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } =other {a lot} }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>profondément imbriqué<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } =other {beaucoup} }</target>
      </trans-unit>
      <trans-unit id="fcfa109b0e152d4c217dbc02530be0bcb8123ad1" datatype="html">
        <source>multi
lines</source>
        <target>multi
lignes</target>
      </trans-unit>
    </body>
  </file>
</xliff>
`;

describe("Xliff serializer", () => {
  it("should decode xliff", () => {
    const loaded = xliffLoadToI18n(XLIFF);
    expect(loaded["1503afd0ccc20ff01d5e2266a9157b7b342ba494"]).toBeDefined();
  });

  it("should write xliff", () => {
    const messageBundle = new MessageBundle("en");
    messageBundle.updateFromTemplate("This is a test message {sex, select, other {deeply nested}}", "file.ts");
    expect(messageBundle.write(xliffWrite, xliffDigest)).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="9161da7236814a71c5fec94eb42161651f6b4967" datatype="html">
        <source>This is a test message <x id="ICU" equiv-text="{sex, select, other {...}}"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="f4661fab0bda1dae3620088f290a8f086a6ca26e" datatype="html">
        <source>{VAR_SELECT, select, other {deeply nested} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
    </body>
  </file>
</xliff>
`);
  });

  it("should write xliff with i18nDef", () => {
    const messageBundle = new MessageBundle("en");
    messageBundle.updateFromTemplate(
      {
        value: "This is a test message {sex, select, other {deeply nested}}",
        id: "customId",
        meaning: "Custom meaning",
        description: "Custom desc"
      },
      "file.ts"
    );
    expect(messageBundle.write(xliffWrite, xliffDigest)).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="customId" datatype="html">
        <source>This is a test message <x id="ICU" equiv-text="{sex, select, other {...}}"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
        <note priority="1" from="description">Custom desc</note>
        <note priority="1" from="meaning">Custom meaning</note>
      </trans-unit>
      <trans-unit id="f4661fab0bda1dae3620088f290a8f086a6ca26e" datatype="html">
        <source>{VAR_SELECT, select, other {deeply nested} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
    </body>
  </file>
</xliff>
`);
  });

  it("should write xliff with merged content", () => {
    const messageBundle = new MessageBundle("en");
    messageBundle.updateFromTemplate("This is a test message {sex, select, other {deeply nested}}", "file.ts");
    expect(messageBundle.write(xliffWrite, xliffDigest, xliffLoadToXml(XLIFF)))
      .toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="983775b9a51ce14b036be72d4cfd65d68d64e231" datatype="html">
        <source>translatable attribute</source>
        <target>etubirtta elbatalsnart</target>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit><trans-unit id="ec1d033f2436133c14ab038286c4f5df4697484a" datatype="html">
        <source>translatable element <x id="START_BOLD_TEXT" ctype="b"/>with placeholders<x id="CLOSE_BOLD_TEXT" ctype="b"/> <x id="INTERPOLATION"/></source>
        <target><x id="INTERPOLATION"/> footnemele elbatalsnart <x id="START_BOLD_TEXT" ctype="x-b"/>sredlohecalp htiw<x id="CLOSE_BOLD_TEXT" ctype="x-b"/></target>
      </trans-unit><trans-unit id="e2ccf3d131b15f54aa1fcf1314b1ca77c14bfcc2" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {<x id="START_PARAGRAPH" ctype="x-p"/>test<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} }</source>
        <target>{VAR_PLURAL, plural, =0 {<x id="START_PARAGRAPH" ctype="x-p"/>TEST<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} }</target>
      </trans-unit><trans-unit id="db3e0a6a5a96481f60aec61d98c3eecddef5ac23" datatype="html">
        <source>foo</source>
        <target>oof</target>
      </trans-unit><trans-unit id="i" datatype="html">
        <source>foo</source>
        <target>toto</target>
      </trans-unit><trans-unit id="bar" datatype="html">
        <source>foo</source>
        <target>tata</target>
      </trans-unit><trans-unit id="d7fa2d59aaedcaa5309f13028c59af8c85b8c49d" datatype="html">
        <source><x id="LINE_BREAK" ctype="lb"/><x id="TAG_IMG" ctype="image"/><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/></source>
        <target><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/><x id="TAG_IMG" ctype="image"/><x id="LINE_BREAK" ctype="lb"/></target>
      </trans-unit><trans-unit id="empty target" datatype="html">
        <source><x id="LINE_BREAK" ctype="lb"/><x id="TAG_IMG" ctype="image"/><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/></source>
        <target/>
      </trans-unit><trans-unit id="baz" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>deeply nested<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>profondément imbriqué<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } }</target>
      </trans-unit><trans-unit id="52ffa620dcd76247a56d5331f34e73f340a43cdb" datatype="html">
        <source>Test: <x id="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></source>
        <target>Test: <x id="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></target>
      </trans-unit><trans-unit id="1503afd0ccc20ff01d5e2266a9157b7b342ba494" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>deeply nested<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } =other {a lot} }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>profondément imbriqué<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} } } =other {beaucoup} }</target>
      </trans-unit><trans-unit id="fcfa109b0e152d4c217dbc02530be0bcb8123ad1" datatype="html">
        <source>multi
lines</source>
        <target>multi
lignes</target>
      </trans-unit>
      <trans-unit id="9161da7236814a71c5fec94eb42161651f6b4967" datatype="html">
        <source>This is a test message <x id="ICU" equiv-text="{sex, select, other {...}}"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="f4661fab0bda1dae3620088f290a8f086a6ca26e" datatype="html">
        <source>{VAR_SELECT, select, other {deeply nested} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">file.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
    </body>
  </file>
</xliff>
`);
  });
});
