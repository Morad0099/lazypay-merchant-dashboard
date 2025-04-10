import { Action, Selector, State, StateContext } from '@ngxs/store';
import { AdminLogin, AutoLogin, Logout } from './app.actions';
import { Navigate } from '@ngxs/router-plugin';
import { Injectable } from '@angular/core';
import { AdminService } from "../../service/admin.service";
import { Router } from '@angular/router';

interface StateModel {
  user: any;
  token: string;
  refreshToken: string;
  error: any;
}

@State<StateModel>({
  name: 'auth',
  defaults: {
    user: null,
    token: '',
    refreshToken: '',
    error: null,
  },
})
@Injectable()
export class AuthState {
  @Selector()
  static user(state: StateModel) {
    return state.user;
  }

  @Selector()
  static token(state: StateModel) {
    return state.token;
  }

  @Selector()
  static refreshToken(state: StateModel) {
    return state.refreshToken;
  }

  @Selector()
  static error(state: StateModel) {
    return state.error;
  }

  constructor(private service: AdminService, private router: Router) {}

  @Action(AutoLogin)
  async autoLogin({ dispatch }: StateContext<StateModel>) {
    try {
      const session = localStorage.getItem('PLOGIN');
      if (typeof session !== 'string') {
        throw Error('LOGIN NOT FOUND');
      }
      const logins = JSON.parse(session);
      dispatch(new AdminLogin(logins));
    } catch (err) {
      console.error('AutoLogin error:', err);
    }
  }

  @Action(AdminLogin)
  adminLogin(
    { patchState, dispatch }: StateContext<StateModel>,
    { payload }: AdminLogin
  ) {
    console.log('Storing auth data in local storage:', payload); // Debug log
    
    // Ensure we're storing the refresh token as well
    const loginData = {
      user: payload.user,
      token: payload.token,
      refreshToken: payload.refreshToken
    };
    
    localStorage.setItem('PLOGIN', JSON.stringify(loginData));
    
    patchState({
      user: payload.user,
      token: payload.token,
      refreshToken: payload.refreshToken
    });
  }

  @Action(Logout)
  logout({ patchState, dispatch }: StateContext<StateModel>) {
    localStorage.removeItem('PLOGIN');
    window.location.reload();
  }
}