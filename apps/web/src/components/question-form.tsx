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
import { Loader2 } from "lucide-react";

export type QuestionFormProperties = PropsWithChildren & {
  playlistId: string;
  order: number;
};

const customQuestionSchema = createQuestionSchema.extend({
  correctAnswerIdx: z.string(),
});

type CustomQuestion = z.infer<typeof customQuestionSchema>;

export const QuestionForm = ({
  playlistId,
  order,
  children,
}: QuestionFormProperties) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<CustomQuestion>({
    resolver: zodResolver(customQuestionSchema),
    mode: "onChange",
    defaultValues: {
      playlistId,
      order,
      answers: [{ answer: "" }, { answer: "" }, { answer: "" }, { answer: "" }],
      correctAnswerIdx: "0",
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "answers",
  });

  const mutation = api.questions.create.useMutation();

  const onSubmit = handleSubmit((data) => {
    const answers = data.answers.map((answer, index) => ({
      ...answer,
      correct: index === Number(data.correctAnswerIdx),
    }));
    mutation.mutate({ ...data, answers });
  });

  return (
    <Sheet>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent size="content">
        <SheetHeader>
          <SheetTitle>New question</SheetTitle>
          <SheetDescription>Add a new question</SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="mt-4 flex w-80 flex-col gap-4">
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
              disabled={!isValid || !isDirty || mutation.isLoading}
            >
              {mutation.isLoading && (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
