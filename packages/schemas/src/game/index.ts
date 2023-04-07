import { z } from "zod";
import { answerSchema, questionSchema } from "../questions";

export const playerSchema = z.object({
  id: z.string(),
  username: z.string(),
  connected: z.boolean(),
  score: z.number().min(0).finite().nonnegative(),
  guess: answerSchema.shape.id,
});

export const roomSchema = z.object({
  questions: questionSchema.array(),
  currentQuestion: z.number().finite().min(0).nonnegative(),
  players: playerSchema.array(),
});

export const gameSchema = roomSchema.extend({
  players: playerSchema,
  question: questionSchema.omit({ answers: true }),
  answers: answerSchema.omit({ correct: true }),
  correctAnswer: answerSchema.shape.id.optional(),
});
