import {
  ChevronFirst,
  ChevronLast,
  Grip,
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
import React, { useState } from "react";
import { compact } from "remeda";
import type { MotionProps } from "framer-motion";
import { Reorder, useDragControls } from "framer-motion";

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
  isLoading,
  onDragEnd,
}: {
  question: RouterOutput["questions"]["get"][0];
  isLoading?: boolean;
  onReorderTopClick: (id: string) => void;
  onReorderBottomClick: (id: string) => void;
  onDragEnd: MotionProps["onDragEnd"];
}) => {
  const dragControls = useDragControls();
  return (
    <Reorder.Item
      value={question}
      dragListener={false}
      dragControls={dragControls}
      className="rounded-md border border-slate-200 bg-slate-900 px-4 py-3 dark:border-slate-700"
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center">
          <div onPointerDown={(event) => dragControls.start(event)}>
            <Grip
              className={cn(
                "mr-2 h-4 w-4 cursor-grab text-slate-500",
                isLoading && "cursor-wait"
              )}
            />
          </div>
          <p className="font-bold">{question.question}</p>
        </div>
        <div className="flex gap-1">
          <Button
            disabled={isLoading}
            variant="ghost"
            onClick={() => onReorderTopClick(question.id)}
          >
            <ChevronFirst className="h-4 w-4 rotate-90" />
          </Button>
          <Button
            disabled={isLoading}
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
            <Button variant="subtle" disabled={isLoading}>
              Edit
            </Button>
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
    </Reorder.Item>
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
  const [reorderData, setReorderData] = useState<
    RouterOutput["questions"]["get"]
  >([]);

  if (
    data &&
    (data.length !== reorderData.length ||
      data.some(
        (upstreamQuestion) =>
          !reorderData.some((question) => question.id === upstreamQuestion.id)
      ) ||
      reorderData.some(
        (question) =>
          question.order !==
          data.find((upstreamQuestion) => upstreamQuestion.id === question.id)
            ?.order
      ))
  ) {
    setReorderData(data);
  }

  const mutation = api.questions.reorder.useMutation({
    onSuccess: (newData) => {
      apiContext.questions.get.setData({ playlistId }, (oldData) => {
        if (!oldData) return;
        return oldData
          .map((oldQuestion) => {
            return {
              ...oldQuestion,
              ...newData.find(
                (newQuestion) => newQuestion.id === oldQuestion.id
              ),
            };
          })
          .sort((a, b) => a.order - b.order);
      });
    },
  });

  const reorderTop = (id: string, index: number) => {
    if (index < 0 || index >= reorderData.length) {
      return;
    }
    setReorderData((oldData) => {
      return compact([
        oldData[index],
        ...oldData.slice(0, index),
        ...oldData.slice(index + 1),
      ]);
    });
    mutation.mutate({
      id,
      playlistId,
      order: 0,
    });
  };

  const reorderBottom = (id: string, index: number) => {
    if (!data || index < 0 || index >= reorderData.length) {
      return;
    }
    setReorderData((oldData) => {
      return compact([
        ...oldData.slice(0, index),
        ...oldData.slice(index + 1),
        oldData[index],
      ]);
    });
    mutation.mutate({
      id,
      playlistId,
      order: data.length - 1,
    });
  };

  const reorder = (id: string) => {
    const order = reorderData.findIndex((question) => question.id === id);
    console.log(order);
    if (
      !data ||
      order === -1 ||
      order === data.find((question) => question.id === id)?.order
    )
      return;
    mutation.mutate({
      id,
      playlistId,
      order,
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
      <Reorder.Group axis="y" values={reorderData} onReorder={setReorderData}>
        <div className="mt-4 flex flex-col gap-8">
          {reorderData.map((question, index) => (
            <Item
              key={question.id}
              question={question}
              onReorderTopClick={(id) => reorderTop(id, index)}
              onReorderBottomClick={(id) => reorderBottom(id, index)}
              isLoading={mutation.isLoading || isLoading}
              onDragEnd={() => reorder(question.id)}
            />
          ))}
        </div>
      </Reorder.Group>
    </>
  );
};
