import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createQuestionSchema, editQuestionSchema } from "@guesser/schemas";
import { z } from "zod";
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
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/trpc";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

export type QuestionFormProperties = PropsWithChildren &
  (
    | {
        type: "create";
        playlistId: string;
      }
    | { type: "edit"; questionId: string; playlistId: string }
  );

export const QuestionForm = ({
  children,
  ...properties
}: QuestionFormProperties) => {
  const [open, setOpen] = useState(false);
  const apiContext = api.useContext();

  const createMutation = api.questions.create.useMutation({
    onSuccess: (data) => {
      apiContext.questions.get.setData(
        { playlistId: properties.playlistId },
        (oldData) => (oldData ? [...oldData, data] : [data])
      );
      setOpen(false);
    },
  });

  const onSubmit = (data: CustomQuestion) => {
    if (data.type === "create") {
      createMutation.mutate(data);
    }
    if (data.type === "edit") {
      editMutation.mutate(data);
    }
  };

  const editMutation = api.questions.edit.useMutation({
    onSuccess: async (data) => {
      await apiContext.questions.get.invalidate({
        playlistId: properties.playlistId,
      });
      if (properties.type === "edit") {
        apiContext.questions.get.setData(
          {
            id: properties.questionId,
          },
          () => [data]
        );
      }
      setOpen(false);
    },
  });

  const deleteMutation = api.questions.remove.useMutation({
    onSuccess: async () => {
      await apiContext.questions.get.invalidate({
        playlistId: properties.playlistId,
      });
      setOpen(false);
    },
  });

  const { data: defaultValues } = api.questions.get.useQuery(
    { id: properties.type === "edit" ? properties.questionId : "" },
    {
      refetchOnWindowFocus: false,
      enabled: properties.type === "edit" && open,
      select: (data) => data[0],
    }
  );

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
          {properties.type === "create" && (
            <Form
              onSubmit={onSubmit}
              isLoading={createMutation.isLoading}
              defaultValues={{
                type: "create",
                playlistId: properties.playlistId,
                question: "",
                correctAnswerIdx: "0",
                answers: [
                  { answer: "", correct: false },
                  { answer: "", correct: false },
                  { answer: "", correct: false },
                  { answer: "", correct: false },
                ],
              }}
            />
          )}
          {properties.type === "edit" && (
            <>
              {defaultValues ? (
                <Form
                  key={defaultValues.id}
                  onSubmit={onSubmit}
                  isLoading={editMutation.isLoading}
                  isDeleteLoading={deleteMutation.isLoading}
                  onDelete={handleDelete}
                  defaultValues={{
                    ...defaultValues,
                    type: "edit",
                    correctAnswerIdx: defaultValues.answers
                      .findIndex((answer) => answer.correct)
                      .toString(),
                  }}
                />
              ) : (
                <Loader2 className="mx-auto h-80" />
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const customQuestionSchema = z.discriminatedUnion("type", [
  createQuestionSchema.extend({
    type: z.literal("create"),
    correctAnswerIdx: z.string(),
  }),
  editQuestionSchema.extend({
    type: z.literal("edit"),
    correctAnswerIdx: z.string(),
  }),
]);

type CustomQuestion = z.infer<typeof customQuestionSchema>;

const Form = ({
  defaultValues,
  onSubmit,
  isLoading,
  onDelete,
  isDeleteLoading,
}: {
  defaultValues: CustomQuestion;
  onSubmit: (data: CustomQuestion) => void;
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  isDeleteLoading?: boolean;
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<CustomQuestion>({
    resolver: zodResolver(customQuestionSchema),
    mode: "onChange",
    defaultValues,
  });

  const { fields } = useFieldArray({
    control,
    name: "answers",
  });

  const handleOnSubmit = handleSubmit((data) => {
    if (data.type === "create") {
      const answers = data.answers.map((answer, index) => ({
        ...answer,
        correct: index === Number(data.correctAnswerIdx),
      }));
      onSubmit({ ...data, answers });
    }

    if (data.type === "edit") {
      const answers = data.answers?.map((answer, index) => ({
        ...answer,
        correct: index === Number(data.correctAnswerIdx),
      }));
      onSubmit({ ...data, answers });
    }
  });

  return (
    <form onSubmit={handleOnSubmit} className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Textarea
          placeholder="What's the best programming language?"
          {...register("question")}
        />
        <div className="grid w-full gap-1.5">
          <Label htmlFor="markdown" className="flex items-center">
            Markdown <Badge className="ml-1">Experimental</Badge>
          </Label>
          <Textarea
            placeholder="Best for codeblocks"
            id="markdown"
            {...register("markdown")}
          />
        </div>
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
        {defaultValues.type === "edit" && onDelete && (
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading || isDeleteLoading}
            onClick={() => onDelete(defaultValues.id)}
          >
            {isDeleteLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </Button>
        )}
        <Button type="submit" disabled={!isValid || !isDirty || isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </SheetFooter>
    </form>
  );
};
