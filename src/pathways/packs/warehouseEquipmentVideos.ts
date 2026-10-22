/**
 * Logistics — Warehouse Equipment familiarization (Purpose Academy video collection).
 * Placed after Logistics Systems and before Instructor Observation / floor training.
 *
 * Each MP4: ~2 min, Full HD, English narration + burned-in captions.
 * Structure (per START_HERE): Introduction → Know → Inspect → Protect → Task →
 * Know. Inspect. Protect. → Learn with purpose.
 *
 * Powered forklifts / reach / order picker = awareness and stay-clear only —
 * never claimed as operator certification.
 */

export type EquipmentFamilyId =
  | 'powered-lift'
  | 'pallet-movers'
  | 'manual-carts'
  | 'dock-pack'
  | 'scan-weigh'
  | 'housekeeping'

export type WarehouseEquipmentLesson = {
  id: string
  n: number
  /** Display title */
  title: string
  family: EquipmentFamilyId
  familyLabel: string
  /** File under public/media/warehouse-equipment/ */
  file: string
  /** Pathway photo key for poster / list thumb when available */
  posterKey?: string
  /** One-line purpose under the player */
  purpose: string
  /** Know / Inspect / Protect coaching chips (shown beside the lesson) */
  know: string
  inspect: string
  protect: string
  /** true = learner must stay clear unless certified elsewhere */
  poweredStayClear?: boolean
}

export const EQUIPMENT_FAMILIES: { id: EquipmentFamilyId; label: string; blurb: string }[] = [
  {
    id: 'powered-lift',
    label: 'Powered lift trucks',
    blurb: 'Awareness and stay-clear habits. Certified training is separate.',
  },
  {
    id: 'pallet-movers',
    label: 'Pallet movers',
    blurb: 'Move loaded pallets safely on the floor.',
  },
  {
    id: 'manual-carts',
    label: 'Manual carts',
    blurb: 'Everyday movers for cartons and light loads.',
  },
  {
    id: 'dock-pack',
    label: 'Dock & packing',
    blurb: 'Staging, wrapping, and dock connections.',
  },
  {
    id: 'scan-weigh',
    label: 'Scan & weigh',
    blurb: 'Accuracy tools for labels and shipping.',
  },
  {
    id: 'housekeeping',
    label: 'Housekeeping machines',
    blurb: 'Keep floors clear and safe for people and equipment.',
  },
]

export const WAREHOUSE_EQUIPMENT_VIDEOS: WarehouseEquipmentLesson[] = [
  {
    id: 'counterbalance-forklift',
    n: 1,
    title: 'Counterbalance forklift',
    family: 'powered-lift',
    familyLabel: 'Powered lift trucks',
    file: '01_Counterbalance_forklift.mp4',
    posterKey: 'log-vv-151',
    purpose: 'Know the machine, stay clear of its path, and never operate without certification.',
    know: 'Counterweight at the rear balances the load on the forks.',
    inspect: 'Look for leaks, damaged forks, and clear lights before anyone moves it.',
    protect: 'Stay in pedestrian lanes. Make eye contact with the operator before you cross.',
    poweredStayClear: true,
  },
  {
    id: 'reach-truck',
    n: 2,
    title: 'Reach truck',
    family: 'powered-lift',
    familyLabel: 'Powered lift trucks',
    file: '02_Reach_truck.mp4',
    posterKey: 'log-vv-151',
    purpose: 'Used in narrow racking aisles — give it space and never walk under raised forks.',
    know: 'The mast reaches into racks to place or pull pallets at height.',
    inspect: 'Check mast chains, forks, and aisle clearance before work begins.',
    protect: 'Keep clear of the aisle end. Never stand under a raised load.',
    poweredStayClear: true,
  },
  {
    id: 'manual-pallet-jack',
    n: 3,
    title: 'Manual pallet jack',
    family: 'pallet-movers',
    familyLabel: 'Pallet movers',
    file: '03_Manual_pallet_jack.mp4',
    posterKey: 'log-jack',
    purpose: 'Slide forks under the pallet, pump to lift, and pull with control.',
    know: 'A hand pump raises the forks just enough to roll the pallet.',
    inspect: 'Check wheels, handle, and forks for damage before each use.',
    protect: 'Keep feet clear when pumping. Pull — do not ride — the jack.',
  },
  {
    id: 'powered-pallet-jack',
    n: 4,
    title: 'Powered pallet jack',
    family: 'pallet-movers',
    familyLabel: 'Pallet movers',
    file: '04_Powered_pallet_jack.mp4',
    posterKey: 'log-jack',
    purpose: 'Motorized pallet moves — walk with it, watch pedestrians, know the stop control.',
    know: 'Battery power drives and lifts; you walk alongside or on the rider platform.',
    inspect: 'Confirm battery charge, horn, and emergency stop before moving.',
    protect: 'Sound the horn at corners. Yield to people in the aisle.',
    poweredStayClear: true,
  },
  {
    id: 'pallet-stacker',
    n: 5,
    title: 'Pallet stacker',
    family: 'pallet-movers',
    familyLabel: 'Pallet movers',
    file: '05_Pallet_stacker.mp4',
    posterKey: 'log-pallet',
    purpose: 'Lifts pallets for stacking — watch mast height and never walk under the load.',
    know: 'Raises a pallet higher than a standard jack for stacking or racking.',
    inspect: 'Check mast, forks, and safety guard before lifting.',
    protect: 'Keep people out from under raised forks. Lower the load before travel when you can.',
    poweredStayClear: true,
  },
  {
    id: 'order-picker',
    n: 6,
    title: 'Order picker',
    family: 'powered-lift',
    familyLabel: 'Powered lift trucks',
    file: '06_Order_picker.mp4',
    posterKey: 'log-vv-151',
    purpose: 'Operator rises with the platform to pick cases — stay clear below.',
    know: 'The platform lifts the picker to shelf height for case picking.',
    inspect: 'Harness points, gates, and lift controls must be checked before ascent.',
    protect: 'Never walk or stand under a raised order-picker platform.',
    poweredStayClear: true,
  },
  {
    id: 'hand-truck',
    n: 7,
    title: 'Hand truck',
    family: 'manual-carts',
    familyLabel: 'Manual carts',
    file: '07_Hand_truck.mp4',
    posterKey: 'log-dolly',
    purpose: 'Tilt, balance, and roll cartons — keep the load within the plate.',
    know: 'A two-wheel truck for stacked cartons and cases.',
    inspect: 'Check tires, plate, and handle before loading.',
    protect: 'Do not overload. Keep the path clear while you tilt and roll.',
  },
  {
    id: 'platform-cart',
    n: 8,
    title: 'Platform cart',
    family: 'manual-carts',
    familyLabel: 'Manual carts',
    file: '08_Platform_cart.mp4',
    posterKey: 'log-cart',
    purpose: 'Four-wheel cart for flat loads — push from the handle end.',
    know: 'A flat deck on four wheels for totes, cartons, or kits.',
    inspect: 'Spin each wheel. Confirm the deck is clean and undamaged.',
    protect: 'Push, do not pull into traffic. Keep loads inside the deck edges.',
  },
  {
    id: 'conveyor',
    n: 9,
    title: 'Conveyor',
    family: 'dock-pack',
    familyLabel: 'Dock & packing',
    file: '09_Conveyor.mp4',
    purpose: 'Moving belts and rollers — keep hands clear and know the emergency stop.',
    know: 'Carries cartons between pack, sort, and dock zones.',
    inspect: 'Look for jammed cartons, frayed belts, and working e-stops.',
    protect: 'Never reach into a moving conveyor. Use the e-stop if something jams.',
  },
  {
    id: 'pallet-stretch-wrapper',
    n: 10,
    title: 'Pallet stretch wrapper',
    family: 'dock-pack',
    familyLabel: 'Dock & packing',
    file: '10_Pallet_stretch_wrapper.mp4',
    posterKey: 'log-wrap',
    purpose: 'Wraps the load tight for shipping — stay outside the turn radius.',
    know: 'Turns the pallet or the wrap arm to apply stretch film.',
    inspect: 'Check film roll, turntable path, and guards before starting.',
    protect: 'Stand clear of the rotating arm or turntable while it runs.',
  },
  {
    id: 'dock-leveller',
    n: 11,
    title: 'Dock leveller',
    family: 'dock-pack',
    familyLabel: 'Dock & packing',
    file: '11_Dock_leveller.mp4',
    posterKey: 'log-dock',
    purpose: 'Bridges the dock to the trailer floor — confirm it is set before you cross.',
    know: 'A hinged plate that levels the gap between dock and truck bed.',
    inspect: 'Confirm lip engagement and a stable, even bridge before traffic.',
    protect: 'Never cross a raised or unsupported leveller. Watch for trailer creep.',
  },
  {
    id: 'barcode-scanner',
    n: 12,
    title: 'Barcode scanner',
    family: 'scan-weigh',
    familyLabel: 'Scan & weigh',
    file: '12_Barcode_scanner.mp4',
    posterKey: 'log-scanner',
    purpose: 'Scan before you stage — the beep confirms the system saw the label.',
    know: 'Reads the barcode so inventory and orders stay accurate.',
    inspect: 'Clean the window. Confirm battery or cable before the shift.',
    protect: 'Do not cover or damage labels. Rescan if you do not get a confirm beep.',
  },
  {
    id: 'parcel-scale',
    n: 13,
    title: 'Parcel scale',
    family: 'scan-weigh',
    familyLabel: 'Scan & weigh',
    file: '13_Parcel_scale.mp4',
    posterKey: 'log-vv-157',
    purpose: 'Weigh parcels for shipping rates and load limits — zero the scale first.',
    know: 'Measures weight for labels, carriers, and load checks.',
    inspect: 'Zero the scale on a clear deck. Check for damage under the plate.',
    protect: 'Do not drop heavy freight on the scale. Keep liquids off the deck.',
  },
  {
    id: 'floor-scrubber-dryer',
    n: 14,
    title: 'Floor scrubber dryer',
    family: 'housekeeping',
    familyLabel: 'Housekeeping machines',
    file: '14_Floor_scrubber_dryer.mp4',
    posterKey: 'log-floor',
    purpose: 'Cleans and dries floors so aisles stay safe for people and equipment.',
    know: 'Scrubs, then vacuums dirty water so floors dry faster.',
    inspect: 'Check pads, squeegee, and water tanks before you start.',
    protect: 'Cone wet areas. Keep cords and tanks out of forklift paths.',
  },
]

export function equipmentVideoUrl(file: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}media/warehouse-equipment/${file}`
}
