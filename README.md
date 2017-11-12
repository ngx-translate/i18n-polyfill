# @ngx-translate/i18n-polyfill

## Installation

To install this library, run:

```bash
$ npm install @ngx-translate/i18n-polyfill --save
```

## Consuming your library

You can import this library in any Angular application by running:

```bash
$ npm install @ngx-translate/i18n-polyfill
```

and then from your Angular `AppModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Import the service
import { I18n } from '@ngx-translate/i18n-polyfill';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [I18n],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Once the `I18n` service is imported & provided, you can use its components, directives and pipes in your Angular application.

## Development

To generate all `*.js`, `*.d.ts` and `*.metadata.json` files:

```bash
$ npm run build
```

To lint all `*.ts` files:

```bash
$ npm run lint
```

## License

MIT © [Olivier Combe](mailto:olivier.combe@gmail.com)
