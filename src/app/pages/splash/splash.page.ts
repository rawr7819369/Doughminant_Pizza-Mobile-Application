import { Component, effect } from '@angular/core';
import { IonContent, IonImg } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonContent, IonImg]
})
export class SplashPage {
  constructor(private router: Router) {
    setTimeout(() => this.router.navigateByUrl('/login'), 2000);
  }
}
