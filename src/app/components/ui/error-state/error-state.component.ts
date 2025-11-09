import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton],
  templateUrl: './error-state.component.html',
  styleUrls: ['./error-state.component.scss']
})
export class ErrorStateComponent {
  @Input() icon: string = 'alert-circle-outline';
  @Input() title: string = 'Something went wrong';
  @Input() message: string = 'We encountered an error. Please try again.';
  @Input() showRetry: boolean = true;
  @Input() retryLabel: string = 'Try Again';
  @Output() retry = new EventEmitter<void>();

  onRetry() {
    this.retry.emit();
  }
}

