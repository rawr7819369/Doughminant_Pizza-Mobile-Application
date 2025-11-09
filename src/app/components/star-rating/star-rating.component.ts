import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  imports: [CommonModule]
})
export class StarRatingComponent {
  @Input() value = 0; // 0..5
  @Input() size = 24; // px
  @Output() valueChange = new EventEmitter<number>();

  stars = [1, 2, 3, 4, 5];

  set(rating: number) {
    this.value = rating;
    this.valueChange.emit(this.value);
  }
}
