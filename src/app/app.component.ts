import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuController, AlertController } from '@ionic/angular';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonMenuToggle,
  IonLabel
} from '@ionic/angular/standalone';
import { AuthService, User } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterModule,
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonMenuToggle,
    IonLabel
  ],
  standalone: true
})
export class AppComponent {

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private alertController: AlertController,
    public auth: AuthService
  ) {}

  // 🧭 Optional: open or close the side menu manually
  async openMenu() {
    await this.menuCtrl.open();
  }

  async closeMenu() {
    await this.menuCtrl.close();
  }

  // 🚪 Handle logout logic here
  async onLogout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: async () => {
            try {
              // Use AuthService to logout
              await this.auth.logout();

              // Redirect to login page
              this.router.navigateByUrl('/login', { replaceUrl: true });

              // Close the menu
              await this.menuCtrl.close();
            } catch (error) {
              console.error('Logout error:', error);
              // Still navigate to login even if logout fails
              this.router.navigateByUrl('/login', { replaceUrl: true });
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
