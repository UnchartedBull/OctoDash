import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

const getCookies = () => {
  const cookies: { [key: string]: string } = {};
  document.cookie.split('; ').forEach(cookie => {
    const [name, value] = cookie.split('=');
    cookies[name] = value;
  });
  return cookies;
};

const getCsrfToken = () => {
  const cookies = getCookies();
  const port = window.location.port;
  const cookie = Object.entries(cookies).find(([name]) => name.startsWith(`csrf_token_P${port}`));
  if (cookie) {
    return cookie[1];
  }
};

export function csrfInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    req = req.clone({
      setHeaders: {
        'X-CSRF-TOKEN': csrfToken,
      },
    });
  }
  return next(req);
}
