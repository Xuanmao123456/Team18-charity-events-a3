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
  { path: 'admin/login', component: Login },
  { path: '**', redirectTo: 'home' }
];
