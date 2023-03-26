import { eq, and } from "drizzle-orm/expressions";
import { pipe, groupBy, values, compact, map } from "remeda";
import type { Context } from "../../create-context";
import type { Answer, Question } from "../../database/schemas";
import { questions, answers } from "../../database/schemas";

const nestAnswers = (rows: { question: Question; answer: Answer | null }[]) => {
  return pipe(
    rows,
    groupBy((row) => row.question.id),
    values,
    map((group) => ({
      ...group[0].question,
      answers: compact(group.map((item) => item.answer?.answer)),
    }))
  );
};

type getQuestionsProperties = {
  id?: string;
  playlistId?: string;
};

type gqContext = Context & {
  auth: {
    userId: string;
  };
};

export const getQuestions = async (
  context: gqContext,
  { playlistId, id }: getQuestionsProperties
) => {
  const rows = await context.database
    .select({
      question: questions,
      answer: answers,
    })
    .from(questions)
    .leftJoin(answers, eq(answers.questionId, questions.id))
    .where(
      and(
        eq(questions.userId, context.auth.userId),
        ...(id ? [eq(questions.id, id)] : []),
        ...(playlistId ? [eq(questions.playlistId, playlistId)] : [])
      )
    );

  return nestAnswers(rows);
};
