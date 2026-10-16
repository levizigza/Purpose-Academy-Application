/**
 * Pathway visual resolver — real object photos for every stream.
 * Construction uses tool photos; Logistics / Community use dedicated stock photos.
 * Learners must see the object, not a letter badge.
 */
import { toolImage as constructionToolImage } from '../student/toolImages'

import logBox from '../assets/photos/logistics/log-box.jpg'
import logBag from '../assets/photos/logistics/log-bag.jpg'
import logBin from '../assets/photos/logistics/log-bin.jpg'
import logShelf from '../assets/photos/logistics/log-shelf.jpg'
import logRack from '../assets/photos/logistics/log-rack.jpg'
import logPallet from '../assets/photos/logistics/log-pallet.jpg'
import logCart from '../assets/photos/logistics/log-cart.jpg'
import logDolly from '../assets/photos/logistics/log-dolly.jpg'
import logTruck from '../assets/photos/logistics/log-truck.jpg'
import logVan from '../assets/photos/logistics/log-van.jpg'
import logTrailer from '../assets/photos/logistics/log-trailer.jpg'
import logDoor from '../assets/photos/logistics/log-door.jpg'
import logGate from '../assets/photos/logistics/log-gate.jpg'
import logFloor from '../assets/photos/logistics/log-floor.jpg'
import logWall from '../assets/photos/logistics/log-wall.jpg'
import logAisle from '../assets/photos/logistics/log-aisle.jpg'
import logRamp from '../assets/photos/logistics/log-ramp.jpg'
import logDock from '../assets/photos/logistics/log-dock.jpg'
import logOffice from '../assets/photos/logistics/log-office.jpg'
import logWarehouse from '../assets/photos/logistics/log-warehouse.jpg'
import logScanner from '../assets/photos/logistics/log-scanner.jpg'
import logLabel from '../assets/photos/logistics/log-label.jpg'
import logVest from '../assets/photos/logistics/log-vest.jpg'
import logManifest from '../assets/photos/logistics/log-manifest.jpg'
import logJack from '../assets/photos/logistics/log-jack.jpg'
import logWrap from '../assets/photos/logistics/log-wrap.jpg'

import comBadge from '../assets/photos/community/com-badge.jpg'
import comClipboard from '../assets/photos/community/com-clipboard.jpg'
import comFirstAid from '../assets/photos/community/com-first-aid.jpg'
import comGloves from '../assets/photos/community/com-gloves.jpg'
import comSchedule from '../assets/photos/community/com-schedule.jpg'
import comPhone from '../assets/photos/community/com-phone.jpg'
import comWelcome from '../assets/photos/community/com-welcome.jpg'
import comConsent from '../assets/photos/community/com-consent.jpg'
import comHygiene from '../assets/photos/community/com-hygiene.jpg'
import comWheelchair from '../assets/photos/community/com-wheelchair.jpg'
import comWalker from '../assets/photos/community/com-walker.jpg'
import comBus from '../assets/photos/community/com-bus.jpg'
import comKeys from '../assets/photos/community/com-keys.jpg'
import comSupportPlan from '../assets/photos/community/com-support-plan.jpg'
import comBackpack from '../assets/photos/community/com-backpack.jpg'
import comShopping from '../assets/photos/community/com-shopping.jpg'

const PATHWAY_PHOTOS: Record<string, string> = {
  'log-box': logBox,
  'log-bag': logBag,
  'log-bin': logBin,
  'log-shelf': logShelf,
  'log-rack': logRack,
  'log-pallet': logPallet,
  'log-cart': logCart,
  'log-dolly': logDolly,
  'log-truck': logTruck,
  'log-van': logVan,
  'log-trailer': logTrailer,
  'log-door': logDoor,
  'log-gate': logGate,
  'log-floor': logFloor,
  'log-wall': logWall,
  'log-aisle': logAisle,
  'log-ramp': logRamp,
  'log-dock': logDock,
  'log-office': logOffice,
  'log-warehouse': logWarehouse,
  'log-scanner': logScanner,
  'log-label': logLabel,
  'log-vest': logVest,
  'log-manifest': logManifest,
  'log-jack': logJack,
  'log-wrap': logWrap,
  'com-badge': comBadge,
  'com-clipboard': comClipboard,
  'com-first-aid': comFirstAid,
  'com-gloves': comGloves,
  'com-schedule': comSchedule,
  'com-phone': comPhone,
  'com-welcome': comWelcome,
  'com-consent': comConsent,
  'com-hygiene': comHygiene,
  'com-wheelchair': comWheelchair,
  'com-walker': comWalker,
  'com-bus': comBus,
  'com-keys': comKeys,
  'com-support-plan': comSupportPlan,
  'com-backpack': comBackpack,
  'com-shopping': comShopping,
}

/** Resolve an image for any pathway vocab / quiz / Eye Spy key. */
export function pathwayImage(key?: string | null): string | undefined {
  if (!key) return undefined
  const fromConstruction = constructionToolImage(key)
  if (fromConstruction) return fromConstruction
  if (key in PATHWAY_PHOTOS) return PATHWAY_PHOTOS[key]
  // Logistics Visual Vocabulary words 21–500 (and worksheet tiles 1–20)
  // live as static public assets extracted from the 500-word PDF.
  if (key.startsWith('log-vv-')) {
    const base = import.meta.env.BASE_URL || '/'
    return `${base}media/logistics-vv/${key}.jpg`
  }
  // Construction Visual Vocabulary words 1–660 (worksheet object tiles).
  if (key.startsWith('con-vv-')) {
    const base = import.meta.env.BASE_URL || '/'
    return `${base}media/construction-vv/${key}.jpg`
  }
  // Daily Conversation Vocabulary words 1–200 (shared across all streams).
  if (key.startsWith('dc-vv-')) {
    const base = import.meta.env.BASE_URL || '/'
    return `${base}media/daily-conversation-vv/${key}.jpg`
  }
  return undefined
}
