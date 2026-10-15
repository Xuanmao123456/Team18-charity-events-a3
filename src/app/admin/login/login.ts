import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Function 1: Administrator login page
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private router: Router) { }

  handleLogin() {
    this.error = '';
    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Please enter both username and password.';
      return;
    }

    this.loading = true;
    setTimeout(() => {
      if (this.username.trim() === 'admin' && this.password === '123456') {
        // Login successful: Write to local storage, router guard will release all management pages
        localStorage.setItem('admin_logged_in', 'true');
        this.router.navigate(['/admin/events']);
      } else {
        this.loading = false;
        this.error = 'Invalid username or password.';
      }
    }, 400);
  }
}