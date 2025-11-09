import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';
import { PizzaItem } from '../../../services/pizza.service';

@Component({
  selector: 'app-pizza-card',
  standalone: true,
  templateUrl: './pizza-card.component.html',
  styleUrls: ['./pizza-card.component.scss'],
  imports: [CommonModule, RouterModule, IonIcon, IonButton]
})
export class PizzaCardComponent {
  @Input() pizza!: PizzaItem;
  @Input() isFavorite: boolean = false;
  @Input() showBadges: boolean = true;
  @Output() favoriteToggled = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<number>();

  onFavoriteClick(event: Event) {
    event.stopPropagation();
    this.favoriteToggled.emit(this.pizza.id);
  }

  onAddClick(event: Event) {
    event.stopPropagation();
    this.addToCart.emit(this.pizza.id);
  }

  getBadges(): string[] {
    const badges: string[] = [];
    if (this.pizza.rating >= 4.8) badges.push('best-seller');
    if (this.pizza.id === 5) badges.push('chef-choice');
    if (this.pizza.id === 1) badges.push('new');
    return badges;
  }
}

