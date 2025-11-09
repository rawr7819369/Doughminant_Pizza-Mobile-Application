import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import type { PizzaItem } from './pizza.service';
import type { PizzaCustomization } from './customization.service';
import { CustomizationService } from './customization.service';
import { AuthService } from './auth.service';
import { 
  doc, 
  getDoc, 
  setDoc, 
  Firestore,
  serverTimestamp
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface CartItem {
  pizza: PizzaItem;
  size: 'Small' | 'Medium' | 'Large';
  quantity: number;
  customization?: PizzaCustomization;
}

const CART_KEY = 'dp_cart';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private _items$ = new BehaviorSubject<CartItem[]>([]);
  items$ = this._items$.asObservable();
  private initialized = false;

  get firestore(): Firestore {
    return this.firebaseService.firestore;
  }

  constructor(
    private customizationService: CustomizationService,
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) {
    // Load cart when user logs in
    this.authService.user$.pipe(
      filter(user => user !== null),
      take(1)
    ).subscribe(() => {
      this.loadCartFromFirestore();
    });

    // Clear cart when user logs out
    this.authService.user$.pipe(
      filter(user => user === null)
    ).subscribe(() => {
      this._items$.next([]);
      this.initialized = false;
    });
  }

  /**
   * Load cart from Firestore for current user
   */
  private async loadCartFromFirestore(): Promise<void> {
    const user = this.authService.user;
    if (!user) {
      // Fallback to localStorage for non-authenticated users
      this.loadFromLocalStorage();
      return;
    }

    try {
      const cartDoc = await getDoc(doc(this.firestore, 'carts', user.uid));
      
      if (cartDoc.exists()) {
        const data = cartDoc.data();
        const items: CartItem[] = data['items'] || [];
        this._items$.next(items);
        
        // Migrate localStorage cart if exists
        await this.migrateLocalStorageCart(user.uid);
      } else {
        // Check localStorage for migration
        await this.migrateLocalStorageCart(user.uid);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error loading cart from Firestore:', error);
      // Fallback to localStorage
      this.loadFromLocalStorage();
      this.initialized = true;
    }
  }

  /**
   * Load cart from localStorage (fallback)
   */
  private loadFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const items = raw ? JSON.parse(raw) : [];
      this._items$.next(items);
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this._items$.next([]);
    }
  }

  /**
   * Migrate cart from localStorage to Firestore
   */
  private async migrateLocalStorageCart(uid: string): Promise<void> {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const items: CartItem[] = JSON.parse(raw);
        if (items.length > 0) {
          await this.saveCartToFirestore(uid, items);
          localStorage.removeItem(CART_KEY);
        }
      }
    } catch (error) {
      console.error('Error migrating cart:', error);
    }
  }

  /**
   * Save cart to Firestore
   */
  private async saveCartToFirestore(uid: string, items: CartItem[]): Promise<void> {
    try {
      await setDoc(doc(this.firestore, 'carts', uid), {
        items: items,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving cart to Firestore:', error);
      throw error;
    }
  }

  /**
   * Persist cart to Firestore or localStorage
   */
  private async persist(items: CartItem[]): Promise<void> {
    const user = this.authService.user;
    
    if (user) {
      // Save to Firestore
      await this.saveCartToFirestore(user.uid, items);
    } else {
      // Fallback to localStorage
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }

  /**
   * Add item to cart
   */
  async add(item: CartItem): Promise<void> {
    const items = [...this._items$.value, item];
    this._items$.next(items);
    await this.persist(items);
  }

  /**
   * Remove item from cart
   */
  async remove(index: number): Promise<void> {
    const items = this._items$.value.filter((_, i) => i !== index);
    this._items$.next(items);
    await this.persist(items);
  }

  /**
   * Update item quantity
   */
  async updateQuantity(index: number, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.remove(index);
      return;
    }
    const items = this._items$.value.map((item, i) => 
      i === index ? { ...item, quantity } : item
    );
    this._items$.next(items);
    await this.persist(items);
  }

  /**
   * Increase item quantity
   */
  async increaseQuantity(index: number): Promise<void> {
    const items = this._items$.value.map((item, i) => 
      i === index ? { ...item, quantity: item.quantity + 1 } : item
    );
    this._items$.next(items);
    await this.persist(items);
  }

  /**
   * Decrease item quantity
   */
  async decreaseQuantity(index: number): Promise<void> {
    const item = this._items$.value[index];
    if (item.quantity > 1) {
      const items = this._items$.value.map((item, i) => 
        i === index ? { ...item, quantity: item.quantity - 1 } : item
      );
      this._items$.next(items);
      await this.persist(items);
    } else {
      await this.remove(index);
    }
  }

  /**
   * Clear cart
   */
  async clear(): Promise<void> {
    this._items$.next([]);
    const user = this.authService.user;
    if (user) {
      await this.saveCartToFirestore(user.uid, []);
    } else {
      localStorage.removeItem(CART_KEY);
    }
  }

  /**
   * Get total items in cart
   */
  getTotalItems(): number {
    return this._items$.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Calculate cart total
   */
  total(): number {
    return this._items$.value.reduce((sum, it) => {
      let itemPrice = it.pizza.price;
      
      // Add customization price if exists
      if (it.customization) {
        itemPrice += this.customizationService.calculateCustomizationPrice(it.customization);
      }
      
      return sum + itemPrice * it.quantity;
    }, 0);
  }
}
