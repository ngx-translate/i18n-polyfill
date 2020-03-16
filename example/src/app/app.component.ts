import {Component} from "@angular/core";
import {I18n} from "@ngx-translate/i18n-polyfill";
import {Testing} from "../global";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "app";
  customId = this.i18n({id: "customId", value: "Some value", description: "Custom desc", meaning: "Custom meaning"});

  constructor(private i18n: I18n) {
    console.log(this.i18n("This is a test {{ok}} !", {ok: "\\o/"}));
  }

  test() {
    console.log(this.i18n("another test ^_^"));
    console.log(Testing(this.i18n));
    console.log(this.i18n("un " + "autre" + " test"));
    console.log(this.i18n({value: "encore " + "un" + " test", id: "ID"}));
  }
}
