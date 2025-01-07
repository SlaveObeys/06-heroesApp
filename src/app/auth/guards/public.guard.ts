import { ActivatedRouteSnapshot, CanActivateFn, CanMatchFn, Route, Router, RouterStateSnapshot, UrlSegment } from "@angular/router";
import { map, Observable, tap } from "rxjs";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";


const checkAuthStatus = (): boolean | Observable<boolean> => {

  // Inyectamos el authservice  y el router
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.checkAuthentication().pipe(
    tap(isAuthenticated => console.log('isAuthenticated', isAuthenticated)),
    tap(isAuthenticated => {
      if (isAuthenticated) router.navigate(['./']);
    }),
    map(isAuthenticated => !isAuthenticated),
  )

}

export const canActivateGuardPublic: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return checkAuthStatus();
}

export const canMatchGuardPublic: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  return checkAuthStatus();
}
