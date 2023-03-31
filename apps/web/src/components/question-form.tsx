import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createQuestionSchema } from "@guesser/schemas";
import { z } from "zod";
import { api } from "@/lib/trpc";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetFooter,
  SheetTitle,
} from "./ui/sheet";
import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

export type QuestionFormProperties = PropsWithChildren &
  (
    | {
        type: "create";
        playlistId: string;
      }
    | { type: "edit"; questionId: string; playlistId: string }
  );

const customQuestionSchema = createQuestionSchema.extend({
  correctAnswerIdx: z.string(),
});

type CustomQuestion = z.infer<typeof customQuestionSchema>;

export const QuestionForm = ({
  children,
  ...properties
}: QuestionFormProperties) => {
  return (
    <Sheet>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent size="content">
        <SheetHeader>
          {properties.type === "create" && (
            <>
              <SheetTitle>New question</SheetTitle>
              <SheetDescription>Add a new question</SheetDescription>
            </>
          )}
          {properties.type === "edit" && (
            <>
              <SheetTitle>Edit question</SheetTitle>
              <SheetDescription>
                Edit your question, click save when you&apos;re done.
              </SheetDescription>
            </>
          )}
        </SheetHeader>
        <div className="w-80">
          <Form
            {...properties}
            key={properties.type === "edit" ? properties.questionId : "create"}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Form = (properties: QuestionFormProperties) => {
  const utils = api.useContext();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isValid, isDirty },
  } = useForm<CustomQuestion>({
    resolver: zodResolver(customQuestionSchema),
    mode: "onChange",
    defaultValues:
      properties.type === "create"
        ? {
            playlistId: properties.playlistId,
            answers: [
              { answer: "" },
              { answer: "" },
              { answer: "" },
              { answer: "" },
            ],
            correctAnswerIdx: "0",
          }
        : {},
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "answers",
  });

  const createMutation = api.questions.create.useMutation({
    onSuccess: async () => {
      if (properties.type === "create") {
        await utils.questions.get.invalidate({
          playlistId: properties.playlistId,
        });
      }
      reset();
    },
  });
  const editMutation = api.questions.edit.useMutation();

  const onSubmit = handleSubmit((data) => {
    const answers = data.answers.map((answer, index) => ({
      ...answer,
      correct: index === Number(data.correctAnswerIdx),
    }));
    createMutation.mutate({ ...data, answers });
  });

  const { data, isInitialLoading } = api.questions.get.useQuery(
    {
      id: properties.type === "edit" ? properties.questionId : "",
    },
    {
      initialData: () => {
        if (properties.type !== "edit") return;
        const cache = utils.questions.get.getData({
          playlistId: properties.playlistId,
        });
        if (!cache) return;
        return [
          cache.find((question) => question.id === properties.questionId),
        ];
      },
      staleTime: 1000,
      refetchOnWindowFocus: false,
      enabled: properties.type === "edit",
      select: (data) => {
        return data[0];
      },
    }
  );

  useMemo(() => {
    if (!data) return;
    reset({
      playlistId: data.playlistId,
      question: data.question,
      correctAnswerIdx: data.answers
        .findIndex((answer) => answer.correct)
        .toString(),
    });

    replace(data.answers);
  }, [data, reset, replace]);

  return (
    <>
      {isInitialLoading && (
        <div className="flex justify-center p-5">
          <Loader2 className="animate-spin" />
        </div>
      )}
      {!isInitialLoading && (
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="What's the best programming language?"
              id="message"
              {...register("question")}
            />
            <Controller
              control={control}
              name="correctAnswerIdx"
              render={({ field: { onChange, ...field } }) => (
                <RadioGroup onValueChange={onChange} {...field}>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={`${index}`} />
                      <div className="relative w-full">
                        <div className="absolute left-2 flex h-full items-center">
                          <div className="flex h-5 w-5 rounded-md bg-slate-700 font-mono text-sm font-bold leading-none text-slate-200">
                            <span className="m-auto uppercase">
                              {String.fromCodePoint(97 + index)}
                            </span>
                          </div>
                        </div>
                        <Input
                          className="pl-9"
                          key={field.id}
                          {...register(`answers.${index}.answer`)}
                        />
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>
          <SheetFooter>
            <Button
              type="submit"
              disabled={!isValid || !isDirty || createMutation.isLoading}
            >
              {createMutation.isLoading && (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </SheetFooter>
        </form>
      )}
    </>
  );
};
