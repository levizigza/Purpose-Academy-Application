/**
 * Logistics Foundations practice layers aligned to Logistics Visual Vocabulary.
 * Eye Spy uses the same clear-all mold as Construction (ten boards, pair picture ↔ word).
 * termIds / hotspot ids match LOGISTICS_VOCAB_500; imageKeys prefer dedicated log-* photos
 * when available, otherwise log-vv worksheet tiles.
 */
import type { EyeSpyScene } from '../../student/journeyCurriculum'
import { hint } from '../packHelpers'
import type { WordAction, WorkplaceInstruction } from '../types'

/** Level-1 bay words + PPE / MHE / pack-ship terms drive Word → Action. */
export const LOGISTICS_WORD_ACTIONS: WordAction[] = [
  { id: 'wa-box', termId: 'box', title: 'Box in action', body: 'Close flaps fully and keep the box upright before you stage it.', actionCue: 'Close. Upright. Stage.' },
  { id: 'wa-bin', termId: 'bin', title: 'Bin in action', body: 'Place items gently in the bin. Do not overfill past the rim.', actionCue: 'Gentle place. No overfill.' },
  { id: 'wa-shelf', termId: 'shelf', title: 'Shelf in action', body: 'Put items on the assigned shelf. Face labels outward.', actionCue: 'Assigned shelf. Labels out.' },
  { id: 'wa-rack', termId: 'rack', title: 'Rack in action', body: 'Place goods squarely on the rack. Never climb the beams.', actionCue: 'Square place. No climbing.' },
  { id: 'wa-pallet', termId: 'pallet', title: 'Pallet in action', body: 'Center the load on the pallet. Keep the stack inside the edges.', actionCue: 'Centered. Inside edges.' },
  { id: 'wa-cart', termId: 'cart', title: 'Cart in action', body: 'Push the cart by the handle. Keep it clear of forklift paths.', actionCue: 'Push by handle. Clear paths.' },
  { id: 'wa-dolly', termId: 'dolly', title: 'Dolly in action', body: 'Tilt the dolly under the carton. Keep the load balanced while you walk.', actionCue: 'Tilt under. Balanced walk.' },
  { id: 'wa-aisle', termId: 'aisle', title: 'Aisle awareness', body: 'Keep the aisle clear for people and equipment. Do not stage goods in the walkway.', actionCue: 'Aisle clear. No staging in path.' },
  { id: 'wa-dock', termId: 'dock', title: 'Dock awareness', body: 'Stay clear of the dock edge. Watch for trucks backing in.', actionCue: 'Edge clear. Watch backing trucks.' },
  { id: 'wa-truck', termId: 'truck', title: 'Truck awareness', body: 'Stand where the driver can see you. Never walk behind a moving truck.', actionCue: 'Stay visible. Never behind.' },
  { id: 'wa-label', termId: 'label', title: 'Label in action', body: 'Put the shipping label flat on the carton. Make sure the barcode can be scanned.', actionCue: 'Flat label. Barcode clear.' },
  { id: 'wa-scanner', termId: 'scanner', title: 'Scanner in action', body: 'Aim the scanner at the barcode. Wait for the confirm beep before you stage.', actionCue: 'Aim. Confirm beep. Then stage.' },
  { id: 'wa-vest', termId: 'vest', title: 'Safety vest before entry', body: 'Put the safety vest on before you enter the floor. Replace it if it is torn.', actionCue: 'Vest on before entry.' },
  { id: 'wa-gloves', termId: 'gloves', title: 'Gloves in action', body: 'Wear gloves when you handle rough cartons or wood pallets. Pick gloves for the job.', actionCue: 'Right gloves. Hands protected.' },
  { id: 'wa-boots', termId: 'boots', title: 'Boots in action', body: 'Wear safety boots on the floor. Check the soles before you start your shift.', actionCue: 'Boots on. Soles checked.' },
  { id: 'wa-pallet-jack', termId: 'pallet-jack', title: 'Pallet jack in action', body: 'Slide the forks under the pallet. Keep both feet clear when you pump the jack.', actionCue: 'Forks under. Feet clear.' },
  { id: 'wa-forklift', termId: 'forklift', title: 'Forklift awareness', body: 'Stay in pedestrian lanes. Make eye contact with the operator before you cross.', actionCue: 'Pedestrian lanes. Eye contact.' },
  { id: 'wa-wrap', termId: 'wrap', title: 'Stretch wrap in action', body: 'Wrap the pallet from the bottom up. Overlap each layer so the load stays tight.', actionCue: 'Bottom up. Overlap. Tight load.' },
  { id: 'wa-strap', termId: 'strap', title: 'Strap in action', body: 'Pull the strap snug around the load. Do not leave loose ends hanging.', actionCue: 'Snug strap. No loose ends.' },
  { id: 'wa-warehouse', termId: 'warehouse', title: 'Warehouse awareness', body: 'Know your zone. Follow floor markings and safety lines inside the warehouse.', actionCue: 'Know zone. Follow markings.' },
]

const CLEAR_ALL =
  'Identify every item in this scene. Tap the picture that matches the English word. Found items stay marked until the board is clear.'

function spot(
  id: string,
  label: string,
  imageKey: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  return { id, label, answer: label, imageKey, x, y, w, h }
}

/** Ten boards. Each scene must be cleared item-by-item (word → picture). */
export const LOGISTICS_EYE_SPY_SCENES: EyeSpyScene[] = [
  {
    id: 'receiving-bay',
    title: 'Receiving bay',
    instruction: CLEAR_ALL,
    findOrder: ['box', 'bin', 'pallet', 'dolly'],
    hotspots: [
      spot('box', 'Box', 'log-box', 12, 52, 22, 28),
      spot('bin', 'Bin', 'log-bin', 58, 48, 26, 26),
      spot('pallet', 'Pallet', 'log-pallet', 38, 12, 24, 26),
      spot('dolly', 'Dolly', 'log-dolly', 70, 14, 22, 28),
    ],
  },
  {
    id: 'put-away-aisle',
    title: 'Put-away aisle',
    instruction: CLEAR_ALL,
    findOrder: ['shelf', 'rack', 'cart', 'aisle'],
    hotspots: [
      spot('shelf', 'Shelf', 'log-shelf', 10, 16, 22, 30),
      spot('rack', 'Rack', 'log-rack', 66, 12, 26, 32),
      spot('cart', 'Cart', 'log-cart', 14, 54, 24, 28),
      spot('aisle', 'Aisle', 'log-aisle', 52, 52, 30, 28),
    ],
  },
  {
    id: 'dock-lane',
    title: 'Dock lane',
    instruction: CLEAR_ALL,
    findOrder: ['truck', 'dock', 'ramp', 'van'],
    hotspots: [
      spot('truck', 'Truck', 'log-truck', 8, 14, 28, 30),
      spot('van', 'Van', 'log-van', 68, 12, 24, 30),
      spot('dock', 'Dock', 'log-dock', 12, 52, 26, 30),
      spot('ramp', 'Ramp', 'log-ramp', 54, 50, 30, 28),
    ],
  },
  {
    id: 'yard-entry',
    title: 'Yard entry',
    instruction: CLEAR_ALL,
    findOrder: ['gate', 'door', 'office', 'warehouse'],
    hotspots: [
      spot('gate', 'Gate', 'log-gate', 10, 14, 24, 30),
      spot('door', 'Door', 'log-door', 66, 12, 24, 32),
      spot('office', 'Office', 'log-office', 12, 52, 24, 30),
      spot('warehouse', 'Warehouse', 'log-warehouse', 54, 50, 30, 30),
    ],
  },
  {
    id: 'pack-station',
    title: 'Pack station',
    instruction: CLEAR_ALL,
    findOrder: ['label', 'barcode', 'scanner', 'carton'],
    hotspots: [
      spot('label', 'Label', 'log-label', 10, 14, 22, 28),
      spot('barcode', 'Barcode', 'log-vv-069', 66, 12, 24, 28),
      spot('scanner', 'Scanner', 'log-scanner', 14, 52, 24, 30),
      spot('carton', 'Carton', 'log-vv-078', 54, 50, 28, 30),
    ],
  },
  {
    id: 'ppe-check',
    title: 'PPE check',
    instruction: CLEAR_ALL,
    findOrder: ['vest', 'boots', 'gloves', 'helmet'],
    hotspots: [
      spot('vest', 'Vest', 'log-vest', 12, 12, 22, 30),
      spot('boots', 'Boots', 'log-vv-106', 66, 12, 24, 30),
      spot('gloves', 'Gloves', 'log-vv-107', 14, 52, 24, 30),
      spot('helmet', 'Helmet', 'log-vv-108', 56, 50, 26, 30),
    ],
  },
  {
    id: 'mhe-zone',
    title: 'Material-handling zone',
    instruction: CLEAR_ALL,
    findOrder: ['forklift', 'pallet-jack', 'hand-truck', 'strap'],
    hotspots: [
      spot('forklift', 'Forklift', 'log-vv-151', 8, 14, 28, 32),
      spot('pallet-jack', 'Pallet jack', 'log-jack', 66, 12, 26, 32),
      spot('hand-truck', 'Hand truck', 'log-vv-153', 12, 54, 24, 30),
      spot('strap', 'Strap', 'log-vv-158', 56, 52, 28, 28),
    ],
  },
  {
    id: 'wrap-and-ship',
    title: 'Wrap and ship',
    instruction: CLEAR_ALL,
    findOrder: ['wrap', 'package', 'trailer', 'scale'],
    hotspots: [
      spot('wrap', 'Wrap', 'log-wrap', 10, 14, 24, 30),
      spot('package', 'Package', 'log-vv-077', 66, 12, 26, 30),
      spot('trailer', 'Trailer', 'log-trailer', 12, 52, 28, 30),
      spot('scale', 'Scale', 'log-vv-157', 56, 50, 28, 30),
    ],
  },
  {
    id: 'floor-paths',
    title: 'Floor paths',
    instruction: CLEAR_ALL,
    findOrder: ['floor', 'wall', 'entrance', 'exit'],
    hotspots: [
      spot('floor', 'Floor', 'log-floor', 10, 14, 24, 28),
      spot('wall', 'Wall', 'log-wall', 66, 12, 24, 30),
      spot('entrance', 'Entrance', 'log-vv-025', 12, 52, 26, 30),
      spot('exit', 'Exit', 'log-vv-024', 56, 50, 28, 30),
    ],
  },
  {
    id: 'team-roles',
    title: 'Floor team',
    instruction: CLEAR_ALL,
    findOrder: ['worker', 'supervisor', 'driver', 'receiver'],
    hotspots: [
      spot('worker', 'Worker', 'log-vv-026', 10, 14, 24, 30),
      spot('supervisor', 'Supervisor', 'log-vv-030', 66, 12, 26, 30),
      spot('driver', 'Driver', 'log-vv-028', 12, 52, 26, 30),
      spot('receiver', 'Receiver', 'log-vv-035', 56, 50, 28, 30),
    ],
  },
]

export const LOGISTICS_WORKPLACE_INSTRUCTIONS: WorkplaceInstruction[] = [
    {
      text: 'Scan the shipping label.',
      correct: 'Scan the shipping label',
      imageKey: 'log-label',
      options: ['Scan the shipping label', 'Move the pallet first', 'Remove your vest', 'Climb the rack'],
      supportHint: hint(
        'Scan the shipping label.',
        'Escanea la etiqueta de envío.',
        'امسح ملصق الشحن.',
        'शिपिंग लेबल स्कैन करो।',
        'የመላኪያ መለያውን ስካን አድርጉ።',
        'ናይ ምልኣኽ ላበል ስካን ግበሩ።',
      ),
    },
    {
      text: 'Put on your safety vest before you enter.',
      correct: 'Put on your safety vest before you enter',
      imageKey: 'log-vest',
      options: [
        'Put on your safety vest before you enter',
        'Leave the vest in the break room',
        'Start loading without gear',
        'Stand in the forklift path',
      ],
      supportHint: hint(
        'Put on your safety vest before you enter.',
        'Ponte el chaleco antes de entrar.',
        'ارتدِ سترة الأمان قبل الدخول.',
        'अंदर जाने से पहले सुरक्षा जैकेट पहनो।',
        'ከመግባት በፊት የደህንነት ጃኬት ያድርጉ።',
        'ቅድሚ ምእታው ናይ ድሕንነት ቬስት ኣስድጉ።',
      ),
    },
    {
      text: 'Load the boxes onto the pallet.',
      correct: 'Load the boxes onto the pallet',
      imageKey: 'log-pallet',
      options: ['Load the boxes onto the pallet', 'Throw boxes into the aisle', 'Block the exit', 'Ignore the manifest'],
      supportHint: hint(
        'Load the boxes onto the pallet.',
        'Carga las cajas en la paleta.',
        'حمّل الصناديق على المنصة.',
        'बक्सों को पैलेट पर लोड करो।',
        'ሳጥኖቹን በፓሌት ላይ ጫኑ።',
        'ሳንዱቓት ኣብ ፓሌት ጽዕኑ።',
      ),
    },
    {
      text: 'Check the manifest before loading.',
      correct: 'Check the manifest before loading',
      imageKey: 'log-manifest',
      options: [
        'Check the manifest before loading',
        'Load anything nearby',
        'Skip the count',
        'Sign a blank page',
      ],
      supportHint: hint(
        'Check the manifest before loading.',
        'Revisa el manifiesto antes de cargar.',
        'راجع قائمة الشحن قبل التحميل.',
        'लोड से पहले मैनिफेस्ट जाँचो।',
        'ከመጫን በፊት የጭነት ዝርዝሩን ያረጋግጡ።',
        'ቅድሚ ምጽዓን ንናይ ጽዕነት ዝርዝር ኣረጋግጹ።',
      ),
    },
    {
      text: 'Use the hand truck for heavy boxes.',
      correct: 'Use the hand truck for heavy boxes',
      imageKey: 'log-dolly',
      options: [
        'Use the hand truck for heavy boxes',
        'Carry overloaded stacks alone',
        'Slide boxes with your feet',
        'Climb onto the rack',
      ],
      supportHint: hint(
        'Use the hand truck for heavy boxes.',
        'Usa la carretilla para cajas pesadas.',
        'استخدم عربة اليد للصناديق الثقيلة.',
        'भारी बक्सों के लिए हैंड ट्रक इस्तेमाल करो।',
        'ከባድ ሳጥኖች ለእጅ ጋሪ ይጠቀሙ።',
        'ንከቢድ ሳንዱቓት ናይ ኢድ ጋራ ተጠቐሙ።',
      ),
    },
    {
      text: 'Slide the pallet jack under the pallet.',
      correct: 'Slide the pallet jack under the pallet',
      imageKey: 'log-jack',
      options: [
        'Slide the pallet jack under the pallet',
        'Drive a forklift without training',
        'Pull the pallet by the stretch wrap',
        'Leave the jack blocking the aisle',
      ],
      supportHint: hint(
        'Slide the pallet jack under the pallet.',
        'Desliza la transpaleta bajo la paleta.',
        'أدخل رافعة المنصة تحت المنصة.',
        'पैलेट जैक को पैलेट के नीचे स्लाइड करो।',
        'ፓሌት ጃኩን ከፓሌቱ ስር አስገቡ።',
        'ፓሌት ጃክ ኣብ ትሕቲ ፓሌት ኣእትዉ።',
      ),
    },
    {
      text: 'Wrap the pallet with stretch wrap.',
      correct: 'Wrap the pallet with stretch wrap',
      imageKey: 'log-wrap',
      options: [
        'Wrap the pallet with stretch wrap',
        'Leave the load loose',
        'Tape only one corner',
        'Stack past the rack beam',
      ],
      supportHint: hint(
        'Wrap the pallet with stretch wrap.',
        'Envuelve la paleta con film estirable.',
        'غلّف المنصة بالغلاف المطاطي.',
        'पैलेट को स्ट्रेच रैप से लपेटो।',
        'ፓሌቱን በስትሬች ራፕ ጠቅልሉ።',
        'ንፓሌት ብስትሬች ራፕ ጠቅልሉ።',
      ),
    },
    {
      text: 'Stage the pallet in bay three.',
      correct: 'Stage the pallet in bay three',
      imageKey: 'log-pallet',
      options: [
        'Stage the pallet in bay three',
        'Leave it in the main aisle',
        'Put it wherever is closest',
        'Load it on a truck without scanning',
      ],
      supportHint: hint(
        'Stage the pallet in bay three.',
        'Coloca la paleta en la bahía tres.',
        'ضع المنصة في المكان الثالث.',
        'पैलेट को बे तीन में स्टेज करो।',
        'ፓሌቱን በቤይ ሶስት ላይ አስቀምጡ።',
        'ንፓሌት ኣብ ቤይ ሰለስተ ኣቐምጡ።',
      ),
    },
    {
      text: 'Keep the aisle clear.',
      correct: 'Keep the aisle clear',
      imageKey: 'log-aisle',
      options: [
        'Keep the aisle clear',
        'Stack boxes in the walkway',
        'Park the jack across the path',
        'Ignore spills on the floor',
      ],
      supportHint: hint(
        'Keep the aisle clear.',
        'Mantén el pasillo despejado.',
        'أبقِ الممر واضحاً.',
        'गलियारा साफ़ रखो।',
        'መተላለፊያውን ክፍት ያድርጉ።',
        'መገዲ ክፉት ግበሩ።',
      ),
    },
  ]
