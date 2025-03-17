import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class KycGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.store.select(state => state.auth.user).pipe(
      take(1), // ✅ Ensures it only runs once per navigation attempt
      map(user => {
        console.log('Checking Guard for User:', user);

        if (!user?.merchantId) {
          console.log('No merchant ID found, redirecting to login...');
          this.router.navigate(['/login']);
          return false;
        }

        const needsKyc = !user.merchantId.active || !user.merchantId.submitted;
        const isOnKycPage = state.url.includes('/kyc'); // ✅ Uses `state.url` for reliability

        console.log('Needs KYC:', needsKyc, 'Is on KYC Page:', isOnKycPage);

        if (needsKyc && !isOnKycPage) {
            console.log('Navigating to KYC...');
            setTimeout(() => {
              this.router.navigate(['/kyc']).then(() => {
                window.location.reload(); // ✅ Forces a full reload (temporary workaround)
              });
            }, 0);
          }
          

        console.log('User has passed KYC check.');
        return true;
      })
    );
  }
}
