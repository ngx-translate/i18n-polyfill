import * as path from "path";
import {getAst} from "../src/extractor/extractor";

describe("Extractor", () => {
  it("should extract AST", () => {
    const values = getAst(["example/src/**/*.ts"]);
    expect(values).toEqual(["This is a test {{ok}} !", "another test ^_^"]);
  });
});
