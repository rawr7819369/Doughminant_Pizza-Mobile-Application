import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';

interface Developer {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  icon: string;
  image?: string; // Optional profile image path
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButton
  ],
  templateUrl: './about-us.page.html',
  styleUrls: ['./about-us.page.scss']
})
export class AboutUsPage {
  imageError: { [key: string]: boolean } = {};

  onImageError(developerName: string) {
    this.imageError[developerName] = true;
  }

  hasImageError(developerName: string): boolean {
    return this.imageError[developerName] || false;
  }

  developers: Developer[] = [
    {
      name: 'Quevedo, Jimuel P.',
      role: 'Lead Developer',
      bio: 'Full-stack developer with 8+ years of experience in Angular and Firebase. Passionate about creating seamless user experiences.',
      skills: ['Angular', 'TypeScript', 'Firebase', 'UI/UX'],
      icon: 'code-working-outline',
      image: 'assets/developers/quevedo.png' // Place image at: src/assets/developers/alex-johnson.jpg
    },
    {
      name: 'Bautista, Ivan Johannes B.',
      role: 'Frontend Developer',
      bio: 'Specialized in mobile app development and responsive design. Expert in Ionic and modern CSS frameworks.',
      skills: ['Ionic', 'Angular', 'SCSS', 'Design Systems'],
      icon: 'phone-portrait-outline',
      image: 'assets/developers/ivan.jpg' // Add your image path here
    },
    {
      name: 'Narvaez, Noah Joseph P.',
      role: 'Backend Developer',
      bio: 'Cloud architecture specialist focusing on scalable Firebase solutions and real-time data synchronization.',
      skills: ['Firebase', 'Cloud Functions', 'NoSQL', 'API Design'],
      icon: 'cloud-outline',
      image: 'assets/developers/narvaez.png' // Add your image path here
    },
    {
      name: 'Noor , Affan',
      role: 'UI/UX Designer',
      bio: 'Creative designer with a passion for food apps. Ensures every interaction feels delightful and intuitive.',
      skills: ['UI Design', 'UX Research', 'Prototyping', 'Accessibility'],
      icon: 'color-palette-outline',
      image: 'assets/developers/emily-rodriguez.jpg' // Add your image path here
    },
    {
      name: 'Picardal, Erin Denzelle B.',
      role: 'Quality Assurance',
      bio: 'Dedicated to ensuring app quality and performance. Expert in testing strategies and user experience validation.',
      skills: ['Testing', 'QA', 'Performance', 'Debugging'],
      icon: 'checkmark-circle-outline',
      image: 'assets/developers/picardal.png' // Add your image path here
    }
  ];

  companyStats = [
    { label: 'Years Serving', value: '5+', icon: 'calendar-outline' },
    { label: 'Happy Customers', value: '50K+', icon: 'happy-outline' },
    { label: 'Pizzas Delivered', value: '1M+', icon: 'pizza-outline' },
    { label: 'Cities', value: '25+', icon: 'location-outline' }
  ];
}

