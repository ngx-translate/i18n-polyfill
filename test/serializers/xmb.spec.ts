/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {xmbDigest, xmbLoadToXml, xmbMapper, xmbWrite} from "../../lib/src/serializers/xmb";
import {MessageBundle} from "../../lib/extractor/src/message-bundle";

const XMB = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE messagebundle [
<!ELEMENT messagebundle (msg)*>
<!ATTLIST messagebundle class CDATA #IMPLIED>

<!ELEMENT msg (#PCDATA|ph|source)*>
<!ATTLIST msg id CDATA #IMPLIED>
<!ATTLIST msg seq CDATA #IMPLIED>
<!ATTLIST msg name CDATA #IMPLIED>
<!ATTLIST msg desc CDATA #IMPLIED>
<!ATTLIST msg meaning CDATA #IMPLIED>
<!ATTLIST msg obsolete (obsolete) #IMPLIED>
<!ATTLIST msg xml:space (default|preserve) "default">
<!ATTLIST msg is_hidden CDATA #IMPLIED>

<!ELEMENT source (#PCDATA)>

<!ELEMENT ph (#PCDATA|ex)*>
<!ATTLIST ph name CDATA #REQUIRED>

<!ELEMENT ex (#PCDATA)>
]>
<messagebundle>
  <msg id="7056919470098446707"><source>file.ts:3</source>translatable element <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>with placeholders<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph> <ph name="INTERPOLATION"><ex>{{ interpolation}}</ex></ph></msg>
  <msg id="2981514368455622387"><source>file.ts:4</source>{VAR_PLURAL, plural, =0 {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>test<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>} }</msg>
  <msg id="7999024498831672133" desc="d" meaning="m"><source>file.ts:5</source>foo</msg>
  <msg id="i" desc="d" meaning="m"><source>file.ts:6</source>foo</msg>
  <msg id="bar"><source>file.ts:7</source>foo</msg>
  <msg id="baz"><source>file.ts:8</source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>deeply nested<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>} } } }</msg>
  <msg id="6997386649824869937"><source>file.ts:9</source>Test: <ph name="ICU"><ex>{ count, plural, =0 {...} =other {...}}</ex></ph></msg>
  <msg id="5229984852258993423"><source>file.ts:9</source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>deeply nested<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>} } } =other {a lot} }</msg>
  <msg id="2340165783990709777"><source>file.ts:10,11</source>multi
lines</msg>
</messagebundle>
`;

describe("Xmb serializer", () => {
  it("should write xmb", () => {
    const messageBundle = new MessageBundle("en");
    messageBundle.updateFromTemplate("This is a test message {sex, select, other {deeply nested}}", "file.ts");
    expect(messageBundle.write(xmbWrite, xmbDigest, {}, xmbMapper)).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE messagebundle [
<!ELEMENT messagebundle (msg)*>
<!ATTLIST messagebundle class CDATA #IMPLIED>

<!ELEMENT msg (#PCDATA|ph|source)*>
<!ATTLIST msg id CDATA #IMPLIED>
<!ATTLIST msg seq CDATA #IMPLIED>
<!ATTLIST msg name CDATA #IMPLIED>
<!ATTLIST msg desc CDATA #IMPLIED>
<!ATTLIST msg meaning CDATA #IMPLIED>
<!ATTLIST msg obsolete (obsolete) #IMPLIED>
<!ATTLIST msg xml:space (default|preserve) "default">
<!ATTLIST msg is_hidden CDATA #IMPLIED>

<!ELEMENT source (#PCDATA)>

<!ELEMENT ph (#PCDATA|ex)*>
<!ATTLIST ph name CDATA #REQUIRED>

<!ELEMENT ex (#PCDATA)>
]>
<messagebundle>
  <msg id="5980763297918130233"><source>file.ts:1</source>This is a test message <ph name="ICU"><ex>{sex, select, other {...}}</ex></ph></msg>
  <msg id="1201948414570017983"><source>file.ts:1</source>{VAR_SELECT, select, other {deeply nested} }</msg>
</messagebundle>
`);
  });

  it("should write xmb with I18nDef", () => {
    const messageBundle = new MessageBundle("en");
    messageBundle.updateFromTemplate(
      {
        value: "This is a test message",
        id: "customId",
        meaning: "Custom meaning",
        description: "Custom desc"
      },
      "file.ts"
    );
    expect(messageBundle.write(xmbWrite, xmbDigest, {}, xmbMapper)).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE messagebundle [
<!ELEMENT messagebundle (msg)*>
<!ATTLIST messagebundle class CDATA #IMPLIED>

<!ELEMENT msg (#PCDATA|ph|source)*>
<!ATTLIST msg id CDATA #IMPLIED>
<!ATTLIST msg seq CDATA #IMPLIED>
<!ATTLIST msg name CDATA #IMPLIED>
<!ATTLIST msg desc CDATA #IMPLIED>
<!ATTLIST msg meaning CDATA #IMPLIED>
<!ATTLIST msg obsolete (obsolete) #IMPLIED>
<!ATTLIST msg xml:space (default|preserve) "default">
<!ATTLIST msg is_hidden CDATA #IMPLIED>

<!ELEMENT source (#PCDATA)>

<!ELEMENT ph (#PCDATA|ex)*>
<!ATTLIST ph name CDATA #REQUIRED>

<!ELEMENT ex (#PCDATA)>
]>
<messagebundle>
  <msg id="customId" desc="Custom desc" meaning="Custom meaning"><source>file.ts:1</source>This is a test message</msg>
</messagebundle>
`);
  });

  it("should write xmb with merged content", () => {
    const messageBundle = new MessageBundle("en");
    messageBundle.updateFromTemplate("This is a test message {sex, select, other {deeply nested}}", "file.ts");
    expect(messageBundle.write(xmbWrite, xmbDigest, xmbLoadToXml(XMB), xmbMapper))
      .toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE messagebundle [
<!ELEMENT messagebundle (msg)*>
<!ATTLIST messagebundle class CDATA #IMPLIED>

<!ELEMENT msg (#PCDATA|ph|source)*>
<!ATTLIST msg id CDATA #IMPLIED>
<!ATTLIST msg seq CDATA #IMPLIED>
<!ATTLIST msg name CDATA #IMPLIED>
<!ATTLIST msg desc CDATA #IMPLIED>
<!ATTLIST msg meaning CDATA #IMPLIED>
<!ATTLIST msg obsolete (obsolete) #IMPLIED>
<!ATTLIST msg xml:space (default|preserve) "default">
<!ATTLIST msg is_hidden CDATA #IMPLIED>

<!ELEMENT source (#PCDATA)>

<!ELEMENT ph (#PCDATA|ex)*>
<!ATTLIST ph name CDATA #REQUIRED>

<!ELEMENT ex (#PCDATA)>
]>
<messagebundle>
  <msg id="7056919470098446707"><source>file.ts:3</source>translatable element <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>with placeholders<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph> <ph name="INTERPOLATION"><ex>{{ interpolation}}</ex></ph></msg>
  <msg id="2981514368455622387"><source>file.ts:4</source>{VAR_PLURAL, plural, =0 {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>test<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>} }</msg>
  <msg id="7999024498831672133" desc="d" meaning="m"><source>file.ts:5</source>foo</msg>
  <msg id="i" desc="d" meaning="m"><source>file.ts:6</source>foo</msg>
  <msg id="bar"><source>file.ts:7</source>foo</msg>
  <msg id="baz"><source>file.ts:8</source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>deeply nested<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>} } } }</msg>
  <msg id="6997386649824869937"><source>file.ts:9</source>Test: <ph name="ICU"><ex>{ count, plural, =0 {...} =other {...}}</ex></ph></msg>
  <msg id="5229984852258993423"><source>file.ts:9</source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>deeply nested<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>} } } =other {a lot} }</msg>
  <msg id="2340165783990709777"><source>file.ts:10,11</source>multi
lines</msg>
  <msg id="5980763297918130233"><source>file.ts:1</source>This is a test message <ph name="ICU"><ex>{sex, select, other {...}}</ex></ph></msg>
  <msg id="1201948414570017983"><source>file.ts:1</source>{VAR_SELECT, select, other {deeply nested} }</msg>
</messagebundle>
`);
  });
});
