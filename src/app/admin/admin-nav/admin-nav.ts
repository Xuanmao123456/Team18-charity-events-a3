import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { Component } from '@angular/core';

// Administrator top navigation: Shared by all management pages, ensuring "menu is visible on all pages"
@Component({
  selector: 'app-admin-nav',
  imports: [RouterLink, RouterLinkActive],
  styleUrl: './admin-nav.css',
  templateUrl: './admin-nav.html',
})
export class AdminNav {
  constructor(private router: Router) { }

  logout() {
    // Clear login status, navigate to login page
    localStorage.removeItem('admin_logged_in');
    this.router.navigate(['/admin/login']);
  }
}