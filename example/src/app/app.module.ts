import {BrowserModule} from "@angular/platform-browser";
import {LOCALE_ID, NgModule, TRANSLATIONS, TRANSLATIONS_FORMAT} from "@angular/core";

import {AppComponent} from "./app.component";
import {I18n} from "../../../src";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [
    {provide: TRANSLATIONS_FORMAT, useValue: "xlf"},
    {provide: TRANSLATIONS, useValue: require("raw-loader!../i18n/messages.fr.xlf")},
    {provide: LOCALE_ID, useValue: "fr"},
    {provide: I18n, useClass: I18n, deps: [TRANSLATIONS_FORMAT, TRANSLATIONS, LOCALE_ID]}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
