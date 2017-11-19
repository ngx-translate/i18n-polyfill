import {Component} from "@angular/core";
import {I18n} from "../../../lib/public_api";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "app";
  testLabel = '';

  constructor(private i18n: I18n) {
    this.testLabel = i18n("This is a test {{ok}} !", {ok: "\\o/"});
  }

  test() {
    console.log(this.i18n("another test ^_^"));
  }
}
