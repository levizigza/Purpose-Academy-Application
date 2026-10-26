/**
 * Logical CSS-pixel viewports for the learner-app phone emulator.
 * Sizes follow common device CSS viewports (not physical pixels).
 */
export type PhoneDevice = {
  id: string
  label: string
  /** Short chip label in the picker */
  short: string
  width: number
  height: number
  /** Outer frame corner radius */
  radius: number
  /** Screen inset (bezel thickness) */
  inset: number
  island: 'dynamic' | 'notch' | 'none'
  /** Frame finish */
  finish: 'titanium' | 'aluminum' | 'matte'
}

export const PHONE_DEVICES: PhoneDevice[] = [
  {
    id: 'iphone-se',
    label: 'iPhone SE (3rd gen)',
    short: 'SE',
    width: 375,
    height: 667,
    radius: 40,
    inset: 10,
    island: 'none',
    finish: 'aluminum',
  },
  {
    id: 'iphone-13',
    label: 'iPhone 13 / 14',
    short: '13/14',
    width: 390,
    height: 844,
    radius: 47,
    inset: 11,
    island: 'notch',
    finish: 'aluminum',
  },
  {
    id: 'iphone-15-pro',
    label: 'iPhone 15 Pro',
    short: '15 Pro',
    width: 393,
    height: 852,
    radius: 54,
    inset: 11,
    island: 'dynamic',
    finish: 'titanium',
  },
  {
    id: 'iphone-15-max',
    label: 'iPhone 15 Pro Max',
    short: '15 Max',
    width: 430,
    height: 932,
    radius: 56,
    inset: 12,
    island: 'dynamic',
    finish: 'titanium',
  },
  {
    id: 'iphone-16-max',
    label: 'iPhone 16 Pro Max',
    short: '16 Max',
    width: 440,
    height: 956,
    radius: 58,
    inset: 12,
    island: 'dynamic',
    finish: 'titanium',
  },
  {
    id: 'pixel-8',
    label: 'Pixel 8',
    short: 'Pixel 8',
    width: 412,
    height: 915,
    radius: 48,
    inset: 12,
    island: 'none',
    finish: 'matte',
  },
  {
    id: 'galaxy-s24',
    label: 'Galaxy S24',
    short: 'S24',
    width: 360,
    height: 780,
    radius: 42,
    inset: 10,
    island: 'none',
    finish: 'matte',
  },
  {
    id: 'iphone-xr',
    label: 'iPhone XR / 11',
    short: 'XR/11',
    width: 414,
    height: 896,
    radius: 44,
    inset: 12,
    island: 'notch',
    finish: 'aluminum',
  },
]

export const DEFAULT_PHONE_DEVICE_ID = 'iphone-15-pro'

const DEVICE_KEY = 'pa-phone-device-v1'

export function getSavedPhoneDeviceId(): string {
  try {
    const id = sessionStorage.getItem(DEVICE_KEY)
    if (id && PHONE_DEVICES.some((d) => d.id === id)) return id
  } catch {
    /* ignore */
  }
  return DEFAULT_PHONE_DEVICE_ID
}

export function savePhoneDeviceId(id: string) {
  try {
    sessionStorage.setItem(DEVICE_KEY, id)
  } catch {
    /* ignore */
  }
}

export function resolvePhoneDevice(id: string): PhoneDevice {
  return PHONE_DEVICES.find((d) => d.id === id) ?? PHONE_DEVICES.find((d) => d.id === DEFAULT_PHONE_DEVICE_ID)!
}
