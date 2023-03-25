import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  question: z.string().min(1),
  playlistId: z.string().length(21),
  createdAt: z.date(),
});
