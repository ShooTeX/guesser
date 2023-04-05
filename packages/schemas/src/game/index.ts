import { z } from "zod";
import { answerSchema, questionSchema } from "../questions";

export const playerSchema = z.object({
  id: z.string(),
  connected: z.boolean(),
  score: z.number().min(0).finite().nonnegative(),
});

export const roundSchema = z.object({
  question: questionSchema.omit({ answers: true }),
  answers: answerSchema.pick({ id: true, answer: true }),
  correct: answerSchema.pick({ id: true }).optional(),
  guesses: z
    .object({
      playerId: playerSchema.shape.id,
      guess: answerSchema.shape.id,
    })
    .array(),
});

export const gameSchema = z.object({
  id: z.string(),
  state: z.enum(["waiting", "show", "reveal", "end"] as const),
  players: playerSchema.array(),
  questions: questionSchema.array(),
  rounds: roundSchema.array(),
  currentRound: roundSchema,
});
