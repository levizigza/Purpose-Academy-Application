/** A look at another pathway's equipment videos. It does not change the saved pathway. */
const KEY = 'pa-equipment-look-v1'

export type EquipmentLook = 'construction' | 'logistics'

export function readEquipmentLook(): EquipmentLook | null {
  try {
    const value = sessionStorage.getItem(KEY)
    if (value === 'construction' || value === 'logistics') return value
  } catch {
    /* private mode */
  }
  return null
}

export function rememberEquipmentLook(pack: EquipmentLook) {
  try {
    sessionStorage.setItem(KEY, pack)
  } catch {
    /* private mode */
  }
}

export function clearEquipmentLook() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* private mode */
  }
}
