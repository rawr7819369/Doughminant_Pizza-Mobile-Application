import { Component } from '@angular/core';
import { HapticService } from '../../services/haptic.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonToggle,
  IonBackButton,
  IonButtons,
  IonRadio,
  IonRadioGroup,
  IonTextarea
} from '@ionic/angular/standalone';
import { OrderService, CartItem } from '../../services/order.service';
import { CustomizationService } from '../../services/customization.service';
import { EmptyStateComponent } from '../../components/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
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
    IonToggle,
    IonBackButton,
    IonButtons,
    IonRadio,
    IonRadioGroup,
    IonTextarea,
    EmptyStateComponent
  ],
})
export class CartPage {
  leaveAtDoor = false;
  selectedPaymentMethod = 'cash';
  specialInstructions = '';

  constructor(
    public orders: OrderService,
    private customizationService: CustomizationService,
    private router: Router,
    private authService: AuthService,
    private haptic: HapticService
  ) {}

  getItemTotal(item: CartItem): number {
    let total = item.pizza.price;
    if (item.customization) {
      total += this.customizationService.calculateCustomizationPrice(
        item.customization
      );
    }
    return total * item.quantity;
  }

  getToppingsText(item: CartItem): string {
    if (!item.customization || !item.customization.selectedToppings) {
      return '';
    }
    return item.customization.selectedToppings.map(t => t.name).join(', ');
  }

  async onPlaceOrder() {
    await this.haptic.medium();
    // Check if user is authenticated, if not, redirect to login
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Navigate to payment page
    this.router.navigate(['/payment']);
  }

  async onQuantityChange() {
    await this.haptic.selection();
  }

  async onRemove() {
    await this.haptic.light();
  }
}
