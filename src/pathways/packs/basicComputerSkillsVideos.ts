/**
 * Shared Basic Computer Skills — Purpose Academy video + try-it + practice questions.
 * Placed at journey step 12 / Unit 6 (all pathways), after Workplace Instructions.
 *
 * Audience: Level-4 English; may be a learner’s first computer.
 * 5 Basic lessons (required) + 8 Extra lessons (optional, for more practice).
 * Each MP4 is rendered frame by frame (scripts/build-basic-computer-skills-videos.py):
 * every click, key and highlight lands on the word that names it.
 * Pattern per lesson: Watch → Try → 10 practice questions (miss → replay that part → retry).
 */
import { BASIC_COMPUTER_TIMING } from './basicComputerSkillsTiming'

export type ComputerSkillFamilyId = 'basics' | 'files' | 'write' | 'email' | 'online'

export type ComputerTryKind =
  | 'power'
  | 'mouse'
  | 'keyboard'
  | 'window'
  | 'save-name'
  | 'folder'
  | 'subfolder'
  | 'paragraph'
  | 'email-send'
  | 'email-reply'
  | 'attach-save'
  | 'safe'
  | 'search'

export type ComputerQuestion = {
  id: string
  n: number
  prompt: string
  choices: string[]
  /** Index into choices */
  answer: number
  /** One short teaching line — shown after every answer */
  teach: string
  /** Narration line (0-based) the replay jumps to */
  beat: number
}

export type BasicComputerLesson = {
  id: string
  n: number
  /** Basic lessons are required; Extra lessons are for more practice */
  core: boolean
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
  questions: ComputerQuestion[]
}

export const COMPUTER_SKILL_FAMILIES: {
  id: ComputerSkillFamilyId
  label: string
  blurb: string
}[] = [
  { id: 'basics', label: 'Basic · do these 5', blurb: 'Turn it on, use the mouse and keyboard, open a window, save your work.' },
  { id: 'files', label: 'Extra · Folders', blurb: 'Keep your files in folders you can find again.' },
  { id: 'write', label: 'Extra · Writing', blurb: 'Type a few sentences and fix mistakes.' },
  { id: 'email', label: 'Extra · Email', blurb: 'Send, reply, and add a file.' },
  { id: 'online', label: 'Extra · Online', blurb: 'Stay safe. Find things on the web.' },
]

type Q = [prompt: string, choices: string[], answer: number, teach: string, beat: number]

function qs(lessonId: string, list: Q[]): ComputerQuestion[] {
  return list.map(([prompt, choices, answer, teach, beat], i) => ({
    id: `${lessonId}-q${i + 1}`,
    n: i + 1,
    prompt,
    choices,
    answer,
    teach,
    beat,
  }))
}

const FAMILY_LABEL: Record<ComputerSkillFamilyId, string> = {
  basics: 'Basic',
  files: 'Folders',
  write: 'Writing',
  email: 'Email',
  online: 'Online',
}

function lesson(
  l: Omit<BasicComputerLesson, 'familyLabel' | 'questions'>,
  questions: Q[],
): BasicComputerLesson {
  return { ...l, familyLabel: FAMILY_LABEL[l.family], questions: qs(l.id, questions) }
}

export const BASIC_COMPUTER_SKILLS_VIDEOS: BasicComputerLesson[] = [
  lesson(
    {
      id: 'bcs-power', n: 1, core: true, family: 'basics', title: 'Turn the computer on and off',
      file: '01_Turn_computer_on_off.mp4',
      purpose: 'Turn the computer on. Turn it off the right way.',
      watch: 'Press the power button to turn it on. Start → Power → Shut down to turn it off.',
      tryIt: 'Tap the steps in order.',
      remember: 'On: the power button. Off: Shut down. Not the plug.',
      tryKind: 'power',
    },
    [
      ['What turns the computer on?', ['The power button', 'The plug', 'The screen'], 0, 'Press the power button one time.', 1],
      ['How many times do you press the power button?', ['One time', 'Ten times', 'Hold it for a long time'], 0, 'Press it one time. Then wait.', 2],
      ['You pressed the power button. What do you do next?', ['Wait for the screen', 'Pull the plug', 'Press it again and again'], 0, 'Wait. The screen turns on by itself.', 3],
      ['What is the desktop?', ['The first screen with icons', 'The table under the computer', 'The keyboard'], 0, 'The desktop is the first screen. The computer is ready.', 4],
      ['To turn it off, what do you click first?', ['Start', 'Mail', 'The clock'], 0, 'Start is in the bottom left corner.', 5],
      ['After Start, what do you click?', ['Power', 'Notes', 'Browser'], 0, 'Click Power. A small list opens.', 6],
      ['Which one turns the computer off?', ['Shut down', 'Sleep', 'Restart'], 0, 'Shut down turns it off.', 7],
      ['What happens after Shut down?', ['The screen goes dark', 'A new window opens', 'The music plays'], 0, 'Wait. The screen goes dark.', 8],
      ['Is it OK to pull the plug to turn it off?', ['No', 'Yes', 'Only on Monday'], 0, 'Do not pull the plug. Use Shut down.', 9],
      ['What is the right order to turn it off?', ['Start → Power → Shut down', 'Power → Start → Plug', 'Shut down → Start → Mail'], 0, 'Start, then Power, then Shut down.', 5],
    ],
  ),
  lesson(
    {
      id: 'bcs-mouse', n: 2, core: true, family: 'basics', title: 'Use the mouse',
      file: '02_Use_the_mouse.mp4',
      purpose: 'Move the arrow. Click. Double-click. Right-click.',
      watch: 'Move the mouse to move the arrow. Left button clicks. Right button opens a menu.',
      tryIt: 'Click the yellow button.',
      remember: 'One click chooses. Two fast clicks open.',
      tryKind: 'mouse',
    },
    [
      ['What moves the arrow on the screen?', ['The mouse', 'The screen', 'The power button'], 0, 'Move the mouse. The arrow moves too.', 1],
      ['Which button do you use most?', ['The left button', 'The right button', 'No button'], 0, 'The left button is for most clicks.', 2],
      ['Press the left button one time. What is it called?', ['A click', 'A double-click', 'A right-click'], 0, 'One press is a click.', 3],
      ['What does one click do to an icon?', ['Chooses it', 'Deletes it', 'Turns off the computer'], 0, 'One click chooses. The icon turns light blue.', 3],
      ['Two fast clicks are called…', ['A double-click', 'A right-click', 'A shut down'], 0, 'Two fast clicks is a double-click.', 4],
      ['What does a double-click do?', ['Opens things', 'Turns the screen off', 'Makes a sound only'], 0, 'A double-click opens a program or folder.', 5],
      ['Where is the right button?', ['On the right side of the mouse', 'On the keyboard', 'On the screen'], 0, 'The right button is on the right side.', 6],
      ['What does a right-click open?', ['A small menu', 'A new computer', 'An email'], 0, 'A right-click opens a small menu.', 7],
      ['How do you close a small menu?', ['Click an empty space', 'Pull the plug', 'Shake the mouse'], 0, 'Click an empty space. The menu closes.', 8],
      ['You want to open Notes. What do you do?', ['Double-click Notes', 'Right-click the clock', 'Press the power button'], 0, 'Double-click the icon to open it.', 4],
    ],
  ),
  lesson(
    {
      id: 'bcs-keyboard', n: 3, core: true, family: 'basics', title: 'Use the keyboard',
      file: '03_Use_the_keyboard.mp4',
      purpose: 'Type letters. Fix mistakes. Make spaces and new lines.',
      watch: 'Click the page first. Press keys to type. Backspace deletes. Shift makes a big letter.',
      tryIt: 'Type the word you see.',
      remember: 'Click first, then type. Backspace fixes mistakes.',
      tryKind: 'keyboard',
    },
    [
      ['What do you do before you type?', ['Click inside the page', 'Turn off the computer', 'Close the window'], 0, 'Click inside the page first. A line blinks there.', 1],
      ['What happens when you press a letter key?', ['The letter shows on the page', 'The computer turns off', 'A menu opens'], 0, 'Press a key. Its letter shows on the page.', 2],
      ['Which key deletes a letter?', ['Backspace', 'Enter', 'Shift'], 0, 'Backspace deletes the letter before the line.', 3],
      ['How do you make a big letter, like H?', ['Hold Shift and press H', 'Press H two times', 'Press Enter'], 0, 'Hold Shift, then press the letter.', 4],
      ['Which key makes a space between words?', ['The space bar', 'Backspace', 'Ctrl'], 0, 'The space bar is the long key at the bottom.', 5],
      ['Where is the space bar?', ['The long key at the bottom', 'At the top', 'On the mouse'], 0, 'It is the longest key, at the bottom.', 5],
      ['Which key starts a new line?', ['Enter', 'Shift', 'Space bar'], 0, 'Enter starts a new line.', 7],
      ['You typed "hii". How do you fix it?', ['Press Backspace one time', 'Press Enter', 'Close the window'], 0, 'Backspace deletes one letter.', 3],
      ['Which needs a big letter?', ['The first letter of a name, like Sam', 'Every letter', 'No letters'], 0, 'Names start with a big letter: Sam.', 6],
      ['What goes at the end of a sentence?', ['A period (.)', 'A space only', 'Nothing'], 0, 'A sentence ends with a period: I am Sam.', 6],
    ],
  ),
  lesson(
    {
      id: 'bcs-window', n: 4, core: true, family: 'basics', title: 'Open and close a window',
      file: '04_Open_and_close_a_window.mp4',
      purpose: 'Open a program. Hide it, bring it back, make it big, close it.',
      watch: 'Double-click to open. Top right: line hides, box makes big, X closes.',
      tryIt: 'Open Notes. Then close it.',
      remember: 'Line = hide. Box = big. X = close.',
      tryKind: 'window',
    },
    [
      ['Where does a program open?', ['In a window', 'On the keyboard', 'In the mouse'], 0, 'Each program opens in a window.', 0],
      ['How do you open Notes?', ['Double-click Notes', 'Right-click the clock', 'Press Shift'], 0, 'Double-click the icon to open it.', 1],
      ['Where are the three small buttons?', ['Top right corner of the window', 'Bottom of the keyboard', 'On the mouse'], 0, 'Look at the top right corner.', 2],
      ['What does the line (–) do?', ['Hides the window', 'Closes the computer', 'Deletes your work'], 0, 'The line hides the window. It is not closed.', 3],
      ['The window is hidden. How do you bring it back?', ['Click it at the bottom bar', 'Turn off the computer', 'Press Backspace'], 0, 'Click its name on the bottom bar.', 4],
      ['What does the box (□) do?', ['Makes the window big', 'Closes it', 'Hides it'], 0, 'The box makes the window big.', 5],
      ['What does the X do?', ['Closes the window', 'Makes it big', 'Opens Mail'], 0, 'The X closes the window.', 6],
      ['Which button is red?', ['The X', 'The line', 'The box'], 0, 'The X is red. It closes.', 6],
      ['After you close the window, what do you see?', ['The desktop', 'A black screen', 'The keyboard'], 0, 'You are back on the desktop.', 7],
      ['You want to see the desktop but keep Notes open. Click…', ['The line (–)', 'The X', 'Shut down'], 0, 'The line hides it. Your work stays open.', 3],
    ],
  ),
  lesson(
    {
      id: 'bcs-save', n: 5, core: true, family: 'basics', title: 'Save your work',
      file: '05_Save_your_work.mp4',
      purpose: 'Save your work with a name, in a place you can find.',
      watch: 'File → Save. Type a name. Pick Documents. Click Save.',
      tryIt: 'Type a name and click Save.',
      remember: 'Save often. Ctrl + S saves again.',
      tryKind: 'save-name',
    },
    [
      ['Why do you save your work?', ['So you do not lose it', 'To turn off the computer', 'To delete it'], 0, 'Save so your work is still there later.', 0],
      ['Where do you click first to save?', ['File', 'View', 'The clock'], 0, 'Click File at the top.', 1],
      ['In the File menu, what do you click?', ['Save', 'Print', 'Shut down'], 0, 'Click Save.', 2],
      ['What do you type in the box?', ['A name for the file', 'Your password', 'Nothing'], 0, 'Type a short name, like Work plan.', 3],
      ['Which is a good file name?', ['Work plan', 'asdfgh', '123123123'], 0, 'Use a clear name you can find again.', 3],
      ['Where did we save the file?', ['Documents', 'The trash', 'The mouse'], 0, 'Click Documents. Your files live there.', 4],
      ['What do you click to finish?', ['The Save button', 'Cancel', 'The X'], 0, 'Click the Save button.', 5],
      ['How do you know it saved?', ['The name shows at the top', 'The screen goes dark', 'The mouse stops'], 0, 'The name shows at the top of the window.', 6],
      ['Which keys save again fast?', ['Ctrl and S', 'Shift and H', 'Enter and Space'], 0, 'Hold Ctrl, press S.', 7],
      ['When should you save?', ['Often, while you work', 'Never', 'Only after you shut down'], 0, 'Save often. Then you do not lose work.', 7],
    ],
  ),
  lesson(
    {
      id: 'bcs-folder', n: 6, core: false, family: 'files', title: 'Make a folder',
      file: '06_Make_a_folder.mp4',
      purpose: 'Make a folder to keep files together.',
      watch: 'Right-click an empty space → New → Folder. Type a name. Press Enter.',
      tryIt: 'Name the new folder Job Files.',
      remember: 'A clear name helps you find it.',
      tryKind: 'folder',
    },
    [
      ['What does a folder do?', ['Keeps files together', 'Turns on the computer', 'Sends email'], 0, 'A folder keeps your files together.', 0],
      ['Where do you right-click?', ['An empty space', 'The power button', 'The clock'], 0, 'Right-click an empty space on the desktop.', 1],
      ['In the menu, what do you click first?', ['New', 'Refresh', 'View'], 0, 'Click New. A second list opens.', 2],
      ['Then what do you click?', ['Folder', 'Text file', 'Shut down'], 0, 'Click Folder.', 3],
      ['A new folder shows. What do you do?', ['Type a name', 'Pull the plug', 'Close the computer'], 0, 'Type a name right away.', 4],
      ['What name did we type?', ['Job Files', 'New folder', 'Photos'], 0, 'We typed Job Files.', 4],
      ['Which key finishes the name?', ['Enter', 'Shift', 'Backspace'], 0, 'Press Enter to keep the name.', 5],
      ['How do you open the folder?', ['Double-click it', 'Right-click the clock', 'Press Ctrl'], 0, 'Double-click the folder to open it.', 6],
      ['What is inside a new folder?', ['Nothing — it is empty', 'All your email', 'The internet'], 0, 'A new folder is empty. It is ready for files.', 7],
      ['What color is a folder icon?', ['Yellow', 'Red', 'Black'], 0, 'Folders look like a yellow paper folder.', 0],
    ],
  ),
  lesson(
    {
      id: 'bcs-subfolder', n: 7, core: false, family: 'files', title: 'Put a folder inside a folder',
      file: '07_Folder_inside_a_folder.mp4',
      purpose: 'Make a folder inside another folder.',
      watch: 'Open Job Files. Click New folder. Type Week 1. Press Enter.',
      tryIt: 'Make Week 1 inside Job Files.',
      remember: 'The top line shows where you are.',
      tryKind: 'subfolder',
    },
    [
      ['Can a folder go inside a folder?', ['Yes', 'No', 'Only on Friday'], 0, 'Yes. You can put a folder inside a folder.', 0],
      ['How do you open Job Files?', ['Double-click it', 'Right-click Start', 'Press Enter two times'], 0, 'Double-click to open.', 1],
      ['Where is New folder?', ['At the top of the window', 'On the mouse', 'In the trash'], 0, 'New folder is at the top of the window.', 2],
      ['What name did we type?', ['Week 1', 'Job Files', 'Photos'], 0, 'We typed Week 1.', 3],
      ['Which key keeps the name?', ['Enter', 'Backspace', 'Shift'], 0, 'Press Enter.', 4],
      ['How do you open Week 1?', ['Double-click it', 'Click the X', 'Click Shut down'], 0, 'Double-click Week 1 to open it.', 5],
      ['Where can you see where you are?', ['The line at the top', 'The clock', 'The keyboard'], 0, 'The top line shows Job Files, then Week 1.', 6],
      ['Week 1 is inside which folder?', ['Job Files', 'Mail', 'Browser'], 0, 'Week 1 is inside Job Files.', 6],
      ['How do you go back to Job Files?', ['Click Job Files at the top', 'Turn off the computer', 'Press Shift'], 0, 'Click Job Files in the top line.', 7],
      ['Why use folders inside folders?', ['To keep files neat and easy to find', 'To hide the mouse', 'To make the screen big'], 0, 'Folders inside folders keep things neat.', 0],
    ],
  ),
  lesson(
    {
      id: 'bcs-paragraph', n: 8, core: false, family: 'write', title: 'Write a short paragraph',
      file: '08_Write_a_short_paragraph.mp4',
      purpose: 'Type two or three sentences. Fix a mistake.',
      watch: 'Open Notes. Type a sentence. Period. Space. Next sentence.',
      tryIt: 'Type two short sentences.',
      remember: 'Each sentence ends with a period.',
      tryKind: 'paragraph',
    },
    [
      ['Where do we write?', ['In Notes', 'In the trash', 'On the clock'], 0, 'Double-click Notes to write.', 0],
      ['What do you type first?', ['One sentence', 'Your password', 'Nothing'], 0, 'Start with one sentence.', 1],
      ['What goes at the end of a sentence?', ['A period (.)', 'A comma only', 'Nothing'], 0, 'Put a period at the end.', 2],
      ['After the period, what do you press?', ['The space bar', 'Shut down', 'The X'], 0, 'Press space. Then type the next sentence.', 3],
      ['What is a paragraph?', ['A few sentences together', 'One letter', 'A folder'], 0, 'A few sentences make a paragraph.', 4],
      ['You made a mistake. Which key fixes it?', ['Backspace', 'Enter', 'Ctrl'], 0, 'Press Backspace. Then type it again.', 5],
      ['We typed "teem". What should it be?', ['team', 'teeem', 'tem'], 0, 'Backspace, then type team.', 5],
      ['What do you do when you finish?', ['Read it again, then save', 'Close it without saving', 'Pull the plug'], 0, 'Read it again. Then save it.', 6],
      ['How does a new sentence start?', ['With a big letter', 'With a period', 'With a space only'], 0, 'Start a sentence with a big letter: I like…', 3],
      ['Which is a good sentence?', ['I can work on time.', 'i can work on time', 'can I work time'], 0, 'Big letter at the start. Period at the end.', 2],
    ],
  ),
  lesson(
    {
      id: 'bcs-email-send', n: 9, core: false, family: 'email', title: 'Write and send an email',
      file: '09_Write_and_send_email.mp4',
      purpose: 'Write a short email and send it.',
      watch: 'Mail → New email. Fill To, Subject, message. Check. Send.',
      tryIt: 'Fill in the email and press Send.',
      remember: 'Check the address before you send.',
      tryKind: 'email-send',
    },
    [
      ['How do you open Mail?', ['Double-click Mail', 'Right-click the clock', 'Press Enter'], 0, 'Double-click Mail.', 0],
      ['What do you click to start an email?', ['New email', 'Sign out', 'Sent'], 0, 'Click New email.', 1],
      ['What goes in To?', ['The email address', 'Your password', 'The date'], 0, 'To is the person’s email address.', 2],
      ['Which is an email address?', ['ana@work.com', 'Ana Monday', '555-1234'], 0, 'An email address has @ in it.', 2],
      ['What goes in Subject?', ['What the email is about', 'Your password', 'Your address'], 0, 'Subject is a few words: Work today.', 3],
      ['Where do you write your message?', ['In the big box', 'In To', 'In the clock'], 0, 'Write your message in the big box.', 4],
      ['What do you check before you send?', ['The address', 'The mouse', 'The clock'], 0, 'Check the address. Then it goes to the right person.', 5],
      ['Which button sends the email?', ['Send', 'Attach', 'Delete'], 0, 'Click Send.', 6],
      ['Where can you see emails you sent?', ['Sent', 'Inbox', 'Trash'], 0, 'Your email is now in Sent.', 7],
      ['What is a good way to end your message?', ['Your name, like Sam', 'Your password', 'Nothing'], 0, 'End with your name so they know it is you.', 4],
    ],
  ),
  lesson(
    {
      id: 'bcs-email-reply', n: 10, core: false, family: 'email', title: 'Reply to an email',
      file: '10_Reply_to_email.mp4',
      purpose: 'Read an email and answer it.',
      watch: 'Click the email. Click Reply. Type your answer. Send.',
      tryIt: 'Reply to Ana.',
      remember: 'Reply fills in the address for you.',
      tryKind: 'email-reply',
    },
    [
      ['How does a new email look?', ['Dark, bold letters', 'Very small', 'Red'], 0, 'New emails have bold letters.', 0],
      ['How do you read an email?', ['Click it', 'Delete it', 'Turn off the computer'], 0, 'Click the email to read it.', 1],
      ['Which button answers the email?', ['Reply', 'Delete', 'Sign out'], 0, 'Click Reply.', 2],
      ['After Reply, what is filled in for you?', ['The address', 'Your answer', 'Nothing'], 0, 'Reply fills in the address for you.', 3],
      ['Ana asks: Can you work Monday? Which is a good reply?', ['Yes, I can work Monday. Sam', 'ok', 'Who is this?'], 0, 'Answer the question. Add your name.', 4],
      ['Where do you type your answer?', ['In the big box', 'In To', 'In Subject'], 0, 'Type in the big message box.', 4],
      ['What does "Re:" in the subject mean?', ['It is a reply', 'It is a mistake', 'It is spam'], 0, 'Re: means this is a reply.', 3],
      ['What do you click when your answer is ready?', ['Send', 'Delete', 'The X'], 0, 'Click Send.', 5],
      ['Do you need to type the address again?', ['No', 'Yes', 'Only the password'], 0, 'No. Reply already has the address.', 3],
      ['Who gets your reply?', ['The person who sent the email', 'Everyone', 'No one'], 0, 'Your reply goes back to the sender.', 2],
    ],
  ),
  lesson(
    {
      id: 'bcs-attach', n: 11, core: false, family: 'email', title: 'Attach a file',
      file: '11_Attach_a_file.mp4',
      purpose: 'Send a file with an email.',
      watch: 'Click Attach. Pick your file. Click Open. Send.',
      tryIt: 'Attach Work plan and send.',
      remember: 'Attach means add a file.',
      tryKind: 'attach-save',
    },
    [
      ['Can you send a file with an email?', ['Yes', 'No', 'Only photos of food'], 0, 'Yes. You can add a file to an email.', 0],
      ['What does Attach mean?', ['Add a file', 'Delete the email', 'Close Mail'], 0, 'Attach means add a file.', 1],
      ['Which button adds a file?', ['Attach', 'Send', 'Reply'], 0, 'Click Attach.', 1],
      ['What do you click in the list?', ['Your file, Work plan', 'Cancel', 'The clock'], 0, 'Find your file. Click it.', 2],
      ['After you pick the file, what do you click?', ['Open', 'Cancel', 'Delete'], 0, 'Click Open.', 3],
      ['How do you know the file is in the email?', ['You see its name in the email', 'The screen goes dark', 'The mouse beeps'], 0, 'You see the file name in your email.', 4],
      ['What do you click to send it?', ['Send', 'Attach again', 'The X'], 0, 'Click Send.', 5],
      ['Why save a file with a clear name?', ['So you can find it to attach', 'So it is secret', 'It does not matter'], 0, 'A clear name helps you find the file.', 2],
      ['Where was the Work plan file?', ['Documents', 'The trash', 'Sent'], 0, 'It was in Documents — where we saved it.', 2],
      ['What should you write with the file?', ['A short message', 'Your password', 'Nothing at all'], 0, 'Write a short message so they know what it is.', 0],
    ],
  ),
  lesson(
    {
      id: 'bcs-safe', n: 12, core: false, family: 'online', title: 'Stay safe online',
      file: '12_Stay_safe_online.mp4',
      purpose: 'Keep your password secret. Spot a bad email.',
      watch: 'Never share your password. Do not click strange links. Delete them. Sign out.',
      tryIt: 'Pick the safe choice.',
      remember: 'Not sure? Ask a staff member.',
      tryKind: 'safe',
    },
    [
      ['What is your password?', ['A secret key', 'Your name', 'Your email address'], 0, 'Your password is a secret key.', 0],
      ['Who can know your password?', ['Only you', 'Everyone', 'Anyone who asks'], 0, 'Do not tell anyone your password.', 1],
      ['An email asks for your password. Is it safe?', ['No', 'Yes', 'Only if it says prize'], 0, 'Real companies do not ask for your password by email.', 2],
      ['An email says you won a prize. What is it?', ['Probably a trick', 'Free money', 'A gift from your boss'], 0, 'Prize emails are often tricks.', 2],
      ['Should you click a strange link?', ['No', 'Yes', 'Click it two times'], 0, 'Do not click the link.', 3],
      ['What do you do with a bad email?', ['Delete it', 'Reply with your password', 'Send it to friends'], 0, 'Click Delete.', 4],
      ['What do you click when you finish?', ['Sign out', 'Nothing', 'Reply'], 0, 'Click Sign out when you finish.', 5],
      ['Why sign out on a shared computer?', ['So no one else uses your account', 'To make it faster', 'To get email'], 0, 'Sign out so the next person cannot use your account.', 5],
      ['You are not sure an email is safe. What do you do?', ['Ask a staff member', 'Click the link', 'Give your password'], 0, 'Not sure? Ask a staff member.', 6],
      ['Which password is better?', ['Sun!Bus7Tree', '1234', 'password'], 0, 'Long, with letters, numbers and a sign.', 0],
    ],
  ),
  lesson(
    {
      id: 'bcs-search', n: 13, core: false, family: 'online', title: 'Search the web',
      file: '13_Search_the_web.mp4',
      purpose: 'Find information on the internet.',
      watch: 'Open Browser. Click the search box. Type. Press Enter. Click a result.',
      tryIt: 'Search for bus times.',
      remember: 'Back arrow takes you back.',
      tryKind: 'search',
    },
    [
      ['Which program opens the web?', ['Browser', 'Notes', 'Mail'], 0, 'The Browser opens web pages.', 0],
      ['Where do you click first?', ['The search box', 'The clock', 'Start'], 0, 'Click the search box.', 1],
      ['What do you type?', ['What you want to find', 'Your password', 'Nothing'], 0, 'Type what you want to find: bus times.', 2],
      ['Which words are a good search?', ['bus times', 'hello how are you today', 'aaaa'], 0, 'Use a few clear words.', 2],
      ['After you type, which key do you press?', ['Enter', 'Shift', 'Backspace'], 0, 'Press Enter to search.', 3],
      ['What shows after you press Enter?', ['A list of results', 'A black screen', 'Your email'], 0, 'A list of results shows.', 4],
      ['How do you open a result?', ['Click it', 'Right-click the clock', 'Close the browser'], 0, 'Click a result to open it.', 5],
      ['Results are often blue and…', ['Underlined', 'Red', 'Hidden'], 0, 'Links are blue and underlined.', 4],
      ['How do you go back to the results?', ['Click the back arrow', 'Shut down', 'Press Shift'], 0, 'Click the back arrow (←).', 6],
      ['Where is the back arrow?', ['Top left of the browser', 'On the mouse', 'In Mail'], 0, 'The back arrow is at the top left.', 6],
    ],
  ),
]

export const BASIC_COMPUTER_CORE_COUNT = BASIC_COMPUTER_SKILLS_VIDEOS.filter((l) => l.core).length

/** Replay window for a question: the narration line it teaches, with a short lead-in. */
export function computerQuestionReplay(lesson: BasicComputerLesson, q: ComputerQuestion) {
  const beats = BASIC_COMPUTER_TIMING[lesson.id]?.beats
  const b = beats?.[q.beat]
  if (!b) return null
  return { start: Math.max(0, b.start - 0.4), end: b.end + 0.9, text: b.text }
}

export function computerSkillsVideoUrl(file: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}media/basic-computer-skills/${file}`
}
