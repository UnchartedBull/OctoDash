import { DragDropModule } from '@angular/cdk/drag-drop';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, inject, NgModule, provideAppInitializer } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import lottiePlayer from 'lottie-web';
import { LottieComponent, provideCacheableAnimationLoader, provideLottieOptions } from 'ngx-lottie';

import { AppRoutingModule } from './app.routing.module';
import components from './components';
import { AppComponent } from './components/app.component';
import directives from './directives';
import pipes from './pipes';
import services from './services';
import { OctoprintSettingsService } from './services/octoprint-settings.service';

@NgModule({
  declarations: [...components, ...directives, ...pipes],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule,
    FontAwesomeModule,
    FormsModule,
    MatRippleModule,
    RoundProgressModule,
    LottieComponent,
  ],
  providers: [
    ...services,
    provideAppInitializer(() => {
      inject(OctoprintSettingsService);
    }),
    provideLottieOptions({ player: () => lottiePlayer }),
    provideCacheableAnimationLoader(),
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {
  public constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
