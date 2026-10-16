import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Search } from './search/search';
import { EventDetail } from './event-detail/event-detail';
import { Registration } from './registration/registration';
import { About } from './about/about';
import { Stories } from './stories/stories';
import { Impact } from './impact/impact';
import { Adopt } from './adopt/adopt';
import { Login } from './admin/login/login';
import { Events } from './admin/events/events';
import { EventForm } from './admin/event-form/event-form';
import { Dashboard } from './admin/dashboard/dashboard';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'search', component: Search },
  { path: 'event/:id', component: EventDetail },
  { path: 'register/:eventId', component: Registration },
  { path: 'about', component: About },
  { path: 'stories', component: Stories },
  { path: 'impact', component: Impact },
  { path: 'adopt', component: Adopt },
  // ---- Admin side ----
  { path: 'admin/login', component: Login },
  { path: 'admin/dashboard', component: Dashboard, canActivate: [adminAuthGuard] },
  { path: 'admin/events', component: Events, canActivate: [adminAuthGuard] },
  { path: 'admin/events/new', component: EventForm, canActivate: [adminAuthGuard] },
  { path: 'admin/events/:id/edit', component: EventForm, canActivate: [adminAuthGuard] },
  { path: '**', redirectTo: 'home' }
];
