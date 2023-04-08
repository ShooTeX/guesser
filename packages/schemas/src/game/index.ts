import { z } from "zod";
import { answerSchema, questionSchema } from "../questions";
import { playlistSchema } from "../playlists";

export const playerSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.string().url(),
  connected: z.boolean(),
  score: z.number().min(0).finite().nonnegative(),
  guess: answerSchema.shape.id.optional(),
});

export const roomSchema = z.object({
  playlistName: playlistSchema.shape.name,
  questions: questionSchema.array(),
  currentQuestion: z.number().finite().min(0).nonnegative(),
  players: playerSchema.array(),
  host: playerSchema.pick({ id: true, username: true, avatar: true }),
});

export const gameSchema = roomSchema
  .pick({ players: true, host: true })
  .extend({
    question: questionSchema.omit({ answers: true }),
    answers: answerSchema.omit({ correct: true }).array(),
    correctAnswer: answerSchema.shape.id.optional(),
    hostInfo: z
      .object({
        playlistName: playlistSchema.shape.name,
        questionCount: playlistSchema.shape.questionCount,
        currentQuestion: roomSchema.shape.currentQuestion,
      })
      .optional(),
  });

export const joinRoomSchema = z.object({
  id: z.string(),
  userId: z.string(),
});

export const createRoomSchema = z.object({
  playlistId: playlistSchema.shape.id,
});
