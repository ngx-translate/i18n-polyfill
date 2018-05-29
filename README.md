# @ngx-translate/i18n-polyfill [![Travis Status](https://travis-ci.org/ngx-translate/i18n-polyfill.svg?branch=master)](https://travis-ci.org/ngx-translate/i18n-polyfill) [![npm version](https://img.shields.io/npm/v/@ngx-translate/i18n-polyfill.svg)](https://www.npmjs.com/package/@ngx-translate/i18n-polyfill)

Extraction tool + service to add support for code translations in Angular using the same implementation that is used for [template translations](https://angular.io/guide/i18n#template-translations).

## :warning: **Disclamer**

This library is a speculative polyfill, it means that it's supposed to replace an API that is coming in the future.
Once code translations are available in Angular, this library will be deprecated.
But since it's a polyfill, we expect the API to be pretty similar.
If the API is different, a migration tool will be provided if it's possible and necessary.

## Installation

To install this library, run:

```bash
$ npm install @ngx-translate/i18n-polyfill --save
```

## How to use

The API is quite simple, you get a service called `I18n` that takes 2 parameters: the content to translate
and the parameters (optional). It'll return the content translated synchronously.
The signature of the service is:

`I18n: (def: string | I18nDef, params?: {[key: string]: any}) => string`.

The content can be a simple string or an i18n definition:

```ts
I18nDef: {
  value: string;
  id?: string;
  meaning?: string;
  description?: string;
}
```

Prepare your application to use i18n, [as described on the official documentation](https://angular.io/guide/i18n#merge-the-completed-translation-file-into-the-app), and then provide the `TRANSLATIONS` file and `I18n` service in your module or component:

```ts
import { BrowserModule } from '@angular/platform-browser';
import {
  NgModule,
  TRANSLATIONS
} from '@angular/core';

import { AppComponent } from './app.component';

// Import the service
import { I18n } from '@ngx-translate/i18n-polyfill';

declare const require; // Use the require method provided by webpack
const translations = require(`raw-loader!../locale/messages.fr.xlf`);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    {provide: TRANSLATIONS, useValue: translations},
    I18n
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

To dynamically load the translations file based on locale you can use a factory provider.
 
 
Replace
 
```
{provide: TRANSLATIONS, useValue: translations}
```
with:
 
```typescript
{
  provide: TRANSLATIONS,
  useFactory: (locale) => {
    locale = locale || 'en'; // default to english if no locale provided
    return require(`raw-loader!../locale/messages.${locale}.xlf`);
  },
  deps: [LOCALE_ID]
}
```
 
Once the `I18n` service and `TRANSLATIONS` are imported & provided, you can use the service in your Angular application:

```typescript
import { Component } from "@angular/core";
import { I18n } from "@ngx-translate/i18n-polyfill";

@Component({
  selector: "app-root",
  template: "./app.component.html"
})
export class AppComponent {
  constructor(i18n: I18n) {
    console.log(i18n("This is a test {{myVar}} !", {myVar: "^_^"}));
  }
}
```

## Content supported
You can use strings, interpolations and [ICU expressions](https://angular.io/guide/i18n#select-among-alternative-text-messages) exactly like in [template translations](https://angular.io/guide/i18n#template-translations).
Don't use elements, it makes no sense and you should use a template translation for that instead.

Interpolations will be replaced by the values that you provide in the object that you pass as the second parameter of the service.
You should use the same names for your keys than the ones that you use in your interpolations.
For example: `i18n("This is a test {{myVar}} !", {myVar: "^_^"})`

## Extraction
There is an extraction tool called `ngx-extractor` that will extract the messages.
You should first extract the messages from the templates [using the `ng-xi18n` extraction tool from `@angular/compiler-cli`](https://angular.io/guide/i18n#create-a-translation-source-file-with-ng-xi18n)
which will create an xliff or xmb file, and then run `ngx-extractor` on the same file to add the messages extracted from your code.
The messages will be merged.

The cli parameters are the following:
- `--input` (alias: `-i`, required): Paths you would like to extract strings from. You can use path expansion, glob patterns and multiple paths.
  
  Example: `-i src/**/*.ts`.

- `--format` (alias `-f`, optional, default `xlf`): Output format, either xlf, xlf2 or xmb.
  
  Example: `-f xlf`.

- `--outFile` (alias `-o`, required): Path and name of the file where you would like to save extracted strings.
  If the file exists then the messages will be merged.
  
  Example: `-o src/i18n/source.xlf`.

- `--locale` (alias `-l`, optional, default: `en`): Source language of the application.
  
  Example: `-l de`.

And here is how you would extract the messages from your ng cli application to a file named src/i18n/source.xlf:
- run ng-xi18n: `ng xi18n -of i18n/source.xlf -f xlf --locale en`
- run ng-extractor: `ngx-extractor -i src/**/*.ts -f xlf -o src/i18n/source.xlf`

## Special thanks
The service was written using source code from [Angular](https://github.com/angular/angular) and the extraction tool used code from [ngx-translate-extract](https://github.com/biesbjerg/ngx-translate-extract) by @biesbjerg.

## License

MIT © [Olivier Combe](mailto:olivier.combe@gmail.com)
