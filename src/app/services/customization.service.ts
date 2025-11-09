import { Injectable } from '@angular/core';

export interface Topping {
  id: string;
  name: string;
  price: number;
  category: 'meat' | 'vegetable' | 'cheese' | 'sauce';
  isPremium: boolean;
}

export interface Crust {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
  category: 'sides' | 'beverages' | 'desserts';
}

export interface PizzaCustomization {
  selectedToppings: Topping[];
  selectedCrust: Crust;
  selectedExtras: Extra[];
  specialInstructions: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomizationService {
  
  // Available toppings
  private readonly toppings: Topping[] = [
    // Meat toppings
    { id: 'pepperoni', name: 'Pepperoni', price: 15, category: 'meat', isPremium: false },
    { id: 'sausage', name: 'Italian Sausage', price: 18, category: 'meat', isPremium: false },
    { id: 'bacon', name: 'Bacon', price: 20, category: 'meat', isPremium: true },
    { id: 'ham', name: 'Ham', price: 16, category: 'meat', isPremium: false },
    { id: 'chicken', name: 'Grilled Chicken', price: 22, category: 'meat', isPremium: true },
    { id: 'beef', name: 'Ground Beef', price: 18, category: 'meat', isPremium: false },
    
    // Vegetable toppings
    { id: 'mushrooms', name: 'Mushrooms', price: 8, category: 'vegetable', isPremium: false },
    { id: 'onions', name: 'Onions', price: 6, category: 'vegetable', isPremium: false },
    { id: 'peppers', name: 'Bell Peppers', price: 8, category: 'vegetable', isPremium: false },
    { id: 'olives', name: 'Black Olives', price: 10, category: 'vegetable', isPremium: false },
    { id: 'tomatoes', name: 'Fresh Tomatoes', price: 8, category: 'vegetable', isPremium: false },
    { id: 'pineapple', name: 'Pineapple', price: 10, category: 'vegetable', isPremium: false },
    { id: 'spinach', name: 'Spinach', price: 8, category: 'vegetable', isPremium: false },
    { id: 'jalapenos', name: 'Jalapeños', price: 8, category: 'vegetable', isPremium: false },
    
    // Cheese toppings
    { id: 'mozzarella', name: 'Extra Mozzarella', price: 12, category: 'cheese', isPremium: false },
    { id: 'parmesan', name: 'Parmesan', price: 15, category: 'cheese', isPremium: true },
    { id: 'cheddar', name: 'Cheddar', price: 12, category: 'cheese', isPremium: false },
    { id: 'feta', name: 'Feta Cheese', price: 18, category: 'cheese', isPremium: true },
    { id: 'goat', name: 'Goat Cheese', price: 20, category: 'cheese', isPremium: true },
    
    // Sauce toppings
    { id: 'bbq', name: 'BBQ Sauce', price: 5, category: 'sauce', isPremium: false },
    { id: 'ranch', name: 'Ranch Dressing', price: 5, category: 'sauce', isPremium: false },
    { id: 'pesto', name: 'Pesto Sauce', price: 8, category: 'sauce', isPremium: true },
    { id: 'buffalo', name: 'Buffalo Sauce', price: 6, category: 'sauce', isPremium: false }
  ];

  // Available crusts
  private readonly crusts: Crust[] = [
    { id: 'original', name: 'Original Crust', price: 0, description: 'Our classic hand-tossed crust' },
    { id: 'thin', name: 'Thin Crust', price: 0, description: 'Crispy and light thin crust' },
    { id: 'thick', name: 'Thick Crust', price: 5, description: 'Deep dish style thick crust' },
    { id: 'stuffed', name: 'Stuffed Crust', price: 8, description: 'Crust filled with cheese' },
    { id: 'gluten-free', name: 'Gluten-Free', price: 10, description: 'Gluten-free crust option' },
    { id: 'cauliflower', name: 'Cauliflower Crust', price: 12, description: 'Low-carb cauliflower crust' }
  ];

  // Available extras
  private readonly extras: Extra[] = [
    // Sides
    { id: 'garlic-bread', name: 'Garlic Bread', price: 25, category: 'sides' },
    { id: 'wings', name: 'Chicken Wings (6pc)', price: 45, category: 'sides' },
    { id: 'salad', name: 'Caesar Salad', price: 35, category: 'sides' },
    { id: 'fries', name: 'French Fries', price: 20, category: 'sides' },
    { id: 'mozzarella-sticks', name: 'Mozzarella Sticks (6pc)', price: 30, category: 'sides' },
    
    // Beverages
    { id: 'coke', name: 'Coca-Cola', price: 15, category: 'beverages' },
    { id: 'pepsi', name: 'Pepsi', price: 15, category: 'beverages' },
    { id: 'sprite', name: 'Sprite', price: 15, category: 'beverages' },
    { id: 'water', name: 'Bottled Water', price: 10, category: 'beverages' },
    { id: 'juice', name: 'Orange Juice', price: 20, category: 'beverages' },
    
    // Desserts
    { id: 'brownie', name: 'Chocolate Brownie', price: 25, category: 'desserts' },
    { id: 'ice-cream', name: 'Ice Cream Scoop', price: 20, category: 'desserts' },
    { id: 'tiramisu', name: 'Tiramisu', price: 35, category: 'desserts' }
  ];

  getToppings(): Topping[] {
    return this.toppings;
  }

  getToppingsByCategory(category: string): Topping[] {
    return this.toppings.filter(topping => topping.category === category);
  }

  getCrusts(): Crust[] {
    return this.crusts;
  }

  getExtras(): Extra[] {
    return this.extras;
  }

  getExtrasByCategory(category: string): Extra[] {
    return this.extras.filter(extra => extra.category === category);
  }

  getToppingById(id: string): Topping | undefined {
    return this.toppings.find(topping => topping.id === id);
  }

  getCrustById(id: string): Crust | undefined {
    return this.crusts.find(crust => crust.id === id);
  }

  getExtraById(id: string): Extra | undefined {
    return this.extras.find(extra => extra.id === id);
  }

  calculateCustomizationPrice(customization: PizzaCustomization): number {
    let total = 0;
    
    // Add topping prices
    total += customization.selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    
    // Add crust price
    total += customization.selectedCrust.price;
    
    // Add extras price
    total += customization.selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    
    return total;
  }
}
