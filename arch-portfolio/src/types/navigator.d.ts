// src/types/navigator.d.ts

interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
}

// Augment the existing Navigator interface to include getBattery
interface Navigator {
  getBattery(): Promise<BatteryManager>;
}