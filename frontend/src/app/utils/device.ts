// src/utils/device.ts
// 💡 Generates and persists a unique device ID per browser/device.

export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''; // avoid SSR errors

  let id = localStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
  }
  return id;
}
