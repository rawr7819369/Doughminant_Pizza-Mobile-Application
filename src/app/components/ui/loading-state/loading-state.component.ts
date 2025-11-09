import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  templateUrl: './loading-state.component.html',
  styleUrls: ['./loading-state.component.scss'],
  imports: [CommonModule, IonSpinner, IonText]
})
export class LoadingStateComponent {
  @Input() message: string = 'Loading...';
  @Input() size: 'small' | 'default' | 'large' = 'default';
}

