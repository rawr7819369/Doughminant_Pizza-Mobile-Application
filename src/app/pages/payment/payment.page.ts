import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonLabel, IonInput, IonButton, IonBackButton, IonButtons, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { LoadingController, ToastController } from '@ionic/angular';
import { OrderService, CartItem } from '../../services/order.service';
import { OrderHistoryService, Order } from '../../services/order-history.service';
import { HapticService } from '../../services/haptic.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-payment',
  standalone: true,
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonLabel, IonInput, IonButton, IonBackButton, IonButtons, IonCard, IonCardContent, IonIcon, FormsModule]
})
export class PaymentPage {
  // Delivery address fields
  street = '';
  city = '';
  zipCode = '';
  phone = '';
  
  // Payment method fields
  name = '';
  card = '';
  expiry = '';
  cvv = '';
  
  isLoading = false;

  constructor(
    private loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private orderService: OrderService,
    private orderHistory: OrderHistoryService,
    private router: Router,
    private haptic: HapticService
  ) {}

  async onPay() {
    await this.haptic.medium();
    // Validate delivery address
    if (!this.street || !this.city || !this.zipCode || !this.phone) {
      await this.haptic.error();
      const toast = await this.toastCtrl.create({
        message: 'Please fill in delivery address',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    // Validate payment details
    if (!this.name || !this.card || !this.expiry || !this.cvv) {
      const toast = await this.toastCtrl.create({
        message: 'Please fill in all payment details',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;
    
    // Mock payment: show loading, then show receipt modal and toast
    const loading = await this.loadingCtrl.create({ message: 'Processing payment...', duration: 1200 });
    await loading.present();
    await new Promise(r => setTimeout(r, 1200));
    
    // Get cart items
    const cartItems: CartItem[] = await firstValueFrom(this.orderService.items$) || [];
    
    if (cartItems.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'Your cart is empty',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      await loading.dismiss();
      return;
    }

    const orderId = `ORD${Date.now()}`;
    const subtotal = this.orderService.total();
    const deliveryFee = 2.00;
    
    const order: Order = {
      id: orderId,
      userId: '', // Will be set in OrderHistoryService
      date: new Date(),
      items: cartItems,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: subtotal + deliveryFee,
      status: 'pending',
      address: `${this.street}, ${this.city}, ${this.zipCode}`,
      phone: this.phone,
      paymentMethod: `Card ending in ${this.card.slice(-4)}`
    };
    
    // Save order to history
    try {
      await this.orderHistory.add(order);
    } catch (error) {
      await loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Failed to save order. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
      return;
    }
    
    // Show success message
    await this.haptic.success();
    const toast = await this.toastCtrl.create({
      message: 'Payment successful! 🎉',
      duration: 1500,
      color: 'success'
    });
    await toast.present();
    
    await loading.dismiss();
    this.isLoading = false;
    
    // Clear the cart after successful payment
    await this.orderService.clear();
    
    // Navigate to receipt page with order ID
    await this.router.navigate(['/receipt'], { 
      queryParams: { orderId: orderId } 
    });
  }
}
