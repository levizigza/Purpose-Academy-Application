/**
 * Shared Basic Computer Skills — Purpose Academy video + try-it collection.
 * Placed at journey step 12 / Unit 6 (all pathways) — curriculum map position
 * after Workplace Instructions, before Site Language and Safety.
 *
 * Audience: Level-4 English; may be a learner’s first computer.
 * Each MP4: action-matched visuals (hardware close-ups or practice-desktop demos)
 * + natural English narration + large burned-in captions (Level-4 English).
 * Pattern per lesson: Watch → Try → Remember → short check.
 */

export type ComputerSkillFamilyId =
  | 'power-point'
  | 'files-folders'
  | 'write-save'
  | 'email'
  | 'safe-habits'

export type ComputerTryKind =
  | 'power'
  | 'mouse'
  | 'keyboard'
  | 'folder'
  | 'subfolder'
  | 'save-name'
  | 'paragraph'
  | 'save-doc'
  | 'email-send'
  | 'email-reply'
  | 'attach-save'
  | 'safe'

export type BasicComputerLesson = {
  id: string
  n: number
  title: string
  family: ComputerSkillFamilyId
  familyLabel: string
  /** File under public/media/basic-computer-skills/ */
  file: string
  purpose: string
  watch: string
  tryIt: string
  remember: string
  tryKind: ComputerTryKind
  /** Level-4 check after the try */
  checkPrompt: string
  checkOptions: string[]
  checkAnswer: string
  checkCorrect: string
  checkWrong: string
}

export const COMPUTER_SKILL_FAMILIES: {
  id: ComputerSkillFamilyId
  label: string
  blurb: string
}[] = [
  {
    id: 'power-point',
    label: 'Start & point',
    blurb: 'Turn the computer on, then use the mouse and keyboard.',
  },
  {
    id: 'files-folders',
    label: 'Files & folders',
    blurb: 'Keep your job files in clear folders you can find again.',
  },
  {
    id: 'write-save',
    label: 'Write & save',
    blurb: 'Type short paragraphs and save them with a clear name.',
  },
  {
    id: 'email',
    label: 'Email',
    blurb: 'Write, send, reply, and share files safely.',
  },
  {
    id: 'safe-habits',
    label: 'Safe habits',
    blurb: 'Protect your password and click carefully.',
  },
]

export const BASIC_COMPUTER_SKILLS_VIDEOS: BasicComputerLesson[] = [
  {
    id: 'power-on-off',
    n: 1,
    title: 'Turn the computer on and off',
    family: 'power-point',
    familyLabel: 'Start & point',
    file: '01_Turn_computer_on_off.mp4',
    purpose: 'Start the computer safely. Shut it down the right way.',
    watch: 'Press the power button to turn ON. Use Shut down to turn OFF.',
    tryIt: 'Tap the steps in the right order.',
    remember: 'On with the button. Off with Shut down — not the plug.',
    tryKind: 'power',
    checkPrompt: 'How do you turn the computer OFF safely?',
    checkOptions: [
      'Click Start → Power → Shut down',
      'Pull the power cord while it is working',
      'Hit the screen hard',
      'Close your eyes and wait',
    ],
    checkAnswer: 'Click Start → Power → Shut down',
    checkCorrect: 'Yes. Shut down from the Start menu.',
    checkWrong: 'Use Start → Power → Shut down. Do not pull the plug.',
  },
  {
    id: 'mouse',
    n: 2,
    title: 'Use the mouse',
    family: 'power-point',
    familyLabel: 'Start & point',
    file: '02_Use_the_mouse.mp4',
    purpose: 'Move the arrow. Click to choose. Roll the wheel to move the page.',
    watch: 'One click chooses. Two quick clicks open. The wheel moves the page.',
    tryIt: 'Click the yellow button that says Continue.',
    remember: 'Point. Click. Open. Move the page.',
    tryKind: 'mouse',
    checkPrompt: 'What does one left click usually do?',
    checkOptions: ['Choose something', 'Shut down the computer', 'Delete everything', 'Print a book'],
    checkAnswer: 'Choose something',
    checkCorrect: 'Yes. One click chooses.',
    checkWrong: 'One left click chooses. Two quick clicks open.',
  },
  {
    id: 'keyboard',
    n: 3,
    title: 'Use the keyboard',
    family: 'power-point',
    familyLabel: 'Start & point',
    file: '03_Use_the_keyboard.mp4',
    purpose: 'Type letters. Use Space, Enter, and Backspace.',
    watch: 'Space makes a gap. Enter goes next. Backspace erases.',
    tryIt: 'Type the word: safety',
    remember: 'Type. Space. Enter. Backspace.',
    tryKind: 'keyboard',
    checkPrompt: 'Which key erases the letter behind the blinking line?',
    checkOptions: ['Backspace', 'Space bar', 'Enter', 'Shift'],
    checkAnswer: 'Backspace',
    checkCorrect: 'Yes. Backspace erases.',
    checkWrong: 'Backspace erases. Space makes a gap. Enter goes next.',
  },
  {
    id: 'create-folder',
    n: 4,
    title: 'Create a folder',
    family: 'files-folders',
    familyLabel: 'Files & folders',
    file: '04_Create_a_folder.mp4',
    purpose: 'Make a folder with a clear name for your job files.',
    watch: 'New → Folder → type a clear name → Enter.',
    tryIt: 'Name a new folder: Job Files',
    remember: 'New → Folder → clear name.',
    tryKind: 'folder',
    checkPrompt: 'What is a good folder name for job files?',
    checkOptions: ['Job Files', 'asdfasdf', '111111', 'no name'],
    checkAnswer: 'Job Files',
    checkCorrect: 'Yes. Clear names help you find files later.',
    checkWrong: 'Use clear names like Job Files — not random letters.',
  },
  {
    id: 'create-subfolder',
    n: 5,
    title: 'Create a folder inside a folder',
    family: 'files-folders',
    familyLabel: 'Files & folders',
    file: '05_Create_a_subfolder.mp4',
    purpose: 'Make a smaller folder inside your main folder.',
    watch: 'Open the main folder. Then New → Folder again.',
    tryIt: 'Inside Job Files, make a folder named Week 1.',
    remember: 'Open folder → New → Folder → name it.',
    tryKind: 'subfolder',
    checkPrompt: 'Where does a folder inside a folder live?',
    checkOptions: [
      'Inside another folder',
      'Only in the printer',
      'On the power button',
      'In the trash always',
    ],
    checkAnswer: 'Inside another folder',
    checkCorrect: 'Yes. It lives inside another folder.',
    checkWrong: 'It is a folder inside another folder.',
  },
  {
    id: 'save-name',
    n: 6,
    title: 'Save a file with a name',
    family: 'files-folders',
    familyLabel: 'Files & folders',
    file: '06_Save_file_with_name.mp4',
    purpose: 'Save your work into a folder with a name you understand.',
    watch: 'File → Save As → choose folder → type name → Save.',
    tryIt: 'Save this file as Safety Notes in Job Files.',
    remember: 'Save As → folder → clear name → Save.',
    tryKind: 'save-name',
    checkPrompt: 'Which file name is easiest to find later?',
    checkOptions: ['Safety Notes', 'document1finalFINAL', 'xxx', 'untitled'],
    checkAnswer: 'Safety Notes',
    checkCorrect: 'Yes. Clear names save time later.',
    checkWrong: 'Choose a clear name like Safety Notes.',
  },
  {
    id: 'write-paragraph',
    n: 7,
    title: 'Write a short paragraph',
    family: 'write-save',
    familyLabel: 'Write & save',
    file: '07_Write_short_paragraph.mp4',
    purpose: 'Type 2 or 3 short sentences in a document.',
    watch: 'Click the page. Type slowly. Use Enter for a new line.',
    tryIt: 'Type two short sentences about today.',
    remember: 'Open → type short sentences → check.',
    tryKind: 'paragraph',
    checkPrompt: 'How many sentences should you start with?',
    checkOptions: ['2 or 3 short sentences', 'One hundred pages', 'No words', 'Only emojis'],
    checkAnswer: '2 or 3 short sentences',
    checkCorrect: 'Yes. Start small — 2 or 3 short sentences.',
    checkWrong: 'Start with 2 or 3 short sentences. Keep it clear.',
  },
  {
    id: 'save-document',
    n: 8,
    title: 'Save your document',
    family: 'write-save',
    familyLabel: 'Write & save',
    file: '08_Save_your_document.mp4',
    purpose: 'Save often so you do not lose your work.',
    watch: 'File → Save, or hold Control and press S. Save again after new words.',
    tryIt: 'Click Save to keep your document.',
    remember: 'Save often. Control and S is fast.',
    tryKind: 'save-doc',
    checkPrompt: 'What is a fast way to save?',
    checkOptions: [
      'Hold Control and press S',
      'Pull the cord',
      'Close without saving',
      'Delete the file',
    ],
    checkAnswer: 'Hold Control and press S',
    checkCorrect: 'Yes. Control and S saves quickly.',
    checkWrong: 'Use File → Save, or hold Control and press S.',
  },
  {
    id: 'email-send',
    n: 9,
    title: 'Write and send an email',
    family: 'email',
    familyLabel: 'Email',
    file: '09_Write_and_send_email.mp4',
    purpose: 'Write a clear email and send it.',
    watch: 'To → Subject → message → Send.',
    tryIt: 'Fill To, Subject, and message. Then Send.',
    remember: 'To → Subject → message → Send.',
    tryKind: 'email-send',
    checkPrompt: 'What goes in the Subject line?',
    checkOptions: [
      'A short title for the email',
      'Your password',
      'Nothing ever',
      'The whole book',
    ],
    checkAnswer: 'A short title for the email',
    checkCorrect: 'Yes. Subject is a short title.',
    checkWrong: 'Subject is a short title — not your password.',
  },
  {
    id: 'email-reply',
    n: 10,
    title: 'Reply to an email',
    family: 'email',
    familyLabel: 'Email',
    file: '10_Reply_to_email.mp4',
    purpose: 'Answer an email with Reply — not a new blank message.',
    watch: 'Open → Reply → type → Send.',
    tryIt: 'Click Reply and type a short answer.',
    remember: 'Open → Reply → type → Send.',
    tryKind: 'email-reply',
    checkPrompt: 'You got an email. What should you click to answer it?',
    checkOptions: ['Reply', 'Delete forever', 'Forward to strangers', 'Shut down'],
    checkAnswer: 'Reply',
    checkCorrect: 'Yes. Click Reply to answer.',
    checkWrong: 'Click Reply. Then type and Send.',
  },
  {
    id: 'attach-save',
    n: 11,
    title: 'Attach a file and save an attachment',
    family: 'email',
    familyLabel: 'Email',
    file: '11_Attach_and_save_files.mp4',
    purpose: 'Send a file with email. Save a file someone sent you.',
    watch: 'Attach with the paperclip. Save attachments into your folder.',
    tryIt: 'Attach Safety Notes, then save an incoming file.',
    remember: 'Attach before Send. Save attachments to a folder.',
    tryKind: 'attach-save',
    checkPrompt: 'How do you add a file to an email?',
    checkOptions: [
      'Click Attach or the paperclip, then choose the file',
      'Type the password in the subject',
      'Shake the computer',
      'Never send files',
    ],
    checkAnswer: 'Click Attach or the paperclip, then choose the file',
    checkCorrect: 'Yes. Attach, then Send.',
    checkWrong: 'Use Attach / paperclip, choose the file, then Send.',
  },
  {
    id: 'safe-online',
    n: 12,
    title: 'Stay safe online',
    family: 'safe-habits',
    familyLabel: 'Safe habits',
    file: '12_Stay_safe_online.mp4',
    purpose: 'Keep passwords private. Click carefully. Ask for help.',
    watch: 'Private password. Careful clicks. Log out on shared computers.',
    tryIt: 'Choose the safe habit.',
    remember: 'Private password. Careful clicks. Ask for help.',
    tryKind: 'safe',
    checkPrompt: 'What is a safe habit for your school password?',
    checkOptions: [
      'Keep it private and do not share it',
      'Write it on the shop wall',
      'Text it to a stranger',
      'Post it online',
    ],
    checkAnswer: 'Keep it private and do not share it',
    checkCorrect: 'Yes. Passwords stay private.',
    checkWrong: 'Never share or post passwords.',
  },
]

export function computerSkillsVideoUrl(file: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}media/basic-computer-skills/${file}`
}
