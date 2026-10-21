/**
 * Construction Foundations practice layers aligned to Construction Visual Vocabulary.
 * termIds / Eye Spy hotspot ids / WI imageKeys use con-vv worksheet tiles and
 * CONSTRUCTION_VOCAB_660 ids (e.g. hammer-011), not the legacy 7-term curriculum.
 */
import type { EyeSpyScene } from '../../student/journeyCurriculum'
import { hint } from '../packHelpers'
import type { WordAction, WorkplaceInstruction } from '../types'

/** Level-1 tools + core materials drive Word → Action. */
export const CONSTRUCTION_WORD_ACTIONS: WordAction[] = [
  { id: 'wa-hammer', termId: 'hammer-011', title: 'Hammer in action', body: 'Hold the hammer at the end. Drive the nail with control. Keep hands clear of the strike.', actionCue: 'End grip. Controlled strike. Hands clear.' },
  { id: 'wa-tape', termId: 'tape-measure-012', title: 'Tape measure in action', body: 'Hook the end firmly. Measure twice. Mark once before you cut.', actionCue: 'Hook firm. Measure twice. Mark once.' },
  { id: 'wa-saw', termId: 'circular-saw-013', title: 'Circular saw in action', body: 'Set the blade depth. Keep hands away from the blade. Let the blade stop before you set it down.', actionCue: 'Depth set. Hands clear. Blade stop.' },
  { id: 'wa-drill', termId: 'drill-014', title: 'Drill in action', body: 'Hold the drill with two hands. Start on low speed. Keep the bit straight.', actionCue: 'Two hands. Low speed. Straight bit.' },
  { id: 'wa-impact', termId: 'impact-driver-015', title: 'Impact driver in action', body: 'Seat the bit fully. Drive the screw straight. Stop when the head sits flush.', actionCue: 'Bit seated. Straight drive. Flush head.' },
  { id: 'wa-grinder', termId: 'grinder-016', title: 'Grinder in action', body: 'Keep the guard on. Wear eye protection. Grind with both hands.', actionCue: 'Guard on. Eyes protected. Two hands.' },
  { id: 'wa-nail-gun', termId: 'nail-gun-017', title: 'Nail gun in action', body: 'Point the nail gun down when you are not firing. Keep your finger off the trigger until ready.', actionCue: 'Point down. Finger off until ready.' },
  { id: 'wa-level', termId: 'level-018', title: 'Level in action', body: 'Press the level on the surface. Watch the bubble sit in the middle.', actionCue: 'Firm contact. Bubble centered.' },
  { id: 'wa-square', termId: 'square-019', title: 'Square in action', body: 'Hold the square tight to the edge. Mark a straight cut line.', actionCue: 'Tight to edge. Straight mark.' },
  { id: 'wa-knife', termId: 'utility-knife-020', title: 'Utility knife in action', body: 'Cut away from your body. Close the blade when you finish.', actionCue: 'Cut away. Blade closed after.' },
  { id: 'wa-concrete', termId: 'concrete-003', title: 'Concrete in action', body: 'Pour the concrete into the form. Do not walk on wet concrete.', actionCue: 'Pour into form. Stay off wet concrete.' },
  { id: 'wa-brick', termId: 'brick-004', title: 'Brick in action', body: 'Lay the brick on a full mortar bed. Keep the line straight.', actionCue: 'Full bed. Straight line.' },
  { id: 'wa-block', termId: 'block-005', title: 'Block in action', body: 'Stack the blocks level. Check with the level as you go.', actionCue: 'Level stack. Check often.' },
  { id: 'wa-joist', termId: 'joist-008', title: 'Joist in action', body: 'Set the joist on the beam. Keep spacing even before you fasten.', actionCue: 'Set true. Even spacing. Fasten.' },
  { id: 'wa-truss', termId: 'truss-010', title: 'Truss in action', body: 'Lift the truss with the crew or crane. Brace it before you release the lift.', actionCue: 'Lift together. Brace first.' },
  { id: 'wa-hard-hat', termId: 'hard-hat-234', title: 'Hard hat before entry', body: 'Put the hard hat on before you enter the site. Replace it if it is cracked.', actionCue: 'Hard hat on before entry.' },
  { id: 'wa-gloves', termId: 'work-gloves-064', title: 'Work gloves in action', body: 'Wear gloves when you carry wood or rough materials. Pick gloves for the job.', actionCue: 'Right gloves. Hands protected.' },
  { id: 'wa-ladder', termId: 'ladder-041', title: 'Ladder in action', body: 'Face the ladder when you climb. Keep three points of contact. Do not stand on the top step.', actionCue: 'Face ladder. Three points. No top step.' },
  { id: 'wa-scaffold', termId: 'scaffold-040', title: 'Scaffold in action', body: 'Lock the scaffold wheels before you climb. Never ride a moving scaffold.', actionCue: 'Wheels locked. No riding.' },
  { id: 'wa-foundation', termId: 'foundation-002', title: 'Foundation awareness', body: 'Keep the foundation forms clear. Report cracks or voids to your supervisor.', actionCue: 'Forms clear. Report problems.' },
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
export const CONSTRUCTION_EYE_SPY_SCENES: EyeSpyScene[] = [
  {
    id: 'shop-floor',
    title: 'Shop floor',
    instruction: CLEAR_ALL,
    findOrder: ['hammer-011', 'level-018', 'circular-saw-013', 'hard-hat-234'],
    hotspots: [
      spot('hammer-011', 'Hammer', 'con-vv-011', 12, 55, 22, 28),
      spot('circular-saw-013', 'Circular saw', 'con-vv-013', 58, 48, 28, 22),
      spot('hard-hat-234', 'Hard hat', 'con-vv-234', 38, 12, 20, 22),
      spot('level-018', 'Level', 'con-vv-018', 70, 18, 24, 14),
    ],
  },
  {
    id: 'work-bay',
    title: 'Work bay',
    instruction: CLEAR_ALL,
    findOrder: ['drill-014', 'tape-measure-012', 'work-gloves-064', 'square-019'],
    hotspots: [
      spot('drill-014', 'Drill', 'con-vv-014', 10, 18, 22, 32),
      spot('square-019', 'Square', 'con-vv-019', 68, 12, 22, 26),
      spot('tape-measure-012', 'Tape measure', 'con-vv-012', 40, 52, 20, 26),
      spot('work-gloves-064', 'Work gloves', 'con-vv-064', 72, 50, 20, 28),
    ],
  },
  {
    id: 'cut-station',
    title: 'Cut station',
    instruction: CLEAR_ALL,
    findOrder: ['circular-saw-013', 'utility-knife-020', 'nail-gun-017', 'tape-measure-012'],
    hotspots: [
      spot('circular-saw-013', 'Circular saw', 'con-vv-013', 36, 40, 34, 22),
      spot('utility-knife-020', 'Utility knife', 'con-vv-020', 8, 48, 20, 28),
      spot('nail-gun-017', 'Nail gun', 'con-vv-017', 72, 52, 22, 26),
      spot('tape-measure-012', 'Tape measure', 'con-vv-012', 14, 14, 20, 24),
    ],
  },
  {
    id: 'fastener-bench',
    title: 'Fastener bench',
    instruction: CLEAR_ALL,
    findOrder: ['hammer-011', 'nail-022', 'screw-021', 'impact-driver-015'],
    hotspots: [
      spot('hammer-011', 'Hammer', 'con-vv-011', 10, 42, 22, 32),
      spot('nail-022', 'Nail', 'con-vv-022', 40, 14, 18, 26),
      spot('screw-021', 'Screw', 'con-vv-021', 68, 16, 20, 26),
      spot('impact-driver-015', 'Impact driver', 'con-vv-015', 52, 50, 24, 32),
    ],
  },
  {
    id: 'power-tools',
    title: 'Power-tool cart',
    instruction: CLEAR_ALL,
    findOrder: ['drill-014', 'grinder-016', 'impact-driver-015', 'circular-saw-013'],
    hotspots: [
      spot('drill-014', 'Drill', 'con-vv-014', 8, 16, 22, 34),
      spot('grinder-016', 'Grinder', 'con-vv-016', 70, 14, 22, 30),
      spot('impact-driver-015', 'Impact driver', 'con-vv-015', 14, 54, 22, 30),
      spot('circular-saw-013', 'Circular saw', 'con-vv-013', 52, 52, 30, 24),
    ],
  },
  {
    id: 'layout-table',
    title: 'Layout table',
    instruction: CLEAR_ALL,
    findOrder: ['level-018', 'square-019', 'tape-measure-012', 'stud-028'],
    hotspots: [
      spot('level-018', 'Level', 'con-vv-018', 28, 16, 40, 14),
      spot('square-019', 'Square', 'con-vv-019', 8, 40, 22, 28),
      spot('tape-measure-012', 'Tape measure', 'con-vv-012', 40, 48, 20, 26),
      spot('stud-028', 'Stud', 'con-vv-028', 70, 38, 22, 36),
    ],
  },
  {
    id: 'site-access',
    title: 'Site access',
    instruction: CLEAR_ALL,
    findOrder: ['hard-hat-234', 'safety-glasses-235', 'ladder-041', 'scaffold-040'],
    hotspots: [
      spot('hard-hat-234', 'Hard hat', 'con-vv-234', 12, 12, 20, 24),
      spot('safety-glasses-235', 'Safety glasses', 'con-vv-235', 68, 12, 22, 24),
      spot('ladder-041', 'Ladder', 'con-vv-041', 10, 46, 22, 36),
      spot('scaffold-040', 'Scaffold', 'con-vv-040', 52, 44, 30, 34),
    ],
  },
  {
    id: 'masonry-yard',
    title: 'Masonry yard',
    instruction: CLEAR_ALL,
    findOrder: ['brick-004', 'block-005', 'concrete-003', 'wheelbarrow-039'],
    hotspots: [
      spot('brick-004', 'Brick', 'con-vv-004', 10, 16, 22, 26),
      spot('block-005', 'Block', 'con-vv-005', 66, 14, 24, 28),
      spot('concrete-003', 'Concrete', 'con-vv-003', 12, 52, 24, 28),
      spot('wheelbarrow-039', 'Wheelbarrow', 'con-vv-039', 54, 50, 30, 30),
    ],
  },
  {
    id: 'framing-bay',
    title: 'Framing bay',
    instruction: CLEAR_ALL,
    findOrder: ['hammer-011', 'nail-gun-017', 'joist-008', 'lumber-027'],
    hotspots: [
      spot('hammer-011', 'Hammer', 'con-vv-011', 8, 48, 20, 30),
      spot('nail-gun-017', 'Nail gun', 'con-vv-017', 70, 46, 22, 30),
      spot('joist-008', 'Joist', 'con-vv-008', 14, 12, 28, 26),
      spot('lumber-027', 'Lumber', 'con-vv-027', 52, 14, 30, 26),
    ],
  },
  {
    id: 'finish-openings',
    title: 'Finish openings',
    instruction: CLEAR_ALL,
    findOrder: ['door-032', 'window-033', 'drywall-036', 'utility-knife-020'],
    hotspots: [
      spot('door-032', 'Door', 'con-vv-032', 10, 18, 22, 36),
      spot('window-033', 'Window', 'con-vv-033', 66, 14, 24, 30),
      spot('drywall-036', 'Drywall', 'con-vv-036', 14, 58, 26, 26),
      spot('utility-knife-020', 'Utility knife', 'con-vv-020', 62, 54, 22, 28),
    ],
  },
]

export const CONSTRUCTION_WORKPLACE_INSTRUCTIONS: WorkplaceInstruction[] = [
  {
    text: 'Bring the tape measure.',
    correct: 'Bring the tape measure',
    imageKey: 'con-vv-012',
    options: [
      'Bring the tape measure',
      'Bring the hammer',
      'Put on a hard hat',
      'Start cutting wood',
    ],
    supportHint: hint('Bring the tape measure.', 'Trae la cinta métrica.', 'أحضر شريط القياس.', 'टेप मेज़र लाओ।', 'ሜትሩን አምጡ።', 'ሜትሮ ኣምጽኡ።'),
  },
  {
    text: 'Pass me the level.',
    correct: 'Pass me the level',
    imageKey: 'con-vv-018',
    options: [
      'Pass me the level',
      'Pass the hammer',
      'Open the door',
      'Put on boots',
    ],
    supportHint: hint('Pass me the level.', 'Pásame el nivel.', 'ناولني الميزان.', 'मुझे लेवल दो।', 'ሊቬሉን ስጡኝ።', 'ሊቬል ሃቡኒ።'),
  },
  {
    text: 'Check the wall with the level.',
    correct: 'Check the wall with the level',
    imageKey: 'con-vv-018',
    options: [
      'Check the wall with the level',
      'Check the floor with a hammer',
      'Bring the drill',
      'Remove your hard hat',
    ],
    supportHint: hint('Check the wall with the level.', 'Revisa la pared con el nivel.', 'افحص الجدار بالميزان.', 'लेवल से दीवार जाँचो।', 'በሊቬል ግድግዳውን ያረጋግጡ።', 'ብሊቬል ንመንደቅ ኣረጋግጹ።'),
  },
  {
    text: 'Put on your hard hat before you enter.',
    correct: 'Put on your hard hat before you enter',
    imageKey: 'con-vv-234',
    options: [
      'Put on your hard hat before you enter',
      'Leave your hard hat in the truck',
      'Start the saw first',
      'Remove all safety gear',
    ],
    supportHint: hint('Put on your hard hat before you enter.', 'Ponte el casco antes de entrar.', 'ارتدِ الخوذة قبل الدخول.', 'अंदर जाने से पहले हार्ड हैट पहनो।', 'ከመግባት በፊት ቆብ ያድርጉ።', 'ቅድሚ ምእታው ኮፍያ ኣስድጉ።'),
  },
  {
    text: 'Keep hands clear of the circular saw.',
    correct: 'Keep hands clear of the circular saw',
    imageKey: 'con-vv-013',
    options: [
      'Keep hands clear of the circular saw',
      'Hold the blade while it spins',
      'Remove eye protection',
      'Stand on the board',
    ],
    supportHint: hint('Keep hands clear of the circular saw.', 'Mantén las manos lejos de la sierra circular.', 'أبقِ يديك بعيداً عن المنشار الدائري.', 'गोल आरी से हाथ दूर रखो।', 'እጆቻችሁን ከክብ መጋዝ ርቀው ያድርጉ።', 'ኢድኩም ካብ ክብ መጋዝ ርሑቅ ግበሩ።'),
  },
  {
    text: 'Wear your work gloves before you carry wood.',
    correct: 'Wear your work gloves before you carry wood',
    imageKey: 'con-vv-064',
    options: [
      'Wear your work gloves before you carry wood',
      'Wear gloves only at lunch',
      'Skip gloves if it is hot',
      'Share one hard hat with a friend',
    ],
    supportHint: hint('Wear your work gloves before you carry wood.', 'Ponte los guantes antes de cargar madera.', 'ارتدِ القفازات قبل حمل الخشب.', 'लकड़ी उठाने से पहले दस्ताने पहनो।', 'እንጨት ከመሸከም በፊት ጋንት ያድርጉ።', 'ቅድሚ ምሽካም ዕንጨይቲ ጋንቲ ኣስድጉ።'),
  },
  {
    text: 'Bring the drill to bay one.',
    correct: 'Bring the drill to bay one',
    imageKey: 'con-vv-014',
    options: [
      'Bring the drill to bay one',
      'Bring the saw to bay three',
      'Leave the drill in the truck',
      'Start cutting without the drill',
    ],
    supportHint: hint('Bring the drill to bay one.', 'Trae el taladro a la bahía uno.', 'أحضر المثقاب إلى المكان الأول.', 'ड्रिल बे एक पर लाओ।', 'መሰርሰሪያውን ወደ ቤይ አንድ አምጡ።', 'መሰርሰሪ ናብ ቤይ ሓደ ኣምጽኡ።'),
  },
  {
    text: 'Measure the board twice.',
    correct: 'Measure the board twice',
    imageKey: 'con-vv-012',
    options: [
      'Measure the board twice',
      'Guess the length once',
      'Cut before measuring',
      'Throw the tape measure',
    ],
    supportHint: hint('Measure the board twice.', 'Mide la tabla dos veces.', 'قِس اللوح مرتين.', 'बोर्ड को दो बार मापो।', 'ሰሌዳውን ሁለት ጊዜ ይለኩ።', 'ንሰሌዳ ክልተ ጊዜ ይለኩ።'),
  },
  {
    text: 'Clean the bay before you leave.',
    correct: 'Clean the bay before you leave',
    imageKey: 'con-vv-001',
    options: [
      'Clean the bay before you leave',
      'Leave scrap on the floor',
      'Hide damaged tools',
      'Skip cleanup if you are tired',
    ],
    supportHint: hint('Clean the bay before you leave.', 'Limpia la bahía antes de irte.', 'نظّف المكان قبل أن تغادر.', 'जाने से पहले बे साफ़ करो।', 'ከመሄድ በፊት ቤዩን ያጵዱ።', 'ቅድሚ ምኻድ ንቤይ ኣጽርዩ።'),
  },
]
