import { CanActivateFn, Router } from '@angular/router';

import { inject } from '@angular/core';

// Route Guard: When accessing the management page without logging in, it will redirect to the login page
export const adminAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
  return loggedIn ? true : router.createUrlTree(['/admin/login']);
};