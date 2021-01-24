import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserService } from '../services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
    constructor(
        private readonly userService: UserService,
        private readonly router: Router
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): true | UrlTree {
        if (this.userService.currToken.getValue()) {
            return true;
        } else if (route.queryParamMap.has("token")) {
            this.userService.currToken.next(route.queryParamMap.get("token"));
            return true;
        } else {
            return this.router.parseUrl('/login');   
        }
    }
  
}
