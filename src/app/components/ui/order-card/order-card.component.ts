import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonIcon, IonButton, IonBadge } from '@ionic/angular/standalone';
import { Order } from '../../../services/order-history.service';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IonIcon, IonButton, IonBadge],
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss']
})
export class OrderCardComponent {
  @Input() order!: Order;

  getStatusColor(status: Order['status']): string {
    const colors: Record<string, string> = {
      'pending': 'warning',
      'confirmed': 'success',
      'preparing': 'primary',
      'out-for-delivery': 'tertiary',
      'delivered': 'success'
    };
    return colors[status] || 'medium';
  }

  getStatusIcon(status: Order['status']): string {
    const icons: Record<string, string> = {
      'pending': 'time-outline',
      'confirmed': 'checkmark-circle-outline',
      'preparing': 'restaurant-outline',
      'out-for-delivery': 'car-outline',
      'delivered': 'checkmark-done-outline'
    };
    return icons[status] || 'ellipse-outline';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}

