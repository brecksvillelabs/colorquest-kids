import { randomInt, rodsNeeded, seededRandom } from "./abacus-engine";

export type AbacusMode = "learn" | "practice" | "free";

export type AbacusStageId =
  | "bead-play"
  | "digits"
  | "place-value"
  | "direct-add"
  | "direct-subtract"
  | "friends-five"
  | "friends-ten"
  | "multi-digit"
  | "multiply-divide"
  | "advanced-mixed";

export type AbacusStage = {
  id: AbacusStageId;
  order: number;
  minAge: number;
  icon: string;
  title: string;
  shortTitle: string;
  description: string;
  bigIdea: string;
  teacherNote: string;
  steps: string[];
};

export type AbacusChallenge = {
  id: string;
  stageId: AbacusStageId;
  prompt: string;
  startValue: number;
  targetValue: number;
  rods: number;
  hint: string;
  strategy: string;
  speakText: string;
};

export const ABACUS_STAGES: AbacusStage[] = [
  {
    id: "bead-play",
    order: 0,
    minAge: 1,
    icon: "🟠",
    title: "Bead Play",
    shortTitle: "Bead Play",
    description: "Explore moving beads toward and away from the beam.",
    bigIdea: "Only beads touching the middle beam count.",
    teacherNote: "For ages 1–3 this is exploration, not formal arithmetic instruction.",
    steps: [
      "Tap a bead and watch it snap toward or away from the beam.",
      "Say how many beads are touching the beam.",
      "Reset and make a different pattern.",
    ],
  },
  {
    id: "digits",
    order: 1,
    minAge: 4,
    icon: "5️⃣",
    title: "Meet the Soroban",
    shortTitle: "0–9",
    description: "Use one upper 5-bead and four lower 1-beads to make every digit.",
    bigIdea: "The upper bead is worth 5. Each lower bead is worth 1.",
    teacherNote: "Build fluent digit recognition before place value.",
    steps: [
      "Lower beads touching the beam count as 1 each.",
      "The upper bead touching the beam counts as 5.",
      "Combine them to make every number from 0 through 9.",
    ],
  },
  {
    id: "place-value",
    order: 2,
    minAge: 5,
    icon: "🏠",
    title: "Build Numbers",
    shortTitle: "Place Value",
    description: "Read and build ones, tens, hundreds, and larger numbers.",
    bigIdea: "The same digit has a different value depending on its rod.",
    teacherNote: "Keep place-value labels visible until the child reads rods independently.",
    steps: [
      "The rightmost rod is ones.",
      "Move left for tens, hundreds, thousands, and beyond.",
      "Read the whole abacus from left to right.",
    ],
  },
  {
    id: "direct-add",
    order: 3,
    minAge: 5,
    icon: "➕",
    title: "Direct Addition",
    shortTitle: "Easy +",
    description: "Add when the needed beads are already available on the rod.",
    bigIdea: "Add by moving the needed value toward the beam.",
    teacherNote: "These questions avoid exchanges so the movement-value connection is clear.",
    steps: [
      "Set the starting number.",
      "Read how much to add.",
      "Move only the beads you need, then read the new value.",
    ],
  },
  {
    id: "direct-subtract",
    order: 4,
    minAge: 5,
    icon: "➖",
    title: "Direct Subtraction",
    shortTitle: "Easy −",
    description: "Subtract when the beads you need can move directly away.",
    bigIdea: "Subtract by moving the needed value away from the beam.",
    teacherNote: "Direct subtraction should feel concrete before complement strategies begin.",
    steps: [
      "Set the starting number.",
      "Read how much to take away.",
      "Move those beads away from the beam, then read what remains.",
    ],
  },
  {
    id: "friends-five",
    order: 5,
    minAge: 6,
    icon: "✋",
    title: "Friends of 5",
    shortTitle: "Make 5",
    description: "Use complements to 5 when a direct move is not available.",
    bigIdea: "1 and 4 are friends of 5. So are 2 and 3.",
    teacherNote: "This is the first major soroban strategy: exchange rather than counting beads one by one.",
    steps: [
      "Notice when there are not enough lower beads for a direct move.",
      "Use the 5-bead, then undo the complement.",
      "Say the pair that makes 5 before moving.",
    ],
  },
  {
    id: "friends-ten",
    order: 6,
    minAge: 6,
    icon: "🔟",
    title: "Friends of 10",
    shortTitle: "Make 10",
    description: "Carry and borrow by using complements to 10 across rods.",
    bigIdea: "When one rod cannot finish the move, trade with the rod to its left.",
    teacherNote: "Keep the complement language explicit: 1↔9, 2↔8, 3↔7, 4↔6, 5↔5.",
    steps: [
      "Find the friend that makes 10.",
      "Move one bead on the rod to the left.",
      "Finish the complement move on the current rod.",
    ],
  },
  {
    id: "multi-digit",
    order: 7,
    minAge: 7,
    icon: "🧮",
    title: "Multi-digit Arithmetic",
    shortTitle: "Big + / −",
    description: "Combine place value and complement strategies across several rods.",
    bigIdea: "Work one place at a time while keeping the whole number visible.",
    teacherNote: "Accuracy and explanation come before speed.",
    steps: [
      "Read the starting number carefully.",
      "Work through the operation one place at a time.",
      "Check the final number by reading every rod.",
    ],
  },
  {
    id: "multiply-divide",
    order: 8,
    minAge: 8,
    icon: "✖️",
    title: "Multiply & Divide",
    shortTitle: "× and ÷",
    description: "Use the soroban as a place-value workspace for basic multiplication and division.",
    bigIdea: "Multiplication makes equal groups; division finds how many equal groups fit.",
    teacherNote: "V1 checks the arithmetic result on the abacus. Traditional multi-rod soroban algorithms are a later advanced module.",
    steps: [
      "Read the multiplication or division story.",
      "Use known facts, repeated groups, and place value to work out the result.",
      "Build the final answer accurately on the soroban.",
    ],
  },
  {
    id: "advanced-mixed",
    order: 9,
    minAge: 10,
    icon: "🚀",
    title: "Advanced Mixed Practice",
    shortTitle: "Mixed",
    description: "Solve longer mixed arithmetic with larger values.",
    bigIdea: "A calm, accurate place-value strategy scales to bigger calculations.",
    teacherNote: "This is fluency practice, not a race. Timing stays optional and private.",
    steps: [
      "Plan the first operation before touching the beads.",
      "Keep intermediate values on the soroban.",
      "Read the final value and check whether it is reasonable.",
    ],
  },
];

export function stagesForAge(childAge: number) {
  return ABACUS_STAGES.filter((stage) => childAge >= stage.minAge);
}

export function recommendedStageId(childAge: number, completedStages: string[] = []): AbacusStageId {
  const available = stagesForAge(childAge);
  const progression = childAge >= 4
    ? available.filter((stage) => stage.id !== "bead-play")
    : available;
  return (progression.find((stage) => !completedStages.includes(stage.id))
    || progression[progression.length - 1]
    || available[0]
    || ABACUS_STAGES[0]).id;
}

function directAddChallenge(random: () => number) {
  const pairs = [[1, 2], [1, 3], [2, 1], [2, 2], [5, 1], [5, 2], [5, 3], [6, 1], [6, 2], [7, 1]] as const;
  const [start, add] = pairs[randomInt(random, 0, pairs.length - 1)];
  return { start, amount: add, target: start + add };
}

function directSubtractChallenge(random: () => number) {
  const pairs = [[4, 1], [4, 2], [3, 1], [8, 1], [8, 2], [8, 3], [7, 1], [7, 2], [9, 1], [9, 3]] as const;
  const [start, amount] = pairs[randomInt(random, 0, pairs.length - 1)];
  return { start, amount, target: start - amount };
}

function fiveChallenge(random: () => number) {
  const options = [
    { start: 3, op: "+", amount: 4, target: 7, pair: "4 = 5 − 1" },
    { start: 4, op: "+", amount: 3, target: 7, pair: "3 = 5 − 2" },
    { start: 2, op: "+", amount: 4, target: 6, pair: "4 = 5 − 1" },
    { start: 7, op: "-", amount: 4, target: 3, pair: "take 5, give 1 back" },
    { start: 8, op: "-", amount: 4, target: 4, pair: "take 5, give 1 back" },
    { start: 6, op: "-", amount: 3, target: 3, pair: "take 5, give 2 back" },
  ];
  return options[randomInt(random, 0, options.length - 1)];
}

function tenChallenge(random: () => number) {
  const options = [
    { start: 7, op: "+", amount: 6, target: 13, pair: "6 is 10 − 4" },
    { start: 8, op: "+", amount: 7, target: 15, pair: "7 is 10 − 3" },
    { start: 6, op: "+", amount: 8, target: 14, pair: "8 is 10 − 2" },
    { start: 13, op: "-", amount: 6, target: 7, pair: "borrow 10, then use the friend of 6" },
    { start: 15, op: "-", amount: 7, target: 8, pair: "borrow 10, then use the friend of 7" },
    { start: 14, op: "-", amount: 8, target: 6, pair: "borrow 10, then use the friend of 8" },
  ];
  return options[randomInt(random, 0, options.length - 1)];
}

export function buildAbacusChallenge(
  stageId: AbacusStageId,
  childAge: number,
  sequence: number,
  seedBase = "colorquest-abacus",
): AbacusChallenge {
  const random = seededRandom(`${seedBase}:${stageId}:${childAge}:${sequence}`);
  const id = `${stageId}:${childAge}:${sequence}`;

  switch (stageId) {
    case "bead-play": {
      const target = randomInt(random, 0, 9);
      return {
        id, stageId, prompt: `Can you make ${target} on one rod?`, startValue: 0, targetValue: target, rods: 1,
        hint: target >= 5 ? `Use the 5-bead and ${target - 5} lower bead${target - 5 === 1 ? "" : "s"}.` : `Move ${target} lower bead${target === 1 ? "" : "s"} toward the beam.`,
        strategy: "Explore slowly. Only beads touching the beam count.",
        speakText: `Make ${target} on the abacus.`,
      };
    }
    case "digits": {
      const target = randomInt(random, 0, 9);
      return {
        id, stageId, prompt: `Build the digit ${target}.`, startValue: 0, targetValue: target, rods: 1,
        hint: target >= 5 ? `Start with the 5-bead, then add ${target - 5} lower bead${target - 5 === 1 ? "" : "s"}.` : `You only need lower 1-beads for ${target}.`,
        strategy: "Upper bead = 5. Lower beads = 1 each.",
        speakText: `Build the digit ${target}.`,
      };
    }
    case "place-value": {
      const digits = childAge <= 5 ? 2 : childAge <= 7 ? 3 : childAge <= 9 ? 4 : 5;
      const min = Math.pow(10, Math.max(1, digits - 1));
      const max = Math.pow(10, digits) - 1;
      const target = randomInt(random, min, max);
      return {
        id, stageId, prompt: `Build ${target.toLocaleString("en-US")}.`, startValue: 0, targetValue: target, rods: rodsNeeded(target),
        hint: "Start at the ones rod on the right. Move left for tens, hundreds, and thousands.",
        strategy: "Read each rod as one digit, then read the whole number left to right.",
        speakText: `Build ${target.toLocaleString("en-US")} on the abacus.`,
      };
    }
    case "direct-add": {
      const item = directAddChallenge(random);
      return {
        id, stageId, prompt: `${item.start} + ${item.amount} = ?`, startValue: item.start, targetValue: item.target, rods: 3,
        hint: `You can add ${item.amount} directly. No exchange is needed.`,
        strategy: "Move the needed value toward the beam.",
        speakText: `Start at ${item.start}. Add ${item.amount}.`,
      };
    }
    case "direct-subtract": {
      const item = directSubtractChallenge(random);
      return {
        id, stageId, prompt: `${item.start} − ${item.amount} = ?`, startValue: item.start, targetValue: item.target, rods: 3,
        hint: `Move ${item.amount} directly away from the beam.`,
        strategy: "Take away only the value named in the problem.",
        speakText: `Start at ${item.start}. Take away ${item.amount}.`,
      };
    }
    case "friends-five": {
      const item = fiveChallenge(random);
      return {
        id, stageId, prompt: `${item.start} ${item.op} ${item.amount} = ?`, startValue: item.start, targetValue: item.target, rods: 3,
        hint: `Think: ${item.pair}.`,
        strategy: "When a direct lower-bead move will not work, exchange with the 5-bead.",
        speakText: `Start at ${item.start}. ${item.op === "+" ? "Add" : "Subtract"} ${item.amount} using a friend of five.`,
      };
    }
    case "friends-ten": {
      const item = tenChallenge(random);
      return {
        id, stageId, prompt: `${item.start} ${item.op} ${item.amount} = ?`, startValue: item.start, targetValue: item.target, rods: 3,
        hint: `Think: ${item.pair}.`,
        strategy: "Trade with the tens rod, then finish the complement move on the ones rod.",
        speakText: `Start at ${item.start}. ${item.op === "+" ? "Add" : "Subtract"} ${item.amount} using a friend of ten.`,
      };
    }
    case "multi-digit": {
      const digits = childAge <= 8 ? 2 : 3;
      const min = Math.pow(10, digits - 1);
      const max = Math.pow(10, digits) - 1;
      const start = randomInt(random, min, max);
      const add = random() > 0.45;
      const amount = add
        ? randomInt(random, 11, Math.min(max - start, childAge <= 8 ? 45 : 180) || 11)
        : randomInt(random, 10, Math.min(start - 1, childAge <= 8 ? 45 : 180));
      const safeAdd = add && start + amount <= max;
      const op = safeAdd ? "+" : "−";
      const target = safeAdd ? start + amount : start - amount;
      return {
        id, stageId, prompt: `${start.toLocaleString()} ${op} ${amount.toLocaleString()} = ?`, startValue: start, targetValue: target, rods: rodsNeeded(start, target),
        hint: "Work one place at a time. Use friends of 5 or 10 whenever a direct move is blocked.",
        strategy: "Accuracy first. Read the whole abacus after each place-value exchange.",
        speakText: `Start at ${start}. ${op === "+" ? "Add" : "Subtract"} ${amount}.`,
      };
    }
    case "multiply-divide": {
      const multiply = random() >= 0.45;
      if (multiply) {
        const a = randomInt(random, 2, childAge >= 10 ? 12 : 9);
        const b = randomInt(random, 2, childAge >= 10 ? 12 : 9);
        const target = a * b;
        return {
          id, stageId, prompt: `${a} × ${b} = ?`, startValue: 0, targetValue: target, rods: rodsNeeded(target),
          hint: `Think of ${a} equal groups of ${b}. Build the product when you know it.`,
          strategy: "Think in equal groups, then use place value to build the final product calmly.",
          speakText: `Use the abacus to solve ${a} times ${b}.`,
        };
      }
      const divisor = randomInt(random, 2, childAge >= 10 ? 12 : 9);
      const quotient = randomInt(random, 2, childAge >= 10 ? 12 : 9);
      const dividend = divisor * quotient;
      return {
        id, stageId, prompt: `${dividend} ÷ ${divisor} = ?`, startValue: dividend, targetValue: quotient, rods: rodsNeeded(dividend, quotient),
        hint: `How many groups of ${divisor} fit into ${dividend}?`,
        strategy: "Use equal groups and place value. Leave the quotient on the soroban.",
        speakText: `Use the abacus to solve ${dividend} divided by ${divisor}.`,
      };
    }
    case "advanced-mixed": {
      const a = randomInt(random, 120, childAge >= 11 ? 3200 : 1200);
      const b = randomInt(random, 20, Math.min(850, a - 1));
      const c = randomInt(random, 5, Math.min(180, a + b - 1));
      const target = a + b - c;
      return {
        id, stageId, prompt: `${a.toLocaleString()} + ${b.toLocaleString()} − ${c.toLocaleString()} = ?`, startValue: a, targetValue: target, rods: rodsNeeded(a, target),
        hint: `First add ${b}. Keep that intermediate value on the abacus. Then subtract ${c}.`,
        strategy: "Do one operation at a time. Keep your intermediate answer visible before moving on.",
        speakText: `Start at ${a}. Add ${b}. Then subtract ${c}.`,
      };
    }
  }
}
