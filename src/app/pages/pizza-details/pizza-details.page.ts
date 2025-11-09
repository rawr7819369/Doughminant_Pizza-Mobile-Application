import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonTextarea, IonIcon, IonBackButton, IonButtons, IonToggle, IonBadge } from '@ionic/angular/standalone';
import { PizzaService, PizzaItem } from '../../services/pizza.service';
import { OrderService } from '../../services/order.service';
import { CustomizationService, PizzaCustomization, Topping, Crust, Extra } from '../../services/customization.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-pizza-details',
  standalone: true,
  templateUrl: './pizza-details.page.html',
  styleUrls: ['./pizza-details.page.scss'],
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonTextarea, IonIcon, IonBackButton, IonButtons, IonToggle, IonBadge, FormsModule]
})
export class PizzaDetailsPage {
  pizza?: PizzaItem;
  size: 'Small' | 'Medium' | 'Large' = 'Medium';
  
  // Customization properties
  selectedToppings: Topping[] = [];
  selectedCrust: Crust | null = null;
  selectedExtras: Extra[] = [];
  specialInstructions: string = '';
  showCustomization: boolean = false;
  
  // Available options
  toppings: Topping[] = [];
  crusts: Crust[] = [];
  extras: Extra[] = [];
  
  // UI state
  activeSegment: string = 'toppings';

  constructor(
    private route: ActivatedRoute, 
    private pizzas: PizzaService, 
    public orders: OrderService, 
    private customizationService: CustomizationService,
    private toastCtrl: ToastController
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.pizza = this.pizzas.byId(id);
    
    // Initialize customization options
    this.toppings = this.customizationService.getToppings();
    this.crusts = this.customizationService.getCrusts();
    this.extras = this.customizationService.getExtras();
    
    // Set default crust
    this.selectedCrust = this.crusts.find(c => c.id === 'original') || this.crusts[0];
  }

  toggleCustomization() {
    this.showCustomization = !this.showCustomization;
  }

  toggleTopping(topping: Topping) {
    const index = this.selectedToppings.findIndex(t => t.id === topping.id);
    if (index > -1) {
      this.selectedToppings.splice(index, 1);
    } else {
      this.selectedToppings.push(topping);
    }
  }

  isToppingSelected(topping: Topping): boolean {
    return this.selectedToppings.some(t => t.id === topping.id);
  }

  toggleExtra(extra: Extra) {
    const index = this.selectedExtras.findIndex(e => e.id === extra.id);
    if (index > -1) {
      this.selectedExtras.splice(index, 1);
    } else {
      this.selectedExtras.push(extra);
    }
  }

  isExtraSelected(extra: Extra): boolean {
    return this.selectedExtras.some(e => e.id === extra.id);
  }

  getTotalPrice(): number {
    if (!this.pizza) return 0;
    
    let total = this.pizza.price;
    
    // Add customization costs
    total += this.selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    if (this.selectedCrust) {
      total += this.selectedCrust.price;
    }
    total += this.selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    
    return total;
  }

  getToppingIcon(toppingName: string): string {
    const iconMap: { [key: string]: string } = {
      'Extra Cheese': 'cheese-outline',
      'Mushrooms': 'leaf-outline',
      'Onions': 'ellipse-outline',
      'Bacon': 'restaurant-outline',
      'Pepperoni': 'ellipse-outline',
      'Sausage': 'ellipse-outline',
      'Ham': 'ellipse-outline',
      'Chicken': 'ellipse-outline',
      'Bell Peppers': 'ellipse-outline',
      'Olives': 'ellipse-outline',
      'Jalapeños': 'flame-outline'
    };
    return iconMap[toppingName] || 'ellipse-outline';
  }

  setSize(newSize: string) {
    this.size = newSize as 'Small' | 'Medium' | 'Large';
  }

  addToCart() {
    if (!this.pizza) return;
    
    const customization: PizzaCustomization = {
      selectedToppings: this.selectedToppings,
      selectedCrust: this.selectedCrust!,
      selectedExtras: this.selectedExtras,
      specialInstructions: this.specialInstructions
    };
    
    this.orders.add({ 
      pizza: this.pizza, 
      size: this.size, 
      quantity: 1,
      customization: this.showCustomization ? customization : undefined
    });
    
    this.toastCtrl.create({ 
      message: 'Added to cart', 
      duration: 1200, 
      color: 'success' 
    }).then(t => t.present());
  }
}
