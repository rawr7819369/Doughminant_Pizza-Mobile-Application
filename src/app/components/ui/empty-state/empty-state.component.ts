import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonButton,
  IonText
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  imports: [CommonModule, RouterModule, IonIcon, IonButton, IonText]
})
export class EmptyStateComponent {
  @Input() icon: string = 'pizza-outline';
  @Input() title: string = 'Nothing here yet';
  @Input() message: string = 'Get started by adding some items';
  @Input() actionLabel?: string;
  @Input() actionRoute?: string;
  @Input() actionClick?: () => void;
}

