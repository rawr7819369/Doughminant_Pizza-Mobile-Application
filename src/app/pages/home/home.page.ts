import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonBadge
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PizzaService, PizzaItem } from '../../services/pizza.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { PizzaCardComponent } from '../../components/ui/pizza-card/pizza-card.component';
import { SkeletonLoaderComponent } from '../../components/ui/skeleton-loader/skeleton-loader.component';
import { HapticService } from '../../services/haptic.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonSearchbar,
    IonBadge,
    PizzaCardComponent,
    SkeletonLoaderComponent
  ],
})
export class HomePage implements OnInit {
  pizzas: PizzaItem[] = [];
  filtered: PizzaItem[] = [];
  query = '';
  favorites = new Set<number>();
  selectedFilter = 'all'; // 'all', 'vegetarian', 'meat'
  isLoading = true;

  constructor(
    private pizzaService: PizzaService, 
    private router: Router, 
    public orders: OrderService,
    private authService: AuthService,
    private haptic: HapticService
  ) {}

  async ngOnInit() {
    // Subscribe to pizzas observable
    this.pizzaService.pizzas$.subscribe(pizzas => {
      this.pizzas = pizzas;
      this.applyFilter();
      this.isLoading = false;
    });

    // Load favorites from user profile
    this.authService.user$.pipe(
      filter(user => user !== null)
    ).subscribe(user => {
      if (user?.favorites) {
        this.favorites = new Set<number>(user.favorites);
      }
    });

    this.applyFilter();
  }

  // 🔍 Handles search input
  onSearch(ev: CustomEvent) {
    this.query = (ev.detail as any).value || '';
    this.applyFilter();
  }

  // 🧾 Filters pizzas by name or ingredients
  applyFilter() {
    const q = this.query.trim().toLowerCase();
    let results = !q
      ? this.pizzas
      : this.pizzas.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.ingredients.toLowerCase().includes(q)
        );

    // Apply category filter
    if (this.selectedFilter === 'vegetarian') {
      results = results.filter(p => 
        p.name.toLowerCase().includes('veg') || 
        p.name.toLowerCase().includes('hawaiian')
      );
    } else if (this.selectedFilter === 'meat') {
      results = results.filter(p => 
        p.name.toLowerCase().includes('bbq') || 
        p.name.toLowerCase().includes('chicken') ||
        p.name.toLowerCase().includes('meat') ||
        p.name.toLowerCase().includes('pepperoni') ||
        p.name.toLowerCase().includes('margherita')
      );
    }
    // 'all' shows everything

    // Default fallback values
    this.filtered = results.map((p) => ({
      ...p,
      price: p.price || 8.0,
      rating: p.rating || 4.5,
      time: p.time || '30min',
    }));
  }

  // 🥬 Set filter category
  async setFilter(filter: string) {
    await this.haptic.selection();
    this.selectedFilter = filter;
    this.applyFilter();
  }

  // ➕ Opens pizza details page
  openDetails(id: number) {
    this.router.navigate(['/pizza', id]);
  }

  // ❤️ Toggle favorite pizzas
  async toggleFavorite(id: number) {
    await this.haptic.medium();
    const user = this.authService.user;
    if (!user) {
      return;
    }

    if (this.favorites.has(id)) {
      this.favorites.delete(id);
    } else {
      this.favorites.add(id);
    }

    // Update favorites in Firestore
    try {
      await this.authService.updateUserFavorites(user.uid, Array.from(this.favorites));
    } catch (error) {
      console.error('Error updating favorites:', error);
      // Revert change on error
      if (this.favorites.has(id)) {
        this.favorites.delete(id);
      } else {
        this.favorites.add(id);
      }
    }
  }

  // ✅ Check if pizza is favorited
  isFavorite(id: number): boolean {
    return this.favorites.has(id);
  }

  // 📜 Scroll to pizzas section
  scrollToPizzas() {
    const element = document.querySelector('.section-header');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
