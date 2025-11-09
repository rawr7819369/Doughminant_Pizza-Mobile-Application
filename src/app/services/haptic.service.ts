import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class HapticService {
  private isAvailable = Capacitor.isNativePlatform();

  /**
   * Light impact feedback
   */
  async light() {
    if (this.isAvailable) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        // Haptics not available, ignore
      }
    }
  }

  /**
   * Medium impact feedback
   */
  async medium() {
    if (this.isAvailable) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (e) {
        // Haptics not available, ignore
      }
    }
  }

  /**
   * Heavy impact feedback
   */
  async heavy() {
    if (this.isAvailable) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (e) {
        // Haptics not available, ignore
      }
    }
  }

  /**
   * Success notification feedback
   */
  async success() {
    if (this.isAvailable) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (e) {
        // Haptics not available, ignore
      }
    }
  }

  /**
   * Warning notification feedback
   */
  async warning() {
    if (this.isAvailable) {
      try {
        await Haptics.notification({ type: NotificationType.Warning });
      } catch (e) {
        // Haptics not available, ignore
      }
    }
  }

  /**
   * Error notification feedback
   */
  async error() {
    if (this.isAvailable) {
      try {
        await Haptics.notification({ type: NotificationType.Error });
      } catch (e) {
        // Haptics not available, ignore
      }
    }
  }

  /**
   * Selection feedback (for toggles, switches, etc.)
   */
  async selection() {
    if (this.isAvailable) {
      try {
        await Haptics.selectionStart();
        await new Promise(resolve => setTimeout(resolve, 10));
        await Haptics.selectionChanged();
      } catch (e) {
        // Haptics not available, ignore
      }
    }
  }
}

