import {Component} from "@angular/core";
import {I18n} from "../../../src/i18n-polyfill.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "app";

  constructor(private i18n: I18n) {
    i18n("This is a test {{ok}}", {ok: "value"});
  }

  test() {
    this.i18n("another test ^_^");
  }
}
