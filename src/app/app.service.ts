import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, Observer, timer } from 'rxjs';
import { Config, ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }

}
