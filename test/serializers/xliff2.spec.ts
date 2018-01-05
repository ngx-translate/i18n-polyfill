/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {xliff2Digest, xliff2LoadToI18n, xliff2LoadToXml, xliff2Write} from "../../lib/src/serializers/xliff2";
import {MessageBundle} from "../../lib/extractor/src/message-bundle";

const XLIFF2 = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
  <file original="ng.template" id="ngi18n">
    <unit id="1933478729560469763">
      <notes>
        <note category="location">file.ts:2</note>
      </notes>
      <segment>
        <source>translatable attribute</source>
        <target>etubirtta elbatalsnart</target>
      </segment>
    </unit>
    <unit id="7056919470098446707">
      <notes>
        <note category="location">file.ts:3</note>
      </notes>
      <segment>
        <source>translatable element <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">with placeholders</pc> <ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/></source>
        <target><ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/> <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">sredlohecalp htiw</pc> tnemele elbatalsnart</target>
      </segment>
    </unit>
    <unit id="2981514368455622387">
      <notes>
        <note category="location">file.ts:4</note>
      </notes>
      <segment>
        <source>{VAR_PLURAL, plural, =0 {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">test</pc>} }</source>
        <target>{VAR_PLURAL, plural, =0 {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">TEST</pc>} }</target>
      </segment>
    </unit>
    <unit id="i">
      <notes>
        <note category="description">d</note>
        <note category="meaning">m</note>
        <note category="location">file.ts:5</note>
      </notes>
      <segment>
        <source>foo</source>
        <target>oof</target>
      </segment>
    </unit>
    <unit id="6440235004920703622">
      <notes>
        <note category="description">nested</note>
        <note category="location">file.ts:6</note>
      </notes>
      <segment>
        <source><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;"><pc id="1" equivStart="START_UNDERLINED_TEXT" equivEnd="CLOSE_UNDERLINED_TEXT" type="fmt" dispStart="&lt;u&gt;" dispEnd="&lt;/u&gt;"><ph id="2" equiv="INTERPOLATION" disp="{{interpolation}}"/> Text</pc></pc></source>
        <target><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;"><pc id="1" equivStart="START_UNDERLINED_TEXT" equivEnd="CLOSE_UNDERLINED_TEXT" type="fmt" dispStart="&lt;u&gt;" dispEnd="&lt;/u&gt;">txeT <ph id="2" equiv="INTERPOLATION" disp="{{interpolation}}"/></pc></pc></target>
      </segment>
    </unit>
    <unit id="8779402634269838862">
      <notes>
        <note category="description">ph names</note>
        <note category="location">file.ts:7</note>
      </notes>
      <segment>
        <source><ph id="0" equiv="LINE_BREAK" type="fmt" disp="&lt;br/&gt;"/><ph id="1" equiv="TAG_IMG" type="image" disp="&lt;img/&gt;"/><ph id="2" equiv="TAG_IMG_1" type="image" disp="&lt;img/&gt;"/></source>
        <target><ph id="2" equiv="TAG_IMG_1" type="image" disp="&lt;img/&gt;"/><ph id="1" equiv="TAG_IMG" type="image" disp="&lt;img/&gt;"/><ph id="0" equiv="LINE_BREAK" type="fmt" disp="&lt;br/&gt;"/></target>
      </segment>
    </unit>
    <unit id="6536355551500405293">
      <notes>
        <note category="description">empty element</note>
        <note category="location">file.ts:8</note>
      </notes>
      <segment>
        <source>hello <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;"></pc></source>
        <target><pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;"></pc> olleh</target>
      </segment>
    </unit>
    <unit id="baz">
      <notes>
        <note category="location">file.ts:9</note>
      </notes>
      <segment>
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">deeply nested</pc>} } } }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">profondément imbriqué</pc>} } } }</target>
      </segment>
    </unit>
    <unit id="6997386649824869937">
      <notes>
        <note category="location">file.ts:10</note>
      </notes>
      <segment>
        <source>Test: <ph id="0" equiv="ICU" disp="{ count, plural, =0 {...} =other {...}}"/></source>
        <target>Test: <ph id="0" equiv="ICU" disp="{ count, plural, =0 {...} =other {...}}"/></target>
      </segment>
    </unit>
    <unit id="5229984852258993423">
      <notes>
        <note category="location">file.ts:10</note>
      </notes>
      <segment>
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">deeply nested</pc>} } } =other {a lot} }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">profondément imbriqué</pc>} } } =other {beaucoup} }</target>
      </segment>
    </unit>
    <unit id="2340165783990709777">
      <notes>
        <note category="location">file.ts:11,12</note>
      </notes>
      <segment>
        <source>multi
lines</source>
        <target>multi
lignes</target>
      </segment>
    </unit>
  </file>
</xliff>
`;

describe("Xliff2 serializer", () => {
  it("should decode xliff2", () => {
    const loaded = xliff2LoadToI18n(XLIFF2);
    expect(loaded["1933478729560469763"]).toEqual([
      {
        sourceSpan: {
          details: null,
          end: {col: 22, file: {content: "etubirtta elbatalsnart", url: ""}, line: 0, offset: 22},
          start: {col: 0, file: {content: "etubirtta elbatalsnart", url: ""}, line: 0, offset: 0}
        },
        value: "etubirtta elbatalsnart"
      }
    ] as any);
  });

  it("should write xliff2", () => {
    const messageBundle = new MessageBundle("en");
    messageBundle.updateFromTemplate("This is a test message {sex, select, other {deeply nested}}", "file.ts");
    expect(messageBundle.write(xliff2Write, xliff2Digest)).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
    <unit id="5980763297918130233">
      <notes>
        <note category="location">file.ts:1</note>
      </notes>
      <segment>
        <source>This is a test message <ph id="0" equiv="ICU" disp="{sex, select, other {...}}"/></source>
      </segment>
    </unit>
    <unit id="1201948414570017983">
      <notes>
        <note category="location">file.ts:1</note>
      </notes>
      <segment>
        <source>{VAR_SELECT, select, other {deeply nested} }</source>
      </segment>
    </unit>
  </file>
</xliff>
`);
  });

  it("should write xliff2 with I18nDef", () => {
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
    expect(messageBundle.write(xliff2Write, xliff2Digest)).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
    <unit id="customId">
      <notes>
        <note category="description">Custom desc</note>
        <note category="meaning">Custom meaning</note>
        <note category="location">file.ts:1</note>
      </notes>
      <segment>
        <source>This is a test message</source>
      </segment>
    </unit>
  </file>
</xliff>
`);
  });

  it("should write xliff2 with merged content", () => {
    const messageBundle = new MessageBundle("en");
    messageBundle.updateFromTemplate("This is a test message {sex, select, other {deeply nested}}", "file.ts");
    expect(messageBundle.write(xliff2Write, xliff2Digest, xliff2LoadToXml(XLIFF2)))
      .toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
    <unit id="1933478729560469763">
      <notes>
        <note category="location">file.ts:2</note>
      </notes>
      <segment>
        <source>translatable attribute</source>
        <target>etubirtta elbatalsnart</target>
      </segment>
    </unit><unit id="7056919470098446707">
      <notes>
        <note category="location">file.ts:3</note>
      </notes>
      <segment>
        <source>translatable element <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">with placeholders</pc> <ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/></source>
        <target><ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/> <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">sredlohecalp htiw</pc> tnemele elbatalsnart</target>
      </segment>
    </unit><unit id="2981514368455622387">
      <notes>
        <note category="location">file.ts:4</note>
      </notes>
      <segment>
        <source>{VAR_PLURAL, plural, =0 {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">test</pc>} }</source>
        <target>{VAR_PLURAL, plural, =0 {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">TEST</pc>} }</target>
      </segment>
    </unit><unit id="i">
      <notes>
        <note category="description">d</note>
        <note category="meaning">m</note>
        <note category="location">file.ts:5</note>
      </notes>
      <segment>
        <source>foo</source>
        <target>oof</target>
      </segment>
    </unit><unit id="6440235004920703622">
      <notes>
        <note category="description">nested</note>
        <note category="location">file.ts:6</note>
      </notes>
      <segment>
        <source><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;"><pc id="1" equivStart="START_UNDERLINED_TEXT" equivEnd="CLOSE_UNDERLINED_TEXT" type="fmt" dispStart="&lt;u&gt;" dispEnd="&lt;/u&gt;"><ph id="2" equiv="INTERPOLATION" disp="{{interpolation}}"/> Text</pc></pc></source>
        <target><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;"><pc id="1" equivStart="START_UNDERLINED_TEXT" equivEnd="CLOSE_UNDERLINED_TEXT" type="fmt" dispStart="&lt;u&gt;" dispEnd="&lt;/u&gt;">txeT <ph id="2" equiv="INTERPOLATION" disp="{{interpolation}}"/></pc></pc></target>
      </segment>
    </unit><unit id="8779402634269838862">
      <notes>
        <note category="description">ph names</note>
        <note category="location">file.ts:7</note>
      </notes>
      <segment>
        <source><ph id="0" equiv="LINE_BREAK" type="fmt" disp="&lt;br/&gt;"/><ph id="1" equiv="TAG_IMG" type="image" disp="&lt;img/&gt;"/><ph id="2" equiv="TAG_IMG_1" type="image" disp="&lt;img/&gt;"/></source>
        <target><ph id="2" equiv="TAG_IMG_1" type="image" disp="&lt;img/&gt;"/><ph id="1" equiv="TAG_IMG" type="image" disp="&lt;img/&gt;"/><ph id="0" equiv="LINE_BREAK" type="fmt" disp="&lt;br/&gt;"/></target>
      </segment>
    </unit><unit id="6536355551500405293">
      <notes>
        <note category="description">empty element</note>
        <note category="location">file.ts:8</note>
      </notes>
      <segment>
        <source>hello <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;"/></source>
        <target><pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;"/> olleh</target>
      </segment>
    </unit><unit id="baz">
      <notes>
        <note category="location">file.ts:9</note>
      </notes>
      <segment>
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">deeply nested</pc>} } } }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">profondément imbriqué</pc>} } } }</target>
      </segment>
    </unit><unit id="6997386649824869937">
      <notes>
        <note category="location">file.ts:10</note>
      </notes>
      <segment>
        <source>Test: <ph id="0" equiv="ICU" disp="{ count, plural, =0 {...} =other {...}}"/></source>
        <target>Test: <ph id="0" equiv="ICU" disp="{ count, plural, =0 {...} =other {...}}"/></target>
      </segment>
    </unit><unit id="5229984852258993423">
      <notes>
        <note category="location">file.ts:10</note>
      </notes>
      <segment>
        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">deeply nested</pc>} } } =other {a lot} }</source>
        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">profondément imbriqué</pc>} } } =other {beaucoup} }</target>
      </segment>
    </unit><unit id="2340165783990709777">
      <notes>
        <note category="location">file.ts:11,12</note>
      </notes>
      <segment>
        <source>multi
lines</source>
        <target>multi
lignes</target>
      </segment>
    </unit>
    <unit id="5980763297918130233">
      <notes>
        <note category="location">file.ts:1</note>
      </notes>
      <segment>
        <source>This is a test message <ph id="0" equiv="ICU" disp="{sex, select, other {...}}"/></source>
      </segment>
    </unit>
    <unit id="1201948414570017983">
      <notes>
        <note category="location">file.ts:1</note>
      </notes>
      <segment>
        <source>{VAR_SELECT, select, other {deeply nested} }</source>
      </segment>
    </unit>
  </file>
</xliff>
`);
  });
});
