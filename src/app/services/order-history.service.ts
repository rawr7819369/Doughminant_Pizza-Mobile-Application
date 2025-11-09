import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import type { CartItem } from './order.service';
import { AuthService } from './auth.service';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Firestore,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface Order {
  id: string;
  userId: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered';
  address?: string;
  phone?: string;
  paymentMethod?: string;
  createdAt?: Date;
}

const ORDERS_KEY = 'dp_orders';

@Injectable({ providedIn: 'root' })
export class OrderHistoryService {
  private _orders$ = new BehaviorSubject<Order[]>([]);
  orders$ = this._orders$.asObservable();

  get firestore(): Firestore {
    return this.firebaseService.firestore;
  }

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {
    // Load orders when user logs in
    this.authService.user$.pipe(
      filter(user => user !== null)
    ).subscribe(() => {
      this.loadOrdersFromFirestore();
    });

    // Clear orders when user logs out
    this.authService.user$.pipe(
      filter(user => user === null)
    ).subscribe(() => {
      this._orders$.next([]);
    });
  }

  /**
   * Load orders from Firestore for current user
   */
  private async loadOrdersFromFirestore(): Promise<void> {
    const user = this.authService.user;
    if (!user) {
      return;
    }

    try {
      const ordersCollection = collection(this.firestore, 'orders');
      const q = query(
        ordersCollection,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push(this.convertFirestoreOrder(data));
      });
      
      this._orders$.next(orders);
      
      // Migrate localStorage orders if exists
      await this.migrateLocalStorageOrders(user.uid);
    } catch (error) {
      console.error('Error loading orders from Firestore:', error);
      // Fallback to localStorage
      this.loadFromLocalStorage();
    }
  }

  /**
   * Load orders from localStorage (fallback)
   */
  private loadFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      if (!raw) return;
      
      const orders = JSON.parse(raw);
      // Convert date strings back to Date objects
      const convertedOrders = orders.map((order: any) => ({
        ...order,
        date: new Date(order.date),
        createdAt: order.createdAt ? new Date(order.createdAt) : undefined
      }));
      
      this._orders$.next(convertedOrders);
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
      this._orders$.next([]);
    }
  }

  /**
   * Migrate orders from localStorage to Firestore
   */
  private async migrateLocalStorageOrders(uid: string): Promise<void> {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      if (!raw) return;
      
      const orders: Order[] = JSON.parse(raw);
      if (orders.length === 0) return;

      // Migrate each order to Firestore
      for (const order of orders) {
        // Only migrate if order doesn't already exist in Firestore
        const orderDoc = await getDoc(doc(this.firestore, 'orders', order.id));
        if (!orderDoc.exists()) {
          await this.saveOrderToFirestore(order);
        }
      }

      // Clear localStorage after migration
      localStorage.removeItem(ORDERS_KEY);
    } catch (error) {
      console.error('Error migrating orders:', error);
    }
  }

  /**
   * Convert Firestore order data to Order interface
   */
  private convertFirestoreOrder(data: any): Order {
    return {
      id: data['id'],
      userId: data['userId'],
      date: data['date']?.toDate() || new Date(),
      items: data['items'] || [],
      subtotal: data['subtotal'] || 0,
      deliveryFee: data['deliveryFee'] || 0,
      total: data['total'] || 0,
      status: data['status'] || 'pending',
      address: data['address'],
      phone: data['phone'],
      paymentMethod: data['paymentMethod'],
      createdAt: data['createdAt']?.toDate() || new Date()
    };
  }

  /**
   * Save order to Firestore
   */
  private async saveOrderToFirestore(order: Order): Promise<void> {
    try {
      const orderRef = doc(this.firestore, 'orders', order.id);
      await setDoc(orderRef, {
        id: order.id,
        userId: order.userId,
        date: Timestamp.fromDate(order.date),
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        status: order.status,
        address: order.address || '',
        phone: order.phone || '',
        paymentMethod: order.paymentMethod || '',
        createdAt: order.createdAt ? Timestamp.fromDate(order.createdAt) : serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving order to Firestore:', error);
      throw error;
    }
  }

  /**
   * Add new order
   */
  async add(order: Order): Promise<void> {
    const user = this.authService.user;
    if (!user) {
      throw new Error('User must be authenticated to add orders');
    }

    // Ensure order has userId
    order.userId = user.uid;
    order.createdAt = new Date();

    try {
      // Save to Firestore
      await this.saveOrderToFirestore(order);
      
      // Update local state
      const orders = [order, ...this._orders$.value];
      this._orders$.next(orders);
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const orderRef = doc(this.firestore, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      const user = this.authService.user;
      const orderData = orderDoc.data();
      
      // Verify user owns this order
      if (orderData['userId'] !== user?.uid) {
        throw new Error('Unauthorized to update this order');
      }

      await setDoc(orderRef, {
        status: status,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update local state
      const orders = this._orders$.value.map(order => 
        order.id === orderId ? { ...order, status } : order
      );
      this._orders$.next(orders);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order | undefined> {
    try {
      const orderDoc = await getDoc(doc(this.firestore, 'orders', id));
      
      if (orderDoc.exists()) {
        const data = orderDoc.data();
        const user = this.authService.user;
        
        // Verify user owns this order
        if (data['userId'] !== user?.uid) {
          return undefined;
        }
        
        return this.convertFirestoreOrder(data);
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      // Fallback to local state
      return this._orders$.value.find(order => order.id === id);
    }
  }

  /**
   * Get all orders for current user
   */
  getAll(): Order[] {
    return this._orders$.value;
  }

  /**
   * Get pending orders
   */
  getPending(): Order[] {
    return this._orders$.value.filter(order => 
      order.status !== 'delivered'
    );
  }

  /**
   * Get latest order
   */
  getLatestOrder(): Order | null {
    const orders = this._orders$.value;
    return orders.length > 0 ? orders[0] : null;
  }
}
