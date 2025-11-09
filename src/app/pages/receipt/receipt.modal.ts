import { Component } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonItem, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  templateUrl: './receipt.modal.html',
  styleUrls: ['./receipt.modal.scss'],
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonItem, IonLabel]
})
export class ReceiptModalComponent {
  orderNumber = Math.floor(100000 + Math.random() * 900000);
  date = new Date();
  constructor(public orders: OrderService, private modalCtrl: ModalController, private router: Router) {}

  close() {
    this.modalCtrl.dismiss();
  }

  goToReceiptPage() {
    this.modalCtrl.dismiss();
    this.router.navigateByUrl('/receipt');
  }
}
