import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonTextarea,
  IonButton,
  IonBackButton,
  IonButtons,
  IonChip
} from '@ionic/angular/standalone';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';

@Component({
  selector: 'app-feedback',
  standalone: true,
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
  imports: [
    FormsModule,
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonTextarea,
    IonButton,
    IonBackButton,
    IonButtons,
    IonChip,
    StarRatingComponent
  ]
})
export class FeedbackPage {
  rating = 0;
  comment = '';
  tags = ['Great Taste', 'Fast Delivery', 'Easy to Use', 'Good Price', 'Friendly UI'];
  selectedTags: string[] = [];

  toggleTag(tag: string) {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
  }

  submit() {
    const data = {
      rating: this.rating,
      comment: this.comment,
      tags: this.selectedTags,
      date: new Date().toISOString(),
    };
    localStorage.setItem('dp_feedback', JSON.stringify(data));
    alert('Thank you for your feedback!');
    this.rating = 0;
    this.comment = '';
    this.selectedTags = [];
  }
}
