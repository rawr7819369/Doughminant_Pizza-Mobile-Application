import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonBackButton, IonButtons, IonCard, IonCardContent, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderHistoryService, Order } from '../../services/order-history.service';

@Component({
  selector: 'app-receipt',
  standalone: true,
  templateUrl: './receipt.page.html',
  styleUrls: ['./receipt.page.scss'],
  imports: [CommonModule, RouterModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonBackButton, IonButtons, IonCard, IonCardContent, IonIcon, IonBadge]
})
export class ReceiptPage implements OnInit {
  order: Order | null = null;

  constructor(
    public orderHistory: OrderHistoryService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Check for order ID in query params
    const orderId = this.route.snapshot.queryParams['orderId'];
    if (orderId) {
      this.order = await this.orderHistory.getOrderById(orderId) || null;
    } else {
      // Fallback to latest order
      this.order = this.latestOrder;
    }
  }

  get latestOrder(): Order | null {
    const orders = this.orderHistory.getAll();
    return orders.length > 0 ? orders[0] : null;
  }

  print() {
    window.print();
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
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
