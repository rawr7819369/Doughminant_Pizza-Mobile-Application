import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  IonBadge,
  IonButton
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { OrderHistoryService, Order } from '../../services/order-history.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  templateUrl: './order-tracking.page.html',
  styleUrls: ['./order-tracking.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonBackButton, IonButtons, IonCard, IonCardContent,
    IonIcon, IonBadge, IonButton
  ]
})
export class OrderTrackingPage implements OnInit {
  order?: Order;
  orderId?: string;

  statusSteps = [
    { status: 'pending', label: 'Order Placed', icon: 'checkmark-circle' },
    { status: 'confirmed', label: 'Order Confirmed', icon: 'checkmark-circle' },
    { status: 'preparing', label: 'Preparing', icon: 'restaurant' },
    { status: 'out-for-delivery', label: 'Out for Delivery', icon: 'car' },
    { status: 'delivered', label: 'Delivered', icon: 'checkmark-done-circle' }
  ];

  constructor(
    private route: ActivatedRoute,
    public orderHistory: OrderHistoryService
  ) {}

  async ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.orderId) {
      this.order = await this.orderHistory.getOrderById(this.orderId);
    }
  }

  getCurrentStatusIndex(): number {
    if (!this.order) return 0;
    return this.statusSteps.findIndex(step => step.status === this.order?.status);
  }

  isStepCompleted(stepIndex: number): boolean {
    if (!this.order) return false;
    const currentIndex = this.getCurrentStatusIndex();
    return stepIndex <= currentIndex;
  }

  isStepActive(stepIndex: number): boolean {
    if (!this.order) return false;
    return stepIndex === this.getCurrentStatusIndex();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}

