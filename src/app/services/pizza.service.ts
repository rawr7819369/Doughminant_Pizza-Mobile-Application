import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  Firestore,
  query,
  orderBy
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface PizzaItem {
  id: number;
  name: string;
  ingredients: string;
  price: number;
  size: string[];
  img: string;
  rating: number;     // ⭐ Rating (displayed on UI)
  time: string;       // ⏱️ Estimated cooking time
  discount?: number;  // 💸 Optional discount percentage
  customizable?: boolean; // 🎨 Whether this pizza can be customized
}

@Injectable({ providedIn: 'root' })
export class PizzaService {
  private _pizzas$ = new BehaviorSubject<PizzaItem[]>([]);
  pizzas$ = this._pizzas$.asObservable();
  private initialized = false;

  // Default pizzas data (will be seeded to Firestore if collection is empty)
  private readonly defaultPizzas: PizzaItem[] = [
    {
      id: 1,
      name: 'Pepperoni Feast',
      ingredients: 'Pepperoni, Cheese, Tomato Sauce',
      price: 299,
      size: ['Small', 'Medium', 'Large'],
      img: 'assets/product_images/PepperoniPizza.jpg',
      rating: 4.8,
      time: '25 min',
      discount: 25,
      customizable: true
    },
    {
      id: 2,
      name: 'BBQ Chicken Pizza',
      ingredients: 'Chicken, BBQ Sauce, Mushrooms, Olives',
      price: 319,
      size: ['Small', 'Medium', 'Large'],
      img: 'assets/product_images/BBQ-Chicken-PizzaIMG.jpg',
      rating: 4.6,
      time: '30 min',
      discount: 20,
      customizable: true
    },
    {
      id: 3,
      name: 'Hawaiian Classic',
      ingredients: 'Ham, Pineapple, Cheese',
      price: 289,
      size: ['Small', 'Medium', 'Large'],
      img: 'assets/product_images/Hawaiian-Pizza-3.jpg',
      rating: 4.7,
      time: '22 min',
      discount: 15,
      customizable: true
    },
    {
      id: 4,
      name: 'Veggie Delight',
      ingredients: 'Bell Peppers, Mushrooms, Olives, Cheese',
      price: 279,
      size: ['Small', 'Medium', 'Large'],
      img: 'assets/product_images/vegi-pizza.jpg',
      rating: 4.5,
      time: '24 min',
      discount: 10,
      customizable: true
    },
    {
      id: 5,
      name: 'Cheesy Overload',
      ingredients: 'Mozzarella, Parmesan, Cheddar, Cream Cheese',
      price: 309,
      size: ['Small', 'Medium', 'Large'],
      img: 'assets/product_images/cheese-pizza.jpg',
      rating: 4.9,
      time: '27 min',
      discount: 18,
      customizable: true
    }
  ];

  get firestore(): Firestore {
    return this.firebaseService.firestore;
  }

  constructor(private firebaseService: FirebaseService) {
    this.initializePizzas();
  }

  /**
   * Initialize pizzas from Firestore or seed default data
   */
  private async initializePizzas(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const pizzas = await this.loadPizzasFromFirestore();
      
      if (pizzas.length === 0) {
        // Seed default pizzas to Firestore
        await this.seedPizzas();
        this._pizzas$.next(this.defaultPizzas);
      } else {
        this._pizzas$.next(pizzas);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing pizzas:', error);
      // Fallback to default pizzas if Firestore fails
      this._pizzas$.next(this.defaultPizzas);
      this.initialized = true;
    }
  }

  /**
   * Load pizzas from Firestore
   */
  private async loadPizzasFromFirestore(): Promise<PizzaItem[]> {
    try {
      const pizzasCollection = collection(this.firestore, 'pizzas');
      const q = query(pizzasCollection, orderBy('id'));
      const querySnapshot = await getDocs(q);
      
      const pizzas: PizzaItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pizzas.push({
          id: data['id'],
          name: data['name'],
          ingredients: data['ingredients'],
          price: data['price'],
          size: data['size'],
          img: data['img'],
          rating: data['rating'],
          time: data['time'],
          discount: data['discount'],
          customizable: data['customizable'] !== false
        });
      });
      
      return pizzas;
    } catch (error) {
      console.error('Error loading pizzas from Firestore:', error);
      return [];
    }
  }

  /**
   * Seed default pizzas to Firestore
   */
  private async seedPizzas(): Promise<void> {
    try {
      const batch: Promise<void>[] = [];
      
      for (const pizza of this.defaultPizzas) {
        const pizzaRef = doc(this.firestore, 'pizzas', `pizza-${pizza.id}`);
        batch.push(setDoc(pizzaRef, pizza));
      }
      
      await Promise.all(batch);
      console.log('Pizzas seeded to Firestore');
    } catch (error) {
      console.error('Error seeding pizzas:', error);
      throw error;
    }
  }

  /**
   * Returns all pizza items
   */
  list(): PizzaItem[] {
    return this._pizzas$.value;
  }

  /**
   * Returns all pizza items as Observable
   */
  list$(): Observable<PizzaItem[]> {
    return this.pizzas$;
  }

  /**
   * Find a pizza by its ID
   */
  byId(id: number): PizzaItem | undefined {
    return this._pizzas$.value.find(p => p.id === id);
  }

  /**
   * Get pizza by ID from Firestore
   */
  async getPizzaById(id: number): Promise<PizzaItem | undefined> {
    try {
      const pizzaDoc = await getDoc(doc(this.firestore, 'pizzas', `pizza-${id}`));
      if (pizzaDoc.exists()) {
        const data = pizzaDoc.data();
        return {
          id: data['id'],
          name: data['name'],
          ingredients: data['ingredients'],
          price: data['price'],
          size: data['size'],
          img: data['img'],
          rating: data['rating'],
          time: data['time'],
          discount: data['discount'],
          customizable: data['customizable'] !== false
        };
      }
      return undefined;
    } catch (error) {
      console.error('Error getting pizza by ID:', error);
      // Fallback to local data
      return this.byId(id);
    }
  }
}
