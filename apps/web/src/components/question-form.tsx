import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createQuestionSchema } from "@guesser/schemas";
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
  const createMutation = api.questions.create.useMutation({
    onSuccess: () => {
      setOpen(false);
    },
  });

  const onSubmit = (data: CustomQuestion) => {
    createMutation.mutate(data);
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
          <Form
            onSubmit={onSubmit}
            isLoading={createMutation.isLoading}
            defaultValues={{
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

const customQuestionSchema = createQuestionSchema.extend({
  correctAnswerIdx: z.string(),
});

type CustomQuestion = z.infer<typeof customQuestionSchema>;

const Form = ({
  defaultValues,
  onSubmit,
  isLoading,
}: {
  defaultValues: CustomQuestion;
  onSubmit: (data: CustomQuestion) => void;
  isLoading?: boolean;
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
    const answers = data.answers.map((answer, index) => ({
      ...answer,
      correct: index === Number(data.correctAnswerIdx),
    }));

    onSubmit({ ...data, answers });
  });

  return (
    <form onSubmit={handleOnSubmit} className="mt-4 flex flex-col gap-4">
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
        <Button type="submit" disabled={!isValid || !isDirty || isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </SheetFooter>
    </form>
  );
};
