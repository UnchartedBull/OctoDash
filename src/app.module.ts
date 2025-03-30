import { APP_BASE_HREF, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import lottiePlayer from 'lottie-web';
import { LottieComponent, provideCacheableAnimationLoader, provideLottieOptions } from 'ngx-lottie';

import { AppRoutingModule } from './app.routing.module';
import components from './components';
import { AppComponent } from './components/app.component';
import directives from './directives';
import pipes from './pipes';
import services from './services';

@NgModule({
  declarations: [...components, ...directives, ...pipes],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FontAwesomeModule,
    FormsModule,
    MatRippleModule,
    LottieComponent,
  ],
  providers: [
    ...services,
    [provideLottieOptions({ player: () => lottiePlayer })],
    [provideCacheableAnimationLoader()],
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {
  public constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
