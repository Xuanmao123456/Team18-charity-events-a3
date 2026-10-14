import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-adopt',
  styleUrl: './adopt.css',
  templateUrl: './adopt.html',
})
export class Adopt {
  alert(msg: string) {
    alert(msg);
  }
}
