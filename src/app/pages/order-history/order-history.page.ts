import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';
import { OrderHistoryService, Order } from '../../services/order-history.service';
import { EmptyStateComponent } from '../../components/ui/empty-state/empty-state.component';
import { OrderCardComponent } from '../../components/ui/order-card/order-card.component';
import { SkeletonLoaderComponent } from '../../components/ui/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonBackButton, IonButtons,
    EmptyStateComponent, OrderCardComponent, SkeletonLoaderComponent
  ]
})
export class OrderHistoryPage {
  isLoading = true;

  constructor(public orderHistory: OrderHistoryService) {
    // Set loading to false when orders are loaded
    this.orderHistory.orders$.subscribe(() => {
      this.isLoading = false;
    });
  }

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

