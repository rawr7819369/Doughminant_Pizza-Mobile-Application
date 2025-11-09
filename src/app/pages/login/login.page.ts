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
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonItem, IonInput, IonButton, IonIcon, FormsModule],
})
export class LoginPage {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private auth: AuthService, 
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async onLogin() {
    if (!this.email || !this.password) {
      const toast = await this.toastCtrl.create({
        message: 'Please enter email and password',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Logging in...',
      duration: 5000
    });
    await loading.present();

    try {
      await this.auth.login(this.email, this.password);
      await loading.dismiss();
      this.isLoading = false;
      
      const toast = await this.toastCtrl.create({
        message: 'Login successful!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      this.router.navigateByUrl('/home');
    } catch (error: any) {
      await loading.dismiss();
      this.isLoading = false;
      
      const toast = await this.toastCtrl.create({
        message: error.message || 'Login failed. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async onSocialLogin(provider: 'google' | 'facebook' | 'apple') {
    if (this.isLoading) return;

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: `Signing in with ${provider}...`,
      duration: 10000
    });
    await loading.present();

    try {
      let success = false;
      switch (provider) {
        case 'google':
          success = await this.auth.signInWithGoogle();
          break;
        case 'facebook':
          success = await this.auth.signInWithFacebook();
          break;
        case 'apple':
          success = await this.auth.signInWithApple();
          break;
      }

      await loading.dismiss();
      this.isLoading = false;

      if (success) {
        const toast = await this.toastCtrl.create({
          message: `Signed in with ${provider} successfully!`,
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigateByUrl('/home');
      }
    } catch (error: any) {
      await loading.dismiss();
      this.isLoading = false;

      let errorMessage = `Sign in with ${provider} failed.`;
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in cancelled.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email.';
      }

      const toast = await this.toastCtrl.create({
        message: errorMessage,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  gotoSignup() {
    this.router.navigateByUrl('/signup');
  }
}
