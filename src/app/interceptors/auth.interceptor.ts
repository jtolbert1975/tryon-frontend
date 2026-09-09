import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService
 } from '../services/token.service';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).getToken();
  console.log('[interceptor] running — token present:', !!token, 'url:', req.url);

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

    const finalReq = authReq.clone({ setHeaders: { Accept: 'application/json' }, })

  return next(finalReq);
};
