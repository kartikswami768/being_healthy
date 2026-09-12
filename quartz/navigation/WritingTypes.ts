export const writingTypes = [
  {
    key: "question",
    title: "Everyday Questions",
    slug: "questions",
    description:
      "Questions about health, the body, food, exercise, habits, and things people encounter in ordinary life.",
  },
  {
    key: "essay",
    title: "Essays",
    slug: "essays",
    description:
      "Longer explorations of health, medicine, psychology, behaviour, and ideas that deserve more than a quick answer.",
  },
  {
    key: "case",
    title: "Case Stories",
    slug: "cases",
    description:
      "Interesting medical cases and the reasoning behind them: what makes them puzzling, instructive, or memorable.",
  },
  {
    key: "note",
    title: "Notes & Observations",
    slug: "notes",
    description:
      "Shorter thoughts, observations, and pieces of learning that do not need to become a full essay.",
  },
] as const

export type WritingType = (typeof writingTypes)[number]
