/** Public asset URLs that respect Vite/GitHub Pages `base`. */
export function asset(path: string): string {
  const clean = path.replace(/^\//, '')
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${clean}`
}

export const BRAND_ASSETS = {
  logoFull: asset('brand/logo-full.jpg'),
  logoMark: asset('brand/logo-mark.svg'),
  iconConstruction: asset('brand/icon-construction.svg'),
  iconLogistics: asset('brand/icon-logistics.svg'),
  iconCommunity: asset('brand/icon-community.svg'),
  threshold: asset('brand/threshold.svg'),
} as const
