import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [IonContent, IonItem, IonInput, IonButton, IonIcon, FormsModule]
})
export class SignupPage {
  name = '';
  email = '';
  password = '';
  confirm = '';
  isLoading = false;

  constructor(
    private auth: AuthService, 
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async onSignup() {
    if (!this.name || !this.email || !this.password || !this.confirm) {
      const toast = await this.toastCtrl.create({
        message: 'Please fill out all fields.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    if (this.password.length < 6) {
      const toast = await this.toastCtrl.create({
        message: 'Password must be at least 6 characters.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    if (this.password !== this.confirm) {
      const toast = await this.toastCtrl.create({
        message: 'Passwords do not match.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Creating account...',
      duration: 5000
    });
    await loading.present();

    try {
      await this.auth.signup(this.name, this.email, this.password);
      await loading.dismiss();
      this.isLoading = false;
      
      const toast = await this.toastCtrl.create({
        message: 'Account created successfully!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      // Navigate to home (user is automatically logged in after signup)
      this.router.navigateByUrl('/home');
    } catch (error: any) {
      await loading.dismiss();
      this.isLoading = false;
      
      const toast = await this.toastCtrl.create({
        message: error.message || 'Signup failed. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
