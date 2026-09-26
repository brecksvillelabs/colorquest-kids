export type StoryPage = {
  text: string;
  image: string;
  alt: string;
};

export type StoryBook = {
  id: string;
  title: string;
  emoji: string;
  ageWorld: 0 | 1;
  blurb: string;
  noticeWord: string;
  wordMeaning: string;
  talkAbout: string;
  pages: StoryPage[];
};

const toddlerStories: StoryBook[] = [
  {
    id: "pips-hat",
    title: "Pip's Hiccuping Hat",
    emoji: "🐦",
    ageWorld: 0,
    blurb: "A tiny bird, a giant hat, and one very bouncy hiccup.",
    noticeWord: "enormous",
    wordMeaning: "Enormous means very, very big.",
    talkAbout: "What else could Pip and Snail use the enormous hat for?",
    pages: [
      { text: "Pip found a hat. It was enormous. Pip was very small.", image: "stories/pips-hat-1.webp", alt: "Tiny blue bird Pip trying on an enormous yellow hat in a garden" },
      { text: "HIC! Up went the hat. “Oh, feathers!” chirped Pip. Ladybug blinked in surprise.", image: "stories/pips-hat-2.webp", alt: "Pip hiccupping as the yellow hat pops into the air beside a surprised ladybug" },
      { text: "HIC! The hat landed softly on Snail. “A hat-house!” said Snail.", image: "stories/pips-hat-3.webp", alt: "A smiling snail under the huge yellow hat while Pip giggles" },
      { text: "Pip and Snail snuggled underneath. HIC! They laughed and laughed.", image: "stories/pips-hat-4.webp", alt: "Pip and Snail laughing together underneath the enormous hat" },
    ],
  },
  {
    id: "moons-sock",
    title: "The Moon's Missing Sock",
    emoji: "🌙",
    ageWorld: 0,
    blurb: "Moon looks everywhere for one stripey bedtime sock.",
    noticeWord: "cozy",
    wordMeaning: "Cozy means warm, safe, and comfortable.",
    talkAbout: "What funny thing could Moon wear as a hat?",
    pages: [
      { text: "Moon was ready for bed. But one stripey sock was missing.", image: "stories/moons-sock-1.webp", alt: "A friendly moon in a purple nightcap searching a cloud bedroom for a striped sock" },
      { text: "Moon asked the stars. The stars twinkled and pointed down, down, down.", image: "stories/moons-sock-2.webp", alt: "Moon asking three smiling stars where the missing sock went" },
      { text: "On Earth, Giraffe wore the sock as the coziest scarf in the world.", image: "stories/moons-sock-3.webp", alt: "A sleepy giraffe wearing the giant striped sock as a cozy scarf" },
      { text: "Moon laughed. “Keep it!” Then Moon wore two fluffy clouds as slippers.", image: "stories/moons-sock-4.webp", alt: "Moon and Giraffe laughing while Moon wears two little clouds as slippers" },
    ],
  },
  {
    id: "turtles-fast-day",
    title: "Tiny Turtle's Fast Day",
    emoji: "🐢",
    ageWorld: 0,
    blurb: "Tuck Turtle races a red ball—and surprises himself.",
    noticeWord: "speedy",
    wordMeaning: "Speedy means moving quickly.",
    talkAbout: "Can you move like slow Tuck, then speedy Tuck?",
    pages: [
      { text: "Tuck Turtle challenged a red ball to a race. The ball said nothing. Balls are quiet.", image: "stories/turtles-fast-day-1.webp", alt: "Tiny turtle Tuck inviting a red ball to race beside a puddle" },
      { text: "Tuck rode a leaf down the little hill. “Wheee! I am speedy!”", image: "stories/turtles-fast-day-2.webp", alt: "Tuck happily zooming down a small hill on a large green leaf" },
      { text: "SPLASH! Duck's boots got a bath. “My boots love puddles,” Duck quacked.", image: "stories/turtles-fast-day-3.webp", alt: "Tuck splashing safely into a puddle beside a duck in rain boots" },
      { text: "Tuck crossed the daisy finish. The ball had not moved. Everyone laughed—even the ball, almost.", image: "stories/turtles-fast-day-4.webp", alt: "Tuck, Duck, and the red ball celebrating at a finish line made from daisies" },
    ],
  },
  {
    id: "hello-blanket",
    title: "The Hello Blanket",
    emoji: "👋",
    ageWorld: 0,
    blurb: "Four friends discover there are many wonderful ways to say hello.",
    noticeWord: "welcome",
    wordMeaning: "Welcome means showing someone they belong with you.",
    talkAbout: "How many different ways can you show a friend hello?",
    pages: [
      { text: "Maya brought a bright blanket to the park. “Hello!” she called. Her friends came close.", image: "stories/hello-blanket-1.svg", alt: "Four young friends with varied skin tones arriving at a sunny park picnic with a rolled rainbow blanket" },
      { text: "Noah liked picture cards. He tapped his HELLO picture. Maya smiled and made room beside her.", image: "stories/hello-blanket-2.svg", alt: "A child points to a hello picture card while friends make space on a colorful picnic blanket" },
      { text: "Zuri waved. Leo signed hello with his hands. Maya said hello out loud. Four hellos—one happy welcome!", image: "stories/hello-blanket-3.svg", alt: "Friends greet one another in different ways by waving, signing hello, pointing to a picture card, and smiling" },
      { text: "They shared fruit, bubbles, and the big bright blanket. There was room for every hello—and room for every friend.", image: "stories/hello-blanket-4.svg", alt: "A joyful diverse group of children share fruit and bubbles on a rainbow picnic blanket with room for everyone" },
    ],
  },
  {
    id: "parade-soft-sounds",
    title: "The Parade of Soft Sounds",
    emoji: "🎀",
    ageWorld: 0,
    blurb: "A courtyard parade finds a gentler beat so every friend can join.",
    noticeWord: "gentle",
    wordMeaning: "Gentle means soft, calm, and careful.",
    talkAbout: "What could you change in a game or celebration to help a friend feel comfortable joining?",
    pages: [
      { text: "Music bounced through the courtyard. Ravi shook bells. Lila tapped a drum. Noor covered her ears and stepped beside Grandma.", image: "stories/parade-soft-sounds-1.svg", alt: "Children with varied skin tones gather in a bright courtyard; Ravi holds bells, Lila has a small drum, and Noor stands calmly beside her grandmother with hands near her ears" },
      { text: "Ravi noticed. “Too loud?” Noor nodded. Lila found ribbon wands, and Grandma brought soft shakers filled with rice.", image: "stories/parade-soft-sounds-2.svg", alt: "Ravi and Lila notice Noor needs a quieter sound and choose colorful ribbon wands and gentle rice shakers together" },
      { text: "Swish, shake, tap-tap! The friends made a new parade. Noor led with a purple ribbon, and everyone chose a sound that felt good.", image: "stories/parade-soft-sounds-3.svg", alt: "Noor happily leads a courtyard parade with a purple ribbon while friends use gentle shakers, a softly tapped drum, and flowing ribbons" },
      { text: "Around the fountain they went—bright ribbons flying, quiet rhythms bouncing. The parade had changed, and every friend was still part of it.", image: "stories/parade-soft-sounds-4.svg", alt: "A joyful inclusive group circles a courtyard fountain with colorful ribbons and gentle instruments, with every child taking part" },
    ],
  },
];

const earlyReaderStories: StoryBook[] = [
  {
    id: "banana-boots",
    title: "The Banana Boots Parade",
    emoji: "🍌",
    ageWorld: 1,
    blurb: "Nia turns a rainy afternoon into a kitchen-sized parade.",
    noticeWord: "parade",
    wordMeaning: "A parade is a group moving together for a celebration.",
    talkAbout: "Which safe household object would you turn into a pretend instrument?",
    pages: [
      { text: "Rain tapped the window. With a grown-up's help, Nia made two silly banana slippers from yellow cardboard.", image: "stories/banana-boots-1.webp", alt: "Nia admiring two cardboard banana cutouts beside her yellow rain boots" },
      { text: "Nia fastened the soft straps and shuffled carefully. “Welcome to the Banana Boots Parade!” she announced.", image: "stories/banana-boots-2.webp", alt: "Nia standing safely in handmade cardboard banana slippers while her cat watches" },
      { text: "Cat wore a colander hat. Wooden spoons tapped a beat. In Nia's imagination, every fruit joined the band.", image: "stories/banana-boots-3.webp", alt: "Nia and her cat leading a playful pretend kitchen parade with fruit characters" },
      { text: "After one final boom-tap-tap, Nia put the real fruit in its bowl and wore her rain boots. The whole kitchen bowed.", image: "stories/banana-boots-4.webp", alt: "Nia placing bananas in a fruit bowl after the parade while her cat and fruit friends bow" },
    ],
  },
  {
    id: "polite-volcano",
    title: "The Very Polite Volcano",
    emoji: "🌋",
    ageWorld: 1,
    blurb: "Vee Volcano has a tickle—and remembers to warn the picnic.",
    noticeWord: "warning",
    wordMeaning: "A warning tells someone about something before it happens.",
    talkAbout: "How did Vee help the birds feel safe before the big puff?",
    pages: [
      { text: "Vee Volcano felt a tickle deep inside. Puff… puff… PUFF! The picnic birds looked up.", image: "stories/polite-volcano-1.webp", alt: "A friendly purple volcano holding in a tickly puff while birds picnic nearby" },
      { text: "“Excuse me,” said Vee. “I may need to puff.” The birds thanked Vee for the warning and moved their blanket back.", image: "stories/polite-volcano-2.webp", alt: "Vee politely warning three birds as they carry their picnic a safe distance away" },
      { text: "FOOF! Vee burst out—not lava, but a fountain of flower petals and soft steam.", image: "stories/polite-volcano-3.webp", alt: "The smiling pretend volcano releasing a magical fountain of colorful flower petals" },
      { text: "Petals covered the picnic. One bird opened a leaf umbrella. “Best warning ever!” everyone laughed.", image: "stories/polite-volcano-4.webp", alt: "Vee and the birds laughing together at a petal-covered picnic under a leaf umbrella" },
    ],
  },
  {
    id: "bubble-bus",
    title: "Dot and the Bubble Bus",
    emoji: "🫧",
    ageWorld: 1,
    blurb: "One enormous bubble becomes the silliest bus in the park.",
    noticeWord: "passenger",
    wordMeaning: "A passenger is someone riding in a vehicle.",
    talkAbout: "Where would your imaginary bubble bus travel?",
    pages: [
      { text: "Dot blew one tiny bubble, then one medium bubble, then the biggest bubble the park had ever seen.", image: "stories/bubble-bus-1.webp", alt: "Dot blowing an enormous shimmering soap bubble in a sunny park with her dog" },
      { text: "“All aboard!” Dot imagined. The bubble became a bus, and her dog took the driver's seat very seriously.", image: "stories/bubble-bus-2.webp", alt: "Dot and her fluffy dog riding inside a pretend iridescent bubble bus" },
      { text: "Three butterfly passengers climbed aboard with leaf-shaped parcels. The driver checked every imaginary ticket twice.", image: "stories/bubble-bus-3.webp", alt: "The dog driving the bubble bus while three butterfly passengers carry leaf parcels" },
      { text: "The bus landed softly. POP! It became a sparkling puddle. “Every bus needs a last stop,” Dot laughed.", image: "stories/bubble-bus-4.webp", alt: "Dot, her dog, and butterflies laughing after the bubble pops into sparkling drops" },
    ],
  },
  {
    id: "garden-made-room",
    title: "The Garden That Made Room",
    emoji: "🌻",
    ageWorld: 1,
    blurb: "Three friends discover that fair can mean different tools for the same big job.",
    noticeWord: "fair",
    wordMeaning: "Fair does not always mean everyone gets the same thing. It can mean everyone gets what helps them take part.",
    talkAbout: "If two friends need different tools to join the same activity, can both choices still be fair?",
    pages: [
      { text: "Saturday was Garden Day. Amara, Ben, and Mei each got the same tall watering can. “Same for everyone!” said Mr. Luis.", image: "stories/garden-made-room-1.svg", alt: "Amara, Ben, and Mei arriving at a bright community garden, each beside the same tall blue watering can; Ben uses a teal wheelchair" },
      { text: "But the big can was heavy for Amara, and the hose hook sat too high for Ben to reach from his wheelchair. Mei wanted picture labels so she could learn every plant name.", image: "stories/garden-made-room-2.svg", alt: "The three friends noticing different garden needs: a heavy watering can, a hose hook mounted too high, and unlabeled plants" },
      { text: "The friends tried a better question: “What helps each person join in?” They found a small pitcher, lowered the hose hook, and drew bright picture labels together.", image: "stories/garden-made-room-3.svg", alt: "Amara, Ben, and Mei adapting the garden with a small pitcher, a reachable hose hook, and colorful picture labels" },
      { text: "Soon every seedling had water. Ben painted signs, Amara watered herbs, and Mei welcomed a new family to the garden. Fair did not look the same—and everyone had a way to help.", image: "stories/garden-made-room-4.svg", alt: "A thriving inclusive community garden where Ben paints signs, Amara waters herbs, Mei greets a family, and everyone contributes" },
    ],
  },
  {
    id: "kite-many-tails",
    title: "The Kite With Many Tails",
    emoji: "🪁",
    ageWorld: 1,
    blurb: "Four neighbors discover that a kite flies best when everyone has a way to help.",
    noticeWord: "contribute",
    wordMeaning: "Contribute means adding something you can do or share to help a group.",
    talkAbout: "What could each person contribute if your group built something together?",
    pages: [
      { text: "At the hilltop picnic, Asha, Mateo, June, and Sami found a bright kite kit. Everyone wanted to help, but there was only one spool and one pair of scissors.", image: "stories/kite-many-tails-1.svg", alt: "Four children with varied skin tones gathered around a colorful kite kit on a grassy hill, with one spool and one pair of child-safe scissors" },
      { text: "“We don’t all need the same job,” said June. Asha tied careful knots, Mateo chose the tail colors, Sami held the frame steady, and June drew a smiling sun.", image: "stories/kite-many-tails-2.svg", alt: "Four friends doing different kite-building jobs together: tying ribbon, choosing colors, steadying the frame, and drawing a sun" },
      { text: "WHOOSH! The kite wobbled. Its short tail tugged sideways. The friends each added one ribbon, making a long dancing tail from everyone’s pieces.", image: "stories/kite-many-tails-3.svg", alt: "The children adding different colorful ribbons to a kite tail while the kite begins to lift in the breeze" },
      { text: "Up sailed the kite—gold, blue, green, and red ribbons streaming together. No one had done every job. Everyone had contributed, and the sky held all their colors.", image: "stories/kite-many-tails-4.svg", alt: "A joyful group of four children flying their finished kite high above the hill with a long multicolored ribbon tail" },
    ],
  },
];

export const STORY_COUNTS = {
  toddler: toddlerStories.length,
  earlyReader: earlyReaderStories.length,
  total: toddlerStories.length + earlyReaderStories.length,
  pages: [...toddlerStories, ...earlyReaderStories].reduce((total, story) => total + story.pages.length, 0),
} as const;

export function getStoryBooks(ageWorld: number): StoryBook[] {
  return ageWorld <= 0 ? toddlerStories : earlyReaderStories;
}

export function getStoryBook(ageWorld: number, page: number): StoryBook {
  const books = getStoryBooks(ageWorld);
  return books[(Math.max(1, Math.floor(page)) - 1) % books.length];
}
