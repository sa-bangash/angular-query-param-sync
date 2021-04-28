import { InjectionToken } from '@angular/core';
export interface WindowService {
  windowRef: Window;
}
export const WINDOW_SERVICE = new InjectionToken('QP_WINDOW_SERVICE', {
  providedIn: 'root',
  factory() {
    return {
      windowRef: window,
    };
  },
});
