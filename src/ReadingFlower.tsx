import { PETAL_PATHS, flowerForStory } from "./reading-data";

/**
 * A story's flower, drawn rather than typed.
 *
 * Emoji would be cheaper, but they render differently on every device and
 * run out of distinct blooms long before the shelf does. These scale
 * cleanly and sit in the app's own palette.
 */
export default function ReadingFlower({
  storyId,
  size = 34,
  title,
}: {
  storyId: string;
  size?: number;
  title?: string;
}) {
  const design = flowerForStory(storyId);
  const petals = Array.from({ length: design.petals }, (_, index) => (
    <path
      key={index}
      d={PETAL_PATHS[design.shape]}
      fill={design.petal}
      opacity="0.95"
      transform={`rotate(${((index * 360) / design.petals).toFixed(2)})`}
    />
  ));

  return (
    <svg
      className="reading-flower"
      width={size}
      height={Math.round(size * 1.3)}
      viewBox="-38 -38 76 100"
      role="img"
      aria-label={title ? `Flower for ${title}` : "A flower"}
    >
      <path d="M0,8 C-4,26 4,40 0,56" stroke="#4F7C41" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M-1,30 C-15,21 -20,34 -3,37 Z" fill="#6FA85C" />
      <path d="M1,40 C14,32 19,45 3,47 Z" fill="#7FB069" />
      {petals}
      <circle cx="0" cy="0" r="8" fill={design.center} />
    </svg>
  );
}
