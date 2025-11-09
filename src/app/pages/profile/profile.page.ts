import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonAvatar,
  IonCard,
  IonCardContent,
  IonList,
  IonTextarea,
  LoadingController
} from '@ionic/angular/standalone';
import { AuthService, User } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { ToastController, ActionSheetController } from '@ionic/angular';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { HapticService } from '../../services/haptic.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonItem,
    IonLabel,
    IonInput,
    IonAvatar,
    IonCard,
    IonCardContent,
    IonList,
    IonTextarea
  ]
})
export class ProfilePage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  
  user: User | null = null;
  isEditing = false;
  profileImage: string | null = null;
  
  // Form fields
  name = '';
  email = '';
  phone = '';
  address = '';
  bio = '';
  
  // Settings
  notifications = true;
  emailNotifications = true;
  smsNotifications = false;

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private haptic: HapticService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.user = this.authService.user;
    if (this.user) {
      this.name = this.user.name || '';
      this.email = this.user.email || '';
      this.phone = this.user.phone || '';
      this.address = this.user.address || '';
      this.bio = this.user.bio || '';
      // Load profile image from user data or fallback
      this.profileImage = this.user.profileImageUrl || 'assets/profile.jpg';
    } else {
      // Fallback to default image
      this.profileImage = 'assets/profile.jpg';
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form if canceling edit
      this.loadUserProfile();
    }
  }

  async changeProfilePicture() {
    await this.haptic.selection();
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Change Profile Picture',
      buttons: [
        {
          text: 'Choose from Gallery',
          icon: 'images-outline',
          handler: () => {
            this.chooseFromGallery();
          }
        },
        {
          text: 'Remove Picture',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.removeProfilePicture();
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  chooseFromGallery() {
    // Trigger file input click
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        await this.showToast('Please select an image file', 'danger');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        await this.showToast('Image size must be less than 5MB', 'danger');
        return;
      }
      
      await this.uploadProfileImage(file);
      
      // Reset input
      input.value = '';
    }
  }

  async uploadProfileImage(file: File) {
    const loading = await this.loadingCtrl.create({
      message: 'Uploading image...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const user = this.authService.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create a reference to the file location
      const filePath = `profile-images/${user.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(this.firebaseService.storage, filePath);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Delete old profile image if exists
      if (user.profileImageUrl && user.profileImageUrl.includes('firebasestorage')) {
        try {
          // Extract the path from the URL
          const urlParts = user.profileImageUrl.split('/');
          const pathIndex = urlParts.findIndex(part => part === 'o');
          if (pathIndex !== -1 && urlParts[pathIndex + 1]) {
            const encodedPath = urlParts[pathIndex + 1].split('?')[0];
            const decodedPath = decodeURIComponent(encodedPath);
            const oldImageRef = ref(this.firebaseService.storage, decodedPath);
            await deleteObject(oldImageRef);
          }
        } catch (error) {
          console.warn('Could not delete old image:', error);
        }
      }

      // Update user profile with new image URL
      await this.authService.updateUserProfile(user.uid, {
        profileImageUrl: downloadURL
      });

      // Update local state
      this.profileImage = downloadURL;
      this.user = { ...user, profileImageUrl: downloadURL };

      await this.haptic.success();
      await this.showToast('Profile picture updated successfully!', 'success');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      await this.haptic.error();
      await this.showToast('Failed to upload image. Please try again.', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async removeProfilePicture() {
    await this.haptic.medium();
    const user = this.authService.user;
    if (!user) {
      return;
    }

    // Delete image from storage if it exists
    if (user.profileImageUrl && user.profileImageUrl.includes('firebasestorage')) {
      try {
        // Extract the path from the URL
        const urlParts = user.profileImageUrl.split('/');
        const pathIndex = urlParts.findIndex(part => part === 'o');
        if (pathIndex !== -1 && urlParts[pathIndex + 1]) {
          const encodedPath = urlParts[pathIndex + 1].split('?')[0];
          const decodedPath = decodeURIComponent(encodedPath);
          const imageRef = ref(this.firebaseService.storage, decodedPath);
          await deleteObject(imageRef);
        }
      } catch (error) {
        console.warn('Could not delete image from storage:', error);
      }
    }

    // Update user profile to remove image URL
    await this.authService.updateUserProfile(user.uid, {
      profileImageUrl: ''
    });

    // Update local state
    this.profileImage = 'assets/profile.jpg';
    this.user = { ...user, profileImageUrl: '' };

    await this.showToast('Profile picture removed', 'success');
  }

  async saveProfile() {
    await this.haptic.medium();
    if (!this.name.trim() || !this.email.trim()) {
      await this.showToast('Name and email are required', 'danger');
      return;
    }

    const user = this.authService.user;
    if (!user) {
      await this.showToast('User not authenticated', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Saving profile...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Update user profile in Firestore
      await this.authService.updateUserProfile(user.uid, {
        name: this.name.trim(),
        email: this.email.trim(),
        phone: this.phone.trim(),
        address: this.address.trim(),
        bio: this.bio.trim()
      });

      // Reload user data
      await this.loadUserProfile();
      
      this.isEditing = false;
      await this.haptic.success();
      await this.showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      await this.haptic.error();
      await this.showToast('Failed to update profile. Please try again.', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async logout() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Logout',
          role: 'destructive',
          icon: 'log-out',
          handler: () => {
            this.authService.logout();
            this.showToast('Logged out successfully');
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: color as any,
      position: 'bottom'
    });
    await toast.present();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
