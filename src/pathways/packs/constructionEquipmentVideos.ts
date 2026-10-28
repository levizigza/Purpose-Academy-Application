/**
 * Construction — Equipment familiarization (Purpose Academy video collection).
 * Placed after Construction Systems and before Instructor Observation.
 *
 * Each MP4: short Full HD lesson with English narration + burned-in captions.
 * Structure mirrors warehouse equipment: Know → Inspect → Protect → Task.
 *
 * Powered machines = awareness and stay-clear only — never claimed as operator certification.
 */

export type ConstructionEquipmentFamilyId =
  | 'earthmoving'
  | 'material-handling'
  | 'lifting'
  | 'aerial'
  | 'access'

export type ConstructionEquipmentLesson = {
  id: string
  n: number
  title: string
  family: ConstructionEquipmentFamilyId
  familyLabel: string
  /** File under public/media/construction-equipment/ */
  file: string
  /** Pathway photo key for poster / list thumb when available */
  posterKey?: string
  purpose: string
  know: string
  inspect: string
  protect: string
  /** true = learner must stay clear unless certified elsewhere */
  poweredStayClear?: boolean
}

export const CONSTRUCTION_EQUIPMENT_FAMILIES: {
  id: ConstructionEquipmentFamilyId
  label: string
  blurb: string
}[] = [
  { id: 'earthmoving', label: 'Earthmoving machines', blurb: 'Dig, push, grade, and compact — awareness and stay-clear habits.' },
  { id: 'material-handling', label: 'Material handling', blurb: 'Forks and telehandlers move loads on site. Certified training is separate.' },
  { id: 'lifting', label: 'Cranes', blurb: 'Heavy lift awareness. Stay out from under the load.' },
  { id: 'aerial', label: 'Aerial lifts', blurb: 'People and tools at height — fall protection and firm ground.' },
  { id: 'access', label: 'Access', blurb: 'Temporary elevated access. Lock wheels before you climb.' },
]

export const CONSTRUCTION_EQUIPMENT_VIDEOS: ConstructionEquipmentLesson[] = [
  {
    id: 'excavator',
    n: 1,
    title: 'Excavator',
    family: 'earthmoving',
    familyLabel: 'Earthmoving machines',
    file: '01_Excavator.mp4',
    posterKey: 'con-vv-285',
    purpose: 'Know the digging machine, stay clear of the swing, and never operate without training.',
    know: 'Boom, stick, and bucket dig and move material.',
    inspect: 'Check visible damage, leaks, and debris before starting.',
    protect: 'Stay clear of the swing area. Confirm utility locates before digging.',
    poweredStayClear: true,
  },
  {
    id: 'backhoe',
    n: 2,
    title: 'Backhoe Loader',
    family: 'earthmoving',
    familyLabel: 'Earthmoving machines',
    file: '02_Backhoe_loader.mp4',
    posterKey: 'con-vv-289',
    purpose: 'Front bucket and rear digger — know each end and keep clear of the work zone.',
    know: 'Front loader bucket scoops; rear backhoe digs.',
    inspect: 'Check bucket edges, teeth, and securing pins before work.',
    protect: 'Stay out of blind spots. Get permission before approaching.',
    poweredStayClear: true,
  },
  {
    id: 'bulldozer',
    n: 3,
    title: 'Bulldozer',
    family: 'earthmoving',
    familyLabel: 'Earthmoving machines',
    file: '03_Bulldozer.mp4',
    posterKey: 'con-vv-286',
    purpose: 'Blade work for push and level — stay clear of the tracks and blade path.',
    know: 'Front blade pushes, spreads, and levels material.',
    inspect: 'Look for leaks, blade damage, and clear travel path before work.',
    protect: 'Give the dozer room. Never stand in the blade path.',
    poweredStayClear: true,
  },
  {
    id: 'wheel-loader',
    n: 4,
    title: 'Wheel Loader',
    family: 'earthmoving',
    familyLabel: 'Earthmoving machines',
    file: '04_Wheel_loader.mp4',
    posterKey: 'con-vv-561',
    purpose: 'Scoop, carry, and load trucks — stay clear of the bucket and travel path.',
    know: 'Bucket scoops, carries, and loads loose material.',
    inspect: 'Complete the inspection before each shift.',
    protect: 'Stay clear of the bucket swing and travel path.',
    poweredStayClear: true,
  },
  {
    id: 'bobcat',
    n: 5,
    title: 'Bobcat Skid Steer',
    family: 'earthmoving',
    familyLabel: 'Earthmoving machines',
    file: '05_Bobcat_skid_steer.mp4',
    posterKey: 'con-vv-095',
    purpose: 'Compact loader awareness — attachment locked, people clear, no passengers.',
    know: 'Bucket scoops and carries; tracks or wheels move the machine.',
    inspect: 'Confirm the attachment is locked. Check damage and leaks.',
    protect: 'Keep people clear of the work zone. No passengers.',
    poweredStayClear: true,
  },
  {
    id: 'motor-grader',
    n: 6,
    title: 'Motor Grader',
    family: 'earthmoving',
    familyLabel: 'Earthmoving machines',
    file: '06_Motor_grader.mp4',
    posterKey: 'con-vv-562',
    purpose: 'Shapes and levels soil and gravel — stay clear of the moldboard.',
    know: 'The moldboard is the long curved grader blade.',
    inspect: 'Check blade, tires, and controls before grading.',
    protect: 'Stay clear of the moldboard and machine path.',
    poweredStayClear: true,
  },
  {
    id: 'roller-compactor',
    n: 7,
    title: 'Roller Compactor',
    family: 'earthmoving',
    familyLabel: 'Earthmoving machines',
    file: '07_Roller_compactor.mp4',
    posterKey: 'con-vv-291',
    purpose: 'Compacts soil and granular material — stay clear of the drum path.',
    know: 'Steel drum compacts soil and granular material.',
    inspect: 'Check drum, vibration, and leaks before rolling.',
    protect: 'Stay clear of the roller path and vibrating drum.',
    poweredStayClear: true,
  },
  {
    id: 'construction-forklift',
    n: 8,
    title: 'Forklift',
    family: 'material-handling',
    familyLabel: 'Material handling',
    file: '08_Forklift.mp4',
    posterKey: 'con-vv-554',
    purpose: 'Pallet lifts on site — awareness and stay-clear only, not operator certification.',
    know: 'Forks, mast, and load backrest move palletized loads.',
    inspect: 'Check forks, mast, and capacity before anyone moves it.',
    protect: 'Stay clear of the travel path. Never walk under raised forks.',
    poweredStayClear: true,
  },
  {
    id: 'telehandler',
    n: 9,
    title: 'Telehandler',
    family: 'material-handling',
    familyLabel: 'Material handling',
    file: '09_Telehandler.mp4',
    posterKey: 'con-vv-290',
    purpose: 'Telescopic boom lifts — approved attachments only; stay clear under the load.',
    know: 'Telescopic boom lifts and places material with approved attachments.',
    inspect: 'Check boom, forks or attachment, and stabilizers as trained.',
    protect: 'Never stand under a raised load. Respect rated capacity.',
    poweredStayClear: true,
  },
  {
    id: 'mobile-crane',
    n: 10,
    title: 'Mobile Crane',
    family: 'lifting',
    familyLabel: 'Cranes',
    file: '10_Mobile_crane.mp4',
    posterKey: 'con-vv-553',
    purpose: 'Lifts and places heavy loads — trained operators only; never stand under the load.',
    know: 'Mobile hydraulic crane lifts and places heavy loads.',
    inspect: 'Confirm ground support and outriggers before the lift.',
    protect: 'Never stand under the load. Only authorized operators run the crane.',
    poweredStayClear: true,
  },
  {
    id: 'tower-crane',
    n: 11,
    title: 'Tower Crane',
    family: 'lifting',
    familyLabel: 'Cranes',
    file: '11_Tower_crane.mp4',
    posterKey: 'con-vv-098',
    purpose: 'Tower crane awareness — trolley, hoist, and exclusion zones.',
    know: 'Trolley changes hook radius; hoist raises and lowers the hook block.',
    inspect: 'Follow site checks before any lift under the tower crane.',
    protect: 'Stay out of the exclusion zone. Never stand under the load.',
    poweredStayClear: true,
  },
  {
    id: 'boom-lift',
    n: 12,
    title: 'Boom Lift',
    family: 'aerial',
    familyLabel: 'Aerial lifts',
    file: '12_Boom_lift.mp4',
    posterKey: 'con-vv-372',
    purpose: 'Raises people and tools to height — harness and stay-clear habits.',
    know: 'Boom lift reaches elevated work areas with people and tools.',
    inspect: 'Function-test; report defects and keep unsafe equipment out of service.',
    protect: 'Use required fall protection. Stay clear below a raised boom.',
    poweredStayClear: true,
  },
  {
    id: 'scissor-lift',
    n: 13,
    title: 'Scissor Lift',
    family: 'aerial',
    familyLabel: 'Aerial lifts',
    file: '13_Scissor_lift.mp4',
    posterKey: 'con-vv-371',
    purpose: 'Straight-up platform for people and tools — firm level surface and fall protection.',
    know: 'Platform, guardrails, and scissor arms raise people and tools.',
    inspect: 'Report defects. Confirm firm, substantially level ground.',
    protect: 'Feet on the platform floor. Plan rescue before raising.',
    poweredStayClear: true,
  },
  {
    id: 'mobile-scaffold',
    n: 14,
    title: 'Mobile Scaffold',
    family: 'access',
    familyLabel: 'Access',
    file: '14_Mobile_scaffold.mp4',
    posterKey: 'con-vv-370',
    purpose: 'Temporary elevated access on wheels — lock casters before climbing.',
    know: 'Mobile scaffold provides temporary access for elevated work.',
    inspect: 'Follow manufacturer assembly. Lock wheels before climbing.',
    protect: 'Do not move a scaffold with people on it. Keep braces secure.',
  },
]

/** Raw Purpose Academy Final filenames as shipped in the Drive collection. */
export const CONSTRUCTION_EQUIPMENT_SOURCE_VIDEOS: Record<string, string> = {
  'excavator': 'Purpose_Academy_Excavator_Final.mp4',
  'backhoe': 'Purpose_Academy_Backhoe_Final.mp4',
  'bulldozer': 'Purpose_Academy_Bulldozer_Final.mp4',
  'wheel-loader': 'Purpose_Academy_Wheel_Loader_Final.mp4',
  'bobcat': 'Purpose_Academy_Bobcat_Final (1).mp4',
  'motor-grader': 'Purpose_Academy_Motor_Grader_Final (1).mp4',
  'roller-compactor': 'Purpose_Academy_Roller_Compactor_Final.mp4',
  'construction-forklift': 'Purpose_Academy_Forklift_Final.mp4',
  'telehandler': 'Purpose_Academy_Telehandler_Final.mp4',
  'mobile-crane': 'Purpose_Academy_Mobile_Crane_Final.mp4',
  'tower-crane': 'Purpose_Academy_Tower_Crane_Final.mp4',
  'boom-lift': 'Purpose_Academy_Boom_Lift_Final.mp4',
  'scissor-lift': 'Purpose_Academy_Scissor_Lift_Final.mp4',
  'mobile-scaffold': 'Purpose_Academy_Mobile_Scaffold_Final.mp4',
}

export function constructionEquipmentVideoUrl(file: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}media/construction-equipment/${file}`
}

