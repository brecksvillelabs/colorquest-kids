/**
 * Reading content for the Reading Garden.
 *
 * Everything an author touches lives here: the shelves, the stories, the
 * letter sounds and the word meanings. Adding a story means adding one
 * object to READING_STORIES plus any new words to WORD_MEANINGS; the
 * shelf, the progress counter and the end-of-story check all follow from
 * the data. reading-data.test.ts fails if a story uses a word nothing
 * defines, so the content cannot drift out of step with itself.
 */

export type ReadingBand = "seedling" | "sprout" | "sapling" | "bloomer";

export type ReadingStory = {
  id: string;
  title: string;
  emoji: string;
  bg: string;
  band: ReadingBand;
  /** Words the end-of-story check is built from. */
  featured: string[];
  /** One picture per page for longer stories; falls back to emoji. */
  pageEmoji?: string[];
  pages: string[];
};

export type PhonicsLetter = {
  letter: string;
  sound: string;
  /** Spellings that make a device voice produce roughly the right sound. */
  nameSay: string;
  soundSay: string;
  keyword: string;
  emoji: string;
  examples: string[];
  /** Shown only where a letter misbehaves (soft c, silent y, and so on). */
  note?: string;
};

export type ReadingBandMeta = {
  name: string;
  emoji: string;
  ages: string;
  blurb: string;
  /** Seedlings finish straight into a flower: no quiz for a three-year-old. */
  check: boolean;
  checkQuestions?: number;
};

export const READING_BAND_ORDER: ReadingBand[] = ["seedling", "sprout", "sapling", "bloomer"];

export const READING_BANDS: Record<ReadingBand, ReadingBandMeta> = {
  seedling: { name: "Seedlings", emoji: "🌰", ages: "3–4", blurb: "One or two words a page, and a big picture to talk about.", check: false },
  sprout: { name: "Sprouts", emoji: "🌱", ages: "4–5", blurb: "Short sentences built from words you already know.", check: true },
  sapling: { name: "Saplings", emoji: "🌿", ages: "5–6", blurb: "Longer sentences with a few new words in them.", check: true },
  bloomer: { name: "Bloomers", emoji: "🌻", ages: "6–7", blurb: "Longer stories with a real turn in them, and words worth keeping.", check: true, checkQuestions: 3 },
};

/**
 * Words a beginning reader is expected to know on sight. They still get a
 * meaning when tapped, but they do not count as "new words met" — otherwise
 * the counter fills up with "the" and "a" and stops meaning anything.
 */
export const SIGHT_WORDS = new Set<string>([
  "a", "the", "is", "it", "to", "in", "on", "and", "we", "i",
  "me", "my", "you", "go", "see", "can", "at", "up", "has", "this",
  "all", "now", "of", "for", "was", "are", "he", "she", "like", "likes",
  "look", "here", "had", "with", "big", "little", "play", "day", "fun", "out",
  "so", "no", "yes",
]);

export const PHONICS: PhonicsLetter[] = [
  { letter: "a", sound: "/a/", nameSay: "ay", soundSay: "ahh", keyword: "apple", emoji: "🍎", examples: ["at", "cat", "man"] },
  { letter: "b", sound: "/b/", nameSay: "bee", soundSay: "buh", keyword: "ball", emoji: "⚽", examples: ["big", "bus", "tub"] },
  { letter: "c", sound: "/k/", nameSay: "see", soundSay: "kuh", keyword: "cat", emoji: "🐱", examples: ["cup", "car", "can"], note: "Before e, i or y, c usually says /s/ — as in city." },
  { letter: "d", sound: "/d/", nameSay: "dee", soundSay: "duh", keyword: "dog", emoji: "🐶", examples: ["dig", "mud", "red"] },
  { letter: "e", sound: "/e/", nameSay: "ee", soundSay: "ehh", keyword: "egg", emoji: "🥚", examples: ["bed", "ten", "pen"] },
  { letter: "f", sound: "/f/", nameSay: "ef", soundSay: "fff", keyword: "fish", emoji: "🐟", examples: ["fan", "leaf", "fun"] },
  { letter: "g", sound: "/g/", nameSay: "jee", soundSay: "guh", keyword: "goat", emoji: "🐐", examples: ["go", "bag", "gum"], note: "Before e, i or y, g often says /j/ — as in giant." },
  { letter: "h", sound: "/h/", nameSay: "aitch", soundSay: "huh", keyword: "hat", emoji: "🎩", examples: ["hop", "hen", "hand"] },
  { letter: "i", sound: "/i/", nameSay: "eye", soundSay: "ihh", keyword: "igloo", emoji: "🧊", examples: ["in", "sit", "pig"] },
  { letter: "j", sound: "/j/", nameSay: "jay", soundSay: "juh", keyword: "jam", emoji: "🍯", examples: ["jump", "jet", "jug"] },
  { letter: "k", sound: "/k/", nameSay: "kay", soundSay: "kuh", keyword: "kite", emoji: "🪁", examples: ["key", "milk", "kid"] },
  { letter: "l", sound: "/l/", nameSay: "el", soundSay: "lll", keyword: "leaf", emoji: "🍃", examples: ["leg", "ball", "lap"] },
  { letter: "m", sound: "/m/", nameSay: "em", soundSay: "mmm", keyword: "moon", emoji: "🌙", examples: ["map", "him", "mom"] },
  { letter: "n", sound: "/n/", nameSay: "en", soundSay: "nnn", keyword: "nest", emoji: "🪺", examples: ["net", "sun", "nap"] },
  { letter: "o", sound: "/o/", nameSay: "oh", soundSay: "awh", keyword: "octopus", emoji: "🐙", examples: ["on", "hot", "dog"] },
  { letter: "p", sound: "/p/", nameSay: "pee", soundSay: "puh", keyword: "pig", emoji: "🐷", examples: ["pen", "cup", "pot"] },
  { letter: "q", sound: "/kw/", nameSay: "cue", soundSay: "kwuh", keyword: "queen", emoji: "👑", examples: ["quilt", "quick", "quack"], note: "q nearly always travels with u." },
  { letter: "r", sound: "/r/", nameSay: "ar", soundSay: "rrr", keyword: "rain", emoji: "🌧️", examples: ["run", "red", "rug"] },
  { letter: "s", sound: "/s/", nameSay: "ess", soundSay: "sss", keyword: "sun", emoji: "☀️", examples: ["sit", "bus", "sad"] },
  { letter: "t", sound: "/t/", nameSay: "tee", soundSay: "tuh", keyword: "tree", emoji: "🌳", examples: ["top", "cat", "ten"] },
  { letter: "u", sound: "/u/", nameSay: "you", soundSay: "uhh", keyword: "umbrella", emoji: "☂️", examples: ["up", "bug", "sun"] },
  { letter: "v", sound: "/v/", nameSay: "vee", soundSay: "vvv", keyword: "van", emoji: "🚐", examples: ["vet", "five", "vase"] },
  { letter: "w", sound: "/w/", nameSay: "double you", soundSay: "wuh", keyword: "web", emoji: "🕸️", examples: ["win", "wet", "wag"] },
  { letter: "x", sound: "/ks/", nameSay: "ex", soundSay: "kss", keyword: "fox", emoji: "🦊", examples: ["box", "six", "mix"], note: "x almost always comes at the end of a word." },
  { letter: "y", sound: "/y/", nameSay: "why", soundSay: "yuh", keyword: "yarn", emoji: "🧶", examples: ["yes", "yell", "yam"], note: "At the end of a word, y often sounds like /ee/ — as in happy." },
  { letter: "z", sound: "/z/", nameSay: "zee", soundSay: "zzz", keyword: "zebra", emoji: "🦓", examples: ["zip", "buzz", "zoo"] },
];

export const READING_STORIES: ReadingStory[] = [
  /* ---- Seedlings (3–4) ---- */
  {
    id: "colors",
    title: "Colors All Around",
    emoji: "🎨",
    bg: "#F3E0EE",
    band: "seedling",
    featured: ["red", "green", "blue"],
    pages: [
      "A red ball.",
      "A green leaf.",
      "A blue sky.",
      "So many colors!",
    ],
  },
  {
    id: "counting",
    title: "One, Two, Three",
    emoji: "🔢",
    bg: "#E0EAF5",
    band: "seedling",
    featured: ["one", "two", "three"],
    pages: [
      "One cat.",
      "Two ducks.",
      "Three little seeds.",
      "Look at them all!",
    ],
  },
  {
    id: "animal-sounds",
    title: "Who Says Moo?",
    emoji: "🐄",
    bg: "#EDE6D6",
    band: "seedling",
    featured: ["cow", "moo", "quack"],
    pages: [
      "The cow says moo.",
      "The duck says quack.",
      "The cat says meow.",
      "What do you say?",
    ],
  },
  {
    id: "shapes",
    title: "Round and Square",
    emoji: "🔷",
    bg: "#E3E8F2",
    band: "seedling",
    featured: ["round", "square", "line"],
    pages: [
      "A round ball.",
      "A square box.",
      "A long line.",
      "Shapes all around!",
    ],
  },
  {
    id: "weather-look",
    title: "Look Up",
    emoji: "☁️",
    bg: "#DCE9F0",
    band: "seedling",
    featured: ["cloud", "star", "gray"],
    pages: [
      "A big sun.",
      "A gray cloud.",
      "One bright star.",
      "Look up!",
    ],
  },
  /* ---- Sprouts (4–5) ---- */
  {
    id: "sam-ball",
    title: "Sam and the Big Red Ball",
    emoji: "🔴",
    bg: "#F5D9CE",
    band: "sprout",
    featured: ["ball", "kick", "red"],
    pages: [
      "Sam has a big red ball.",
      "Sam can kick the ball.",
      "The ball goes up, up, up!",
      "Sam and the ball play all day.",
    ],
  },
  {
    id: "seed",
    title: "The Little Seed",
    emoji: "🌱",
    bg: "#DCEAD3",
    band: "sprout",
    featured: ["seed", "dirt", "grow"],
    pages: [
      "Here is a little seed.",
      "Sam puts the seed in the dirt.",
      "The sun and rain help it grow.",
      "Look! A big flower!",
    ],
  },
  {
    id: "max-dog",
    title: "Max the Dog",
    emoji: "🐶",
    bg: "#E6DCC7",
    band: "sprout",
    featured: ["dog", "fast", "eat"],
    pages: [
      "This is Max. Max is a dog.",
      "Max can run fast.",
      "Max likes to play with a ball.",
      "Max runs home to eat.",
    ],
  },
  {
    id: "bath",
    title: "Bath Time",
    emoji: "🛁",
    bg: "#D6E8EC",
    band: "sprout",
    featured: ["tub", "splashes", "clean"],
    pages: [
      "The tub is full of warm water.",
      "Sam splashes with a duck.",
      "Bubbles go up and up.",
      "Now Sam is warm and clean.",
    ],
  },
  {
    id: "lost-cat",
    title: "Where Is Mimi?",
    emoji: "🐱",
    bg: "#F0E4D8",
    band: "sprout",
    featured: ["mimi", "box", "asleep"],
    pages: [
      "Mimi the cat is not here.",
      "Is she under the bed?",
      "Is she in the big box?",
      "Mimi is asleep on my hat!",
    ],
  },
  /* ---- Saplings (5–6) ---- */
  {
    id: "pond",
    title: "A Day at the Pond",
    emoji: "🦆",
    bg: "#C8E0E6",
    band: "sapling",
    featured: ["pond", "duck", "swims"],
    pages: [
      "We go to the pond.",
      "I see a duck on the pond.",
      "The duck swims to me.",
      "We had fun at the pond!",
    ],
  },
  {
    id: "rainbow",
    title: "The Sun and the Rain",
    emoji: "🌈",
    bg: "#EADFF5",
    band: "sapling",
    featured: ["rainbow", "surprise", "sky"],
    pages: [
      "The sun is up in the sky.",
      "Now the rain comes down.",
      "The sun and rain make a big surprise.",
      "Look! A rainbow in the sky!",
    ],
  },
  {
    id: "shoes",
    title: "Where Are My Shoes?",
    emoji: "👟",
    bg: "#E6E0F0",
    band: "sapling",
    featured: ["shoes", "under", "find"],
    pages: [
      "Where are my shoes?",
      "Not on the mat.",
      "Not under the bed.",
      "I find them by the door!",
    ],
  },
  {
    id: "snow",
    title: "The First Snow",
    emoji: "❄️",
    bg: "#E4EDF5",
    band: "sapling",
    featured: ["snow", "snowman", "carrot"],
    pages: [
      "Snow falls on the yard all night.",
      "In the morning the world is white.",
      "We make a fat snowman with a hat.",
      "His nose is a carrot from the kitchen.",
    ],
  },
  {
    id: "bike",
    title: "Two Wheels",
    emoji: "🚲",
    bg: "#EFE6D2",
    band: "sapling",
    featured: ["bike", "pedal", "fall"],
    pages: [
      "Dad holds the back of my bike.",
      "I pedal down the sidewalk, fast.",
      "Then I hear him laughing far behind me.",
      "He let go, and I did not fall.",
    ],
  },
  /* ---- Bloomers (6–7) ---- */
  {
    id: "market",
    title: "Ravi Goes to the Market",
    emoji: "🧺",
    bg: "#F6E3C5",
    band: "bloomer",
    featured: ["market", "basket", "ripe", "gently", "extra"],
    pageEmoji: ["🧺", "🚲", "🍋", "🥭", "🤲", "🪙", "😢", "🤝", "🏠", "🔪"],
    pages: [
      "Mom gives Ravi a basket and a list. She says he can pick the mangoes himself.",
      "The market is loud with voices and bicycle bells. Ravi holds the basket with both hands.",
      "One stall is stacked with fruit in careful pyramids. The seller waves him closer.",
      "Some mangoes are green and hard. Others are soft and heavy with a sweet smell.",
      "Ravi presses one gently, the way Mom taught him. This one is ripe.",
      "He chooses four and counts his coins twice. The seller drops in a fifth for free.",
      "On the way home a boy is crying over a dropped orange. Ravi stops walking.",
      "He hands the boy the extra mango. The crying stops in the middle of a breath.",
      "At home Mom counts four mangoes instead of five. Ravi tells her what happened.",
      "She does not say anything for a moment. Then she cuts the biggest one in half and gives him the bigger side.",
    ],
  },
  {
    id: "library",
    title: "The Library Card",
    emoji: "📚",
    bg: "#DFE7DA",
    band: "bloomer",
    featured: ["library", "librarian", "borrow", "shelf", "ocean"],
    pageEmoji: ["🪪", "🤫", "👩‍🏫", "🐋", "📖", "🖐️", "💳", "🌇", "🎵", "🔁"],
    pages: [
      "Maya has never had a library card of her own. Today she will get one.",
      "The library is quiet and cool. Rows of shelves reach up above her head.",
      "A librarian named Ada shows her how to find a book. Every shelf has a number.",
      "Maya wants a book about whales. Ada points to the shelf marked five hundred.",
      "The book is heavy and full of pictures. A blue whale can be longer than three buses.",
      "Maya carries it to the desk. Her hands feel a little shaky.",
      "The librarian scans the card and smiles. The book is hers to borrow for two whole weeks.",
      "At home Maya reads on the porch until the light turns orange.",
      "She learns that whales sing to each other across the dark ocean.",
      "When the two weeks end, Maya brings the book back. She already knows which one she wants next.",
    ],
  },
  {
    id: "kitchen",
    title: "The Warm Kitchen",
    emoji: "🍲",
    bg: "#F6DFD2",
    band: "bloomer",
    featured: ["kitchen", "spice", "patient", "recipe", "careful"],
    pageEmoji: ["🌧️", "🍚", "🧅", "♨️", "🌕", "👃", "⏳", "🍽️", "😊", "📓"],
    pages: [
      "Rain taps the window all afternoon. Inside, the kitchen is warm and bright.",
      "Mom is making rice and beans for eight people. Ravi asks if he can help.",
      "She hands him a bowl of onions. His eyes water while he peels them.",
      "The pot begins to steam. Mom shows him how to stir slowly so nothing burns.",
      "Ravi adds a spoon of turmeric. The whole pot turns the color of the sun.",
      "The spices smell sharp and sweet at the same time. He wants to taste it right away.",
      "Wait, says Mom. Good food is patient food.",
      "Ravi sets the table while the rice finishes. He counts eight plates twice to be sure.",
      "When everyone sits down, his cousin asks who cooked. Ravi tries not to smile too big.",
      "Later he writes the recipe in a notebook. Next time, he will make it alone.",
    ],
  },
  {
    id: "empty-lot",
    title: "The Empty Lot",
    emoji: "🌻",
    bg: "#E7EAD5",
    band: "bloomer",
    featured: ["lot", "gravel", "compost", "forgive", "beginners"],
    pageEmoji: ["🧱", "💬", "🤝", "🧤", "🪱", "🫘", "😔", "🌱", "🏃", "🌿"],
    pages: [
      "There is a lot at the end of our street where nothing grows. It is all gravel and broken glass.",
      "Nina says we could plant something there. Her brother says nobody will let us.",
      "We ask the woman who owns the lot. She looks at us a long time and then says yes.",
      "It takes four Saturdays to clear the glass. Our gloves wear through at the thumbs.",
      "The dirt underneath is hard and gray. Nina's mother brings us two bags of compost.",
      "We plant beans, because beans forgive beginners. We water them every evening after dinner.",
      "For eleven days nothing happens. Nina stops coming.",
      "On the twelfth day there are green loops pushing up through the soil.",
      "I run to Nina's house and pull her outside without explaining. She sees them from the sidewalk.",
      "By August the beans reach over our heads. The woman who owns the lot asks if she may have some.",
    ],
  },
  {
    id: "new-kid",
    title: "The New Kid",
    emoji: "⚽",
    bg: "#E6E1F0",
    band: "bloomer",
    featured: ["language", "recess", "question", "slowly", "goal"],
    pageEmoji: ["🚪", "🍎", "🗺️", "🙂", "✏️", "🥅", "🏃", "👥", "💬", "📄"],
    pages: [
      "A new boy started at our school on Tuesday. His name is Tomas and he does not speak English yet.",
      "At lunch he sits at the end of the table by himself. He eats without looking up.",
      "Our teacher says he moved here from far away. She says learning a language takes longer than people think.",
      "I try saying hello. Tomas smiles but does not answer.",
      "On Thursday I draw a soccer ball on a piece of paper. I slide it across the table to him.",
      "He looks at it for a moment. Then he draws a goal and points at the window.",
      "At recess we play without saying anything at all. He is faster than everyone.",
      "By Friday four of us are playing. Nobody needs the paper anymore.",
      "In November Tomas asks me a whole question out loud. It comes out slowly and he gets it right.",
      "Now he talks all the time. I still have the paper with the ball on it.",
    ],
  },
];

/** Plain-language meanings, written for the child who taps the word. */
export const WORD_MEANINGS: Record<string, string> = {
  sam: "A name for a boy or girl in our stories.",
  has: "To have or own something.",
  a: "A little word we use before naming one thing, like 'a ball'.",
  big: "Large in size — the opposite of little.",
  red: "A color, like the color of an apple.",
  ball: "A round toy you can throw, kick, or bounce.",
  can: "To be able to do something.",
  kick: "To hit something with your foot.",
  the: "A little word we use before naming something specific.",
  goes: "Moves from one place to another.",
  up: "Moving toward the sky — the opposite of down.",
  and: "A word that joins two things together.",
  play: "To have fun doing something.",
  all: "Every one of something, the whole amount.",
  day: "The time when the sun is out.",
  here: "In this place.",
  is: "A word that tells what something is right now.",
  little: "Small in size — the opposite of big.",
  seed: "A tiny part of a plant that can grow into a new plant.",
  puts: "Places something somewhere.",
  in: "Inside of something.",
  dirt: "Soil — the ground that plants grow in.",
  sun: "The bright star that lights up our sky in the day.",
  rain: "Water that falls from clouds.",
  help: "To make something easier for someone else.",
  it: "A word we use instead of naming a thing again.",
  grow: "To get bigger over time.",
  look: "To use your eyes to see something.",
  flower: "The colorful part of a plant that blooms.",
  this: "A word that points to something close by.",
  max: "A name for a dog in our stories.",
  dog: "A furry animal that loves to play and be a pet.",
  run: "To move fast using your legs.",
  fast: "Moving quickly.",
  likes: "Enjoys something.",
  to: "A word that shows direction, like 'go to school'.",
  with: "Together, along with someone or something.",
  runs: "Moves fast on foot, happening right now.",
  home: "The place where you live.",
  eat: "To put food in your mouth and swallow it.",
  we: "A word for you and me together.",
  go: "To move from one place to another.",
  pond: "A small area of water, smaller than a lake.",
  i: "A word you use to talk about yourself.",
  see: "To notice something with your eyes.",
  duck: "A bird that swims and says 'quack'.",
  on: "Touching the top of something.",
  swims: "Moves through water using arms, legs, or fins.",
  me: "A word you use to talk about yourself.",
  had: "Owned or experienced something before.",
  fun: "Something that makes you happy and makes you smile.",
  at: "A word that tells where something is.",
  sky: "The space above us where clouds and the sun are.",
  now: "At this very moment.",
  comes: "Moves toward here.",
  down: "Moving toward the ground — the opposite of up.",
  make: "To create or cause something to happen.",
  surprise: "Something you didn't expect.",
  rainbow: "The colorful arc that appears in the sky after rain.",
  ravi: "A name for a boy in our stories.",
  walks: "Moves along on your feet, step by step.",
  market: "A place where people buy and sell food and things.",
  mom: "The mother of a family.",
  beans: "Seeds that are cooked and eaten.",
  of: "A little word that joins things, like 'full of noise'.",
  full: "Holding as much as it can hold.",
  noise: "Sound, especially loud sound.",
  color: "What we see when light bounces off something — red, blue, green.",
  must: "Has to do something.",
  choose: "To pick one thing out of many.",
  one: "A single thing.",
  ripe: "Ready to eat — soft and sweet, not hard and green.",
  mango: "A sweet orange fruit that grows on a tree.",
  he: "A word for a boy or man you already named.",
  basket: "A container woven from strips, used to carry things.",
  smiles: "Turns the mouth up because of feeling happy.",
  green: "A color, like the color of grass and leaves.",
  leaf: "The flat green part that grows on a plant or tree.",
  blue: "A color, like the color of the sky on a clear day.",
  so: "A word we use to mean 'very' — 'so many'.",
  many: "A large number of something.",
  colors: "More than one color, like red, blue and green together.",
  two: "The number after one.",
  three: "The number after two.",
  ducks: "More than one duck.",
  seeds: "More than one seed.",
  them: "A word we use instead of naming several things again.",
  cow: "A big farm animal that gives milk and says moo.",
  says: "Speaks or makes a sound.",
  moo: "The deep sound a cow makes.",
  quack: "The sound a duck makes.",
  meow: "The sound a cat makes.",
  cat: "A soft furry animal that purrs and says meow.",
  what: "A word we use to ask about something.",
  do: "To carry out an action.",
  you: "A word for the person being spoken to.",
  say: "To speak words out loud.",
  where: "A word we use to ask about a place.",
  are: "A word that tells what things are right now.",
  my: "Belonging to me.",
  shoes: "The things you put on your feet before going out.",
  not: "A word that means something is untrue or missing.",
  mat: "A flat piece of cloth or rubber laid on the floor.",
  under: "Below something else.",
  bed: "The furniture you sleep on.",
  find: "To discover where something is.",
  by: "Next to or beside.",
  door: "The part of a room you open to go in or out.",
  library: "A place full of books you can read and borrow.",
  quiet: "Making little or no noise.",
  cool: "A little bit cold, in a pleasant way.",
  every: "Each one of a group, with none left out.",
  shelf: "A flat board on a wall or in a case where things are kept.",
  books: "More than one book.",
  book: "Pages joined together with a story or facts inside.",
  maya: "A name for a girl in our stories.",
  picks: "Chooses and takes one thing.",
  about: "On the subject of something.",
  whales: "The largest animals in the ocean.",
  she: "A word for a girl or woman you already named.",
  borrow: "To take something for a while and give it back later.",
  bring: "To carry something to a place.",
  back: "To the place it came from.",
  kitchen: "The room where food is cooked.",
  smells: "Gives off a scent your nose can notice.",
  warm: "A little bit hot, in a pleasant way.",
  spice: "A seed or powder that gives food a strong taste.",
  steam: "The hot white cloud that rises from boiling water.",
  rises: "Moves upward.",
  from: "Starting at a place or thing.",
  tall: "Reaching high up.",
  pot: "A deep round dish for cooking on a stove.",
  stirs: "Moves food around with a spoon.",
  slow: "Not fast, taking plenty of time.",
  careful: "Paying close attention so nothing goes wrong.",
  everyone: "Every person in a group.",
  when: "At the time that something happens.",
  rice: "Small white grains cooked and eaten in many countries.",
  done: "Finished, or ready to eat.",
  above: "Higher up than something else.",
  across: "From one side to the other.",
  ada: "A name for a woman in our stories.",
  adds: "Puts something in with the rest.",
  afternoon: "The part of the day between noon and evening.",
  alone: "By yourself, with nobody else.",
  already: "Before now, sooner than expected.",
  anything: "A thing of any kind.",
  asks: "Says a question to someone.",
  away: "To or at another place.",
  be: "To exist or to happen.",
  begins: "Starts.",
  bells: "Small metal cups that ring when they are struck.",
  bicycle: "A machine with two wheels that you pedal.",
  bigger: "Larger than the other one.",
  biggest: "The largest of them all.",
  both: "The two of them together.",
  bowl: "A round deep dish for food.",
  boy: "A young male child.",
  breath: "One time of taking air into your body.",
  bright: "Full of light.",
  brings: "Carries something to a place.",
  burns: "Gets damaged by heat or fire.",
  buses: "More than one bus.",
  card: "A small flat piece of stiff paper or plastic.",
  carries: "Holds something and moves it along.",
  chooses: "Picks one out of several.",
  closer: "Nearer than before.",
  coins: "Round pieces of metal used as money.",
  cooked: "Made food ready by heating it.",
  counts: "Says numbers in order to find how many.",
  cousin: "The child of your aunt or uncle.",
  crying: "Letting tears fall because of a strong feeling.",
  cuts: "Divides something with a knife.",
  dark: "With little or no light.",
  desk: "A table you work or write at.",
  does: "Carries out an action.",
  dropped: "Let something fall.",
  drops: "Lets something fall.",
  each: "Every one, taken one at a time.",
  eight: "The number after seven.",
  end: "The last part, when something stops.",
  extra: "More than what was needed.",
  eyes: "The parts of your face that you see with.",
  feel: "To notice something through your body or your heart.",
  fifth: "The one that comes after the fourth.",
  finishes: "Comes to the end.",
  five: "The number after four.",
  food: "What people and animals eat.",
  for: "A word showing who or what something is meant for.",
  four: "The number after three.",
  free: "Costing no money.",
  fruit: "The sweet part of a plant that holds its seeds.",
  gently: "Softly and carefully, without force.",
  get: "To receive or take hold of something.",
  gives: "Hands something to someone to keep.",
  good: "Of a kind people want — the opposite of bad.",
  half: "One of two equal parts.",
  hands: "Gives something to someone, or the parts at the ends of your arms.",
  happened: "Took place.",
  hard: "Firm and solid, or difficult.",
  head: "The top part of your body, above your neck.",
  heavy: "Weighing a lot.",
  her: "Belonging to a girl or woman.",
  hers: "Belonging to her.",
  him: "A word for a boy or man you already named.",
  himself: "His own self.",
  his: "Belonging to a boy or man.",
  holds: "Keeps something in the hands.",
  how: "In what way.",
  hundred: "Ten tens — the number 100.",
  if: "A word for something that might happen.",
  inside: "Within something, not outdoors.",
  instead: "In place of something else.",
  knows: "Has something firmly in mind.",
  later: "After some time has passed.",
  learns: "Comes to know something new.",
  librarian: "A person who looks after a library and helps you find books.",
  light: "What lets you see — from the sun or a lamp.",
  list: "Words written one under another to remember them.",
  longer: "Greater in length or time.",
  loud: "Making a lot of noise.",
  making: "Creating or preparing something.",
  mangoes: "More than one mango.",
  marked: "Having a sign or number written on it.",
  middle: "The point halfway between the ends.",
  moment: "A very short piece of time.",
  named: "Given a name, or called by that name.",
  never: "At no time, not once.",
  next: "Coming right after this one.",
  notebook: "A book of empty pages for writing in.",
  nothing: "Not a single thing.",
  number: "A word or sign that tells how many.",
  ocean: "A very large body of salt water.",
  onions: "Round vegetables with layers that can sting your eyes.",
  orange: "A color between red and yellow, or the round fruit.",
  other: "The second one of two.",
  others: "The rest of a group.",
  over: "Above, or about something.",
  own: "Belonging to that person and nobody else.",
  patient: "Willing to wait without getting upset.",
  peels: "Takes the skin off a fruit or vegetable.",
  people: "More than one person.",
  pick: "To choose and take.",
  pictures: "Drawings or photographs that show something.",
  plates: "Flat round dishes to eat from.",
  points: "Holds a finger out toward something.",
  porch: "A covered floor at the front of a house.",
  presses: "Pushes on something.",
  pyramids: "Piles with a wide bottom and a pointed top.",
  reach: "To stretch far enough to touch something.",
  reads: "Looks at words and understands them.",
  recipe: "Written directions for cooking a dish.",
  right: "Correct, or immediately.",
  rows: "Lines of things placed side by side.",
  sambar: "A South Indian stew of lentils, vegetables and spices.",
  same: "Not different in any way.",
  scans: "Passes something over a machine that reads it.",
  seller: "A person whose work is selling things.",
  sets: "Places things where they belong.",
  shaky: "Trembling a little.",
  sharp: "Having a strong taste or a fine cutting edge.",
  shelves: "More than one shelf.",
  shows: "Lets someone see or understand something.",
  side: "One of the parts of a thing, or one half.",
  sing: "To make music with your voice.",
  sits: "Rests on a seat.",
  slowly: "Taking plenty of time.",
  smell: "The scent of something, or to notice it with your nose.",
  smile: "The happy shape your mouth makes.",
  soft: "Easy to press, not hard.",
  some: "An amount that is not all of it.",
  spices: "More than one spice.",
  spoon: "A tool with a small bowl for eating and stirring.",
  stacked: "Piled one on top of another.",
  stall: "A small open shop at a market.",
  stir: "To move food around with a spoon.",
  stops: "Comes to an end, or stands still.",
  sure: "Certain, with no doubt.",
  sweet: "Tasting like sugar or honey.",
  table: "Furniture with a flat top and legs.",
  taps: "Hits softly again and again.",
  taste: "To try a little food with your tongue.",
  taught: "Showed someone how to do something.",
  tells: "Says something to someone.",
  than: "A word used when comparing two things.",
  that: "A word that points to something further away.",
  then: "After that.",
  time: "What clocks measure, or one moment among many.",
  today: "This very day.",
  too: "Also, or more than enough.",
  tries: "Makes an effort to do something.",
  turmeric: "A bright yellow spice made from a root.",
  turns: "Changes into something, or moves around.",
  twice: "Two times.",
  until: "Up to the moment when.",
  voices: "The sounds people make when they speak.",
  wait: "To stay until something happens.",
  walking: "Moving along on your feet.",
  wants: "Wishes to have something.",
  water: "The clear liquid we drink, or to fill with tears.",
  waves: "Moves a hand to say hello or come here.",
  way: "A path, or how something is done.",
  weeks: "More than one week — a week is seven days.",
  whale: "A very large animal that lives in the ocean.",
  which: "A word used to ask about a choice.",
  while: "During the time that.",
  who: "A word used to ask about a person.",
  whole: "Complete, with nothing missing.",
  will: "A word showing something is going to happen.",
  window: "An opening with glass that lets in light.",
  writes: "Puts words down on paper.",
  after: "Later than something else.",
  anymore: "Any longer, from now on.",
  answer: "To reply to a question.",
  around: "On every side.",
  asleep: "Sleeping.",
  august: "The eighth month of the year, in high summer.",
  ask: "To say a question to someone.",
  bags: "Soft containers for carrying things.",
  because: "For the reason that.",
  beginners: "People doing something for the first time.",
  behind: "At the back of something.",
  bike: "A machine with two wheels that you pedal.",
  box: "A container with flat sides.",
  broken: "In pieces, not whole.",
  brother: "A boy with the same parents as you.",
  bubbles: "Round balls of air inside soap or water.",
  but: "A word that adds something different.",
  carrot: "A long orange vegetable that grows underground.",
  clean: "With no dirt on it.",
  clear: "To take everything away from a place.",
  cloud: "The white or gray shape in the sky that rain comes from.",
  coming: "Moving toward here.",
  compost: "Old leaves and food turned into rich dirt for plants.",
  could: "Might be able to.",
  dad: "The father of a family.",
  days: "More than one day.",
  did: "Carried out an action already.",
  dinner: "The meal eaten in the evening.",
  draw: "To make a picture with lines.",
  draws: "Makes a picture with lines.",
  eats: "Puts food in the mouth and swallows.",
  eleven: "The number after ten.",
  english: "The language this story is written in.",
  evening: "The end of the day, when it grows dark.",
  explaining: "Saying why, so someone understands.",
  fall: "To drop to the ground.",
  falls: "Drops toward the ground.",
  far: "A long way off.",
  faster: "Quicker than the others.",
  fat: "Wide and round.",
  forgive: "To stop being upset with someone for a mistake.",
  friday: "The day after Thursday.",
  gets: "Receives, or manages to do.",
  glass: "The hard clear stuff windows are made of.",
  gloves: "Coverings that keep your hands safe or warm.",
  goal: "The net you score into, or a thing you aim for.",
  gravel: "Small loose stones.",
  gray: "The color of a rain cloud.",
  grows: "Gets bigger over time.",
  happens: "Takes place.",
  hat: "Something you wear on your head.",
  have: "To hold or own something.",
  heads: "The tops of your bodies, above the neck.",
  hear: "To notice a sound with your ears.",
  hello: "What you say when you meet someone.",
  house: "A building people live in.",
  language: "The words a group of people speak together.",
  laughing: "Making the happy sound of a laugh.",
  learning: "Coming to know something new.",
  let: "To allow something.",
  line: "A long straight mark.",
  long: "Measuring a lot from end to end.",
  looking: "Using the eyes to see.",
  looks: "Uses the eyes to see.",
  loops: "Curved shapes that bend back on themselves.",
  lot: "A piece of empty land.",
  lunch: "The meal eaten in the middle of the day.",
  may: "Is allowed to.",
  mimi: "A name for a cat in our stories.",
  morning: "The early part of the day.",
  mother: "The woman who is a child's parent.",
  moved: "Went to live somewhere new.",
  name: "What a person or thing is called.",
  needs: "Must have something.",
  new: "Made or arrived just now.",
  night: "The dark part of the day.",
  nina: "A name for a girl in our stories.",
  "nina's": "Belonging to Nina.",
  nobody: "Not a single person.",
  nose: "The part of your face you smell with.",
  november: "The eleventh month of the year.",
  our: "Belonging to us.",
  out: "Away from the inside.",
  outside: "Not indoors.",
  owns: "Has something as their own.",
  paper: "Thin flat sheets for writing or drawing on.",
  pedal: "To push the pedals of a bike around.",
  piece: "A part of something bigger.",
  plant: "To put a seed in the ground so it grows.",
  playing: "Having fun doing something.",
  pull: "To take hold of something and move it toward you.",
  pushing: "Pressing forward against something.",
  question: "Words you say when you want an answer.",
  recess: "The break at school when children go outside.",
  round: "Shaped like a circle or a ball.",
  saturdays: "More than one Saturday.",
  saying: "Speaking words.",
  school: "The place where children go to learn.",
  sees: "Notices with the eyes.",
  shapes: "Forms like circles, squares and triangles.",
  sidewalk: "The path beside a road where people walk.",
  slide: "To push something smoothly along a surface.",
  snow: "Soft white flakes of frozen water that fall from clouds.",
  snowman: "A person shape built out of snow.",
  soccer: "A game where two teams kick a ball into goals.",
  soil: "The dirt that plants grow in.",
  something: "A thing you have not named.",
  speak: "To say words out loud.",
  splashes: "Makes water fly about.",
  square: "A shape with four equal straight sides.",
  star: "A point of light in the night sky.",
  started: "Began.",
  still: "Even now, as before.",
  street: "A road with houses along it.",
  takes: "Needs a certain amount, or carries something.",
  talks: "Says words to people.",
  teacher: "A person whose work is helping others learn.",
  there: "In that place.",
  think: "To use your mind.",
  through: "In one side and out the other.",
  thumbs: "The short thick fingers on the sides of your hands.",
  thursday: "The day after Wednesday.",
  tomas: "A name for a boy in our stories.",
  try: "To make an effort at something.",
  tub: "The big basin you sit in to wash.",
  tuesday: "The day after Monday.",
  twelfth: "The one that comes after the eleventh.",
  underneath: "Below, under the surface.",
  us: "Me and the people with me.",
  wear: "To have clothes on, or to slowly rub thin.",
  white: "The color of snow.",
  without: "Not having something.",
  woman: "A grown-up female person.",
  world: "Everything around us, the whole earth.",
  yard: "The open ground around a house.",
  yes: "A word that agrees.",
  yet: "Up to now, but maybe later.",
};

/* ------------------------------------------------------------------
   Flowers
   Each story earns its own bloom, so the designs have to outnumber the
   stories. Five petal shapes crossed with a colour set gives twenty
   distinct flowers that are drawn rather than typed, so they scale
   cleanly and match the app instead of a device's emoji font.
   ------------------------------------------------------------------ */

export type PetalShape = "round" | "pointed" | "wide" | "thin" | "heart";

export const PETAL_PATHS: Record<PetalShape, string> = {
  round: "M0,-4 C7,-14 7,-24 0,-30 C-7,-24 -7,-14 0,-4 Z",
  pointed: "M0,-4 C5,-17 3,-29 0,-35 C-3,-29 -5,-17 0,-4 Z",
  wide: "M0,-3 C12,-11 12,-25 0,-29 C-12,-25 -12,-11 0,-3 Z",
  thin: "M0,-6 C3,-19 3,-29 0,-33 C-3,-29 -3,-19 0,-6 Z",
  heart: "M0,-6 C9,-15 15,-25 6,-31 C2,-33 0,-29 0,-27 C0,-29 -2,-33 -6,-31 C-15,-25 -9,-15 0,-6 Z",
};

export type FlowerDesign = {
  id: string;
  shape: PetalShape;
  petals: number;
  petal: string;
  center: string;
};

export const FLOWER_DESIGNS: FlowerDesign[] = [
  { id: "coral-daisy", shape: "round", petals: 8, petal: "#E8674A", center: "#E8A93A" },
  { id: "gold-star", shape: "pointed", petals: 6, petal: "#E8A93A", center: "#C2703A" },
  { id: "violet-wide", shape: "wide", petals: 5, petal: "#8B72C9", center: "#F2E4A8" },
  { id: "rose-thin", shape: "thin", petals: 12, petal: "#E4576B", center: "#F5C86B" },
  { id: "sky-heart", shape: "heart", petals: 5, petal: "#5FA8D3", center: "#FBF6EC" },
  { id: "apricot-round", shape: "round", petals: 6, petal: "#F2A65A", center: "#B4542A" },
  { id: "plum-pointed", shape: "pointed", petals: 8, petal: "#A8508A", center: "#F2E4A8" },
  { id: "moss-wide", shape: "wide", petals: 6, petal: "#7FB069", center: "#E8A93A" },
  { id: "blush-thin", shape: "thin", petals: 10, petal: "#F0A0AE", center: "#D2564F" },
  { id: "indigo-heart", shape: "heart", petals: 6, petal: "#5C6BC0", center: "#F5C86B" },
  { id: "sun-round", shape: "round", petals: 12, petal: "#F0C244", center: "#8C5A2B" },
  { id: "flame-pointed", shape: "pointed", petals: 5, petal: "#D94F2B", center: "#F2E4A8" },
  { id: "lilac-wide", shape: "wide", petals: 8, petal: "#B79BDB", center: "#7A5CA8" },
  { id: "teal-thin", shape: "thin", petals: 14, petal: "#4FA3A5", center: "#F2E4A8" },
  { id: "cherry-heart", shape: "heart", petals: 8, petal: "#D2405E", center: "#FBF6EC" },
  { id: "butter-round", shape: "round", petals: 5, petal: "#F5DE8A", center: "#C2703A" },
  { id: "ink-pointed", shape: "pointed", petals: 10, petal: "#4A6FA5", center: "#E8A93A" },
  { id: "clay-wide", shape: "wide", petals: 7, petal: "#C97B5A", center: "#F2E4A8" },
  { id: "mint-thin", shape: "thin", petals: 11, petal: "#8ACBA1", center: "#D2564F" },
  { id: "dusk-heart", shape: "heart", petals: 7, petal: "#7A5CA8", center: "#F0C244" },
];

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

/**
 * Strip punctuation but keep combining marks, so accented text survives
 * intact rather than losing its vowels.
 */
export function cleanWord(word: string): string {
  return word.replace(/[^\p{L}\p{M}\p{N}'-]/gu, "").toLowerCase();
}

export function wordMeaning(word: string): string {
  return WORD_MEANINGS[cleanWord(word)] || "A word from your story.";
}

export function isSightWord(word: string): boolean {
  return SIGHT_WORDS.has(cleanWord(word));
}

export type WordSpan = { start: number; end: number; text: string };

/** Split a page into tappable words, keeping each word's place in the line. */
export function wordSpansOf(text: string): WordSpan[] {
  const spans: WordSpan[] = [];
  const pattern = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    spans.push({ start: match.index, end: match.index + match[0].length, text: match[0] });
  }
  return spans;
}

/** The shelf a child starts on, from the age already on their profile. */
export function bandForAge(age: number): ReadingBand {
  if (age <= 3) return "seedling";
  if (age === 4) return "sprout";
  if (age === 5) return "sapling";
  return "bloomer";
}

export function storiesInBand(band: ReadingBand): ReadingStory[] {
  return READING_STORIES.filter((story) => story.band === band);
}

export function findStory(id: string): ReadingStory | undefined {
  return READING_STORIES.find((story) => story.id === id);
}

/** Pages a child has actually turned, used for the real page counter. */
export function pageKey(storyId: string, pageIndex: number): string {
  return `${storyId}:${pageIndex}`;
}

export function flowerForStory(storyId: string): FlowerDesign {
  const index = READING_STORIES.findIndex((story) => story.id === storyId);
  return FLOWER_DESIGNS[(index < 0 ? 0 : index) % FLOWER_DESIGNS.length];
}

export type WordCheckQuestion = {
  answer: string;
  prompt: string;
  choices: string[];
};

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Two or three questions built from the story's own featured words, so a
 * new story gets a check for free. A child is shown a meaning and picks
 * the word, never the other way round: reading the word is the skill.
 */
export function buildWordCheck(story: ReadingStory, random: () => number = Math.random): WordCheckQuestion[] {
  const band = READING_BANDS[story.band];
  if (!band.check) return [];
  const pool = story.featured.map(cleanWord).filter((word) => WORD_MEANINGS[word]);
  const wanted = Math.min(band.checkQuestions || 2, pool.length);
  return shuffle(pool, random)
    .slice(0, wanted)
    .map((answer) => {
      const distractors = shuffle(pool.filter((word) => word !== answer), random).slice(0, 2);
      return {
        answer,
        prompt: WORD_MEANINGS[answer],
        choices: shuffle([answer, ...distractors], random),
      };
    });
}

/** Total pages across a shelf, for "12 of 50 pages read" style lines. */
export function pagesInBand(band: ReadingBand): number {
  return storiesInBand(band).reduce((total, story) => total + story.pages.length, 0);
}
