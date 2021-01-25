import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { isNil, omit } from 'lodash';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';
import { filter, skipWhile } from 'rxjs/operators';
import { CreateUserPayload, CreateUserReturnPayload, GetUserReturnPayload, LoginPayload, LoginReturnPayload, updateClaimsPayload, UpdateUserPayload } from './interfaces/payload.interface';
import { User } from './interfaces/user.interface';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly backendAddress = "http://localhost:4000";

    currToken: BehaviorSubject<string | null> = new BehaviorSubject(null);
    currUser: BehaviorSubject<User | null> = new BehaviorSubject(null);


    constructor(
        private readonly http: HttpClient,
        private readonly cookieService: CookieService,
    ) {
        this.currToken.pipe(filter(token => !isNil(token))).subscribe(token => {
            this.getUser();
            this.cookieService.set("token", token, moment().add(1, "hour").toDate());
        });
    }

    logout() {
        this.cookieService.delete('token');
        this.currToken.next(null);
        this.currUser.next(null);
    }

    createUser(payload: CreateUserPayload) {
        this.http.post<CreateUserReturnPayload>(`${this.backendAddress}/user/`, payload, { responseType: 'json' })
            .subscribe(res => {
                this.currToken.next(res.token);
                // this.getUser();
            })
    }

    getUser() {
        this.http.get<GetUserReturnPayload>(`${this.backendAddress}/user/`, { responseType: 'json', headers: { Authorization: `bearer ${this.currToken.getValue()}` }})
            .subscribe(res => {
                this.currUser.next({
                    ...res,
                    claims: res.claims.map(claim => ({
                        ...claim,
                        starts: moment(claim.starts),
                        ends: moment(claim.ends),
                    })),
                });
            });
    }

    login(payload: LoginPayload) {
        this.http.post<LoginReturnPayload>(`${this.backendAddress}/user/login`, payload, { responseType: 'json' })
            .subscribe(res => {
                this.currToken.next(res.token);
                // this.getUser();
            })
    }

    updateUser(payload: UpdateUserPayload) {
        return new Promise<void>(resolve => {
            this.http.put(`${this.backendAddress}/user/update`, payload, { responseType: "text", headers: { Authorization: `bearer ${this.currToken.getValue()}` } })
                .subscribe(_ => {
                    this.currUser.next({
                        ...omit(this.currUser.getValue(), "usesTobacco", "numChildren", "hasSpouse", "age"),
                        ...payload
                    });
                    resolve();
                });
        });
    }

    updateClaims(payload: updateClaimsPayload) {
        return new Promise<void>(resolve => {
            this.http.put(`${this.backendAddress}/user/updateClaims`, payload, { responseType: "text", headers: { Authorization: `bearer ${this.currToken.getValue()}` } })
                .subscribe(_ => {
                    this.currUser.next({
                        ...this.currUser.getValue(),
                        claims: payload.map(claim => ({
                            ...claim,
                            starts: moment(claim.starts),
                            ends: moment(claim.ends),
                        })),
                    });
                    resolve();
                });
        })
    }

    async validateToken(token: string): Promise<boolean> {
        return await this.http.get<boolean>(`${this.backendAddress}/user/validateToken/${token}`, { responseType: 'json' })
            .toPromise<boolean>();
    }
}