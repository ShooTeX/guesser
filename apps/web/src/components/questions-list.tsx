import {
  ChevronFirst,
  ChevronLast,
  GripVertical,
  HelpCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { QuestionForm } from "./question-form";
import { Button } from "./ui/button";
import { api } from "@/lib/trpc";
import type { RouterOutput } from "@/lib/trpc";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
import React from "react";

const Empty = ({ playlistId }: { playlistId: string }) => {
  return (
    <div className="col-span-2 flex h-80 shrink-0 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700">
      <div className="mx-auto flex flex-col items-center justify-center text-center">
        <HelpCircle className="h-10 w-10 text-slate-400" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
          No questions created
        </h3>
        <p className="mt-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
          This playlist does not have any questions. Add one below.
        </p>
        <QuestionForm playlistId={playlistId} type="create">
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Create question
          </Button>
        </QuestionForm>
      </div>
    </div>
  );
};

const Item = ({
  question,
  onReorderTopClick,
  onReorderBottomClick,
}: {
  question: RouterOutput["questions"]["get"][0];
  onReorderTopClick: (id: string) => void;
  onReorderBottomClick: (id: string) => void;
}) => {
  return (
    <div className="rounded-md border border-slate-200 px-4 py-3 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center">
          <GripVertical className="mr-2 h-4 w-4" />
          <p className="font-bold">{question.question}</p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            onClick={() => onReorderTopClick(question.id)}
          >
            <ChevronFirst className="h-4 w-4 rotate-90" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => onReorderBottomClick(question.id)}
          >
            <ChevronLast className="h-4 w-4 rotate-90" />
          </Button>
          <QuestionForm
            type="edit"
            questionId={question.id}
            playlistId={question.playlistId}
          >
            <Button variant="subtle">Edit</Button>
          </QuestionForm>
        </div>
      </div>
      <Separator className="my-2" />
      <div className="grid grid-cols-2 gap-2">
        {question.answers.map((answer) => (
          <Button
            key={answer.id}
            variant="subtle"
            size="lg"
            className={cn(
              "pointer-events-none",
              answer.correct &&
                "bg-green-700 dark:bg-green-700 font-bold text-green-500 dark:text-green-50"
            )}
          >
            {answer.answer}
          </Button>
        ))}
      </div>
    </div>
  );
};

type QuestionsProperties = {
  playlistId: string;
};

export const QuestionsList = ({ playlistId }: QuestionsProperties) => {
  const apiContext = api.useContext();
  const { data, isLoading } = api.questions.get.useQuery(
    { playlistId },
    {
      onSuccess: (data) => {
        data.map((question) => {
          apiContext.questions.get.setData({ id: question.id }, () => [
            question,
          ]);
        });
      },
    }
  );

  const mutation = api.questions.reorder.useMutation();

  const reorderTop = (id: string) => {
    mutation.mutate({
      id,
      playlistId,
      order: 0,
    });
  };

  const reorderBottom = (id: string) => {
    if (!data) return;
    mutation.mutate({
      id,
      playlistId,
      order: data.length - 1,
    });
  };

  // TODO: skeleton?
  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700">
        <Loader2 className="mx-auto animate-spin"></Loader2>
      </div>
    );
  }

  if (!data?.length) {
    return <Empty playlistId={playlistId} />;
  }
  return (
    <>
      <div className="mt-4 flex flex-col items-end">
        <QuestionForm playlistId={playlistId} type="create">
          <Button size="lg">
            <Plus className="mr-1" /> Add new
          </Button>
        </QuestionForm>
      </div>
      <div className="mt-4 flex flex-col gap-8">
        {data.map((question) => (
          <Item
            question={question}
            key={question.id}
            onReorderTopClick={reorderTop}
            onReorderBottomClick={reorderBottom}
          />
        ))}
      </div>
    </>
  );
};
