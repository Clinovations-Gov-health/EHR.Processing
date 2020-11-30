import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserService } from '../services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardGuard implements CanActivate {
    constructor(
        private readonly userService: UserService,
        private readonly router: Router
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): true | UrlTree {
        if (!this.userService.currToken.getValue()) {
            return this.router.parseUrl('/login');
        }

        return true;
    }
  
}
