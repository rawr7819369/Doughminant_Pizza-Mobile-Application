import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  templateUrl: './primary-button.component.html',
  styleUrls: ['./primary-button.component.scss'],
  imports: [CommonModule, IonButton, IonIcon, IonSpinner]
})
export class PrimaryButtonComponent {
  @Input() label: string = 'Button';
  @Input() icon?: string;
  @Input() iconPosition: 'start' | 'end' = 'start';
  @Input() expand: 'full' | 'block' = 'block';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() size: 'small' | 'default' | 'large' = 'default';
  @Output() clicked = new EventEmitter<void>();

  onClick() {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}

