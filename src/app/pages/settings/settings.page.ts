import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonToggle,
  IonList,
  IonBackButton,
  IonButtons,
  IonListHeader,
  IonIcon
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [
    FormsModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonToggle,
    IonList,
    IonBackButton,
    IonButtons,
    IonListHeader,
    IonIcon
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // ✅ Handles custom Ionic elements
})
export class SettingsPage {
  dark = false;
  version = '1.0.0';
  name = '';
  email = '';

  constructor(private toastCtrl: ToastController) {
    this.loadThemePreference();
    this.loadProfile();
  }

  private loadThemePreference() {
    const pref = localStorage.getItem('dp_theme');
    this.dark = pref === 'dark';
    this.applyTheme();
  }

  private loadProfile() {
    const profileRaw = localStorage.getItem('dp_profile');
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        this.name = profile.name || '';
        this.email = profile.email || '';
      } catch (err) {
        console.warn('Error parsing profile:', err);
      }
    }
  }

  onDarkToggle() {
    localStorage.setItem('dp_theme', this.dark ? 'dark' : 'light');
    this.applyTheme();
    
    // Show feedback to user
    this.showThemeChangeToast();
  }

  private applyTheme() {
    const body = document.body;
    const html = document.documentElement;
    
    if (this.dark) {
      body.classList.add('dark');
      html.classList.add('dark');
    } else {
      body.classList.remove('dark');
      html.classList.remove('dark');
    }
  }

  private async showThemeChangeToast() {
    const toast = await this.toastCtrl.create({
      message: this.dark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled',
      duration: 1500,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  async saveProfile() {
    const profile = { name: this.name, email: this.email };
    localStorage.setItem('dp_profile', JSON.stringify(profile));

    const toast = await this.toastCtrl.create({
      message: '✅ Profile saved successfully!',
      duration: 1500,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }
}
