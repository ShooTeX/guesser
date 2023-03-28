import { Label } from "@radix-ui/react-label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";

export const QuestionForm = () => {
  return (
    <div className="flex w-80 flex-col gap-4">
      <div className="grid w-full gap-1.5">
        <Label htmlFor="message">Question</Label>
        <Textarea
          placeholder="What's the best programming language?"
          id="message"
        />
      </div>
      <RadioGroup defaultValue="option-one">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-one" id="option-one" />
          <div className="relative w-full">
            <div className="absolute left-2 flex h-full items-center">
              <div className="flex h-5 w-5 rounded-md bg-slate-700 font-mono text-sm font-bold leading-none text-slate-200">
                <span className="m-auto">A</span>
              </div>
            </div>
            <Input placeholder="Answer..." className="pl-9" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-two" id="option-two" />
          <div className="relative w-full">
            <div className="absolute left-2 flex h-full items-center">
              <div className="flex h-5 w-5 rounded-md bg-slate-700 font-mono text-sm font-bold leading-none text-slate-200">
                <span className="m-auto">B</span>
              </div>
            </div>
            <Input className="pl-9" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-three" id="option-two" />
          <div className="relative w-full">
            <div className="absolute left-2 flex h-full items-center">
              <div className="flex h-5 w-5 rounded-md bg-slate-700 font-mono text-sm font-bold leading-none text-slate-200">
                <span className="m-auto">C</span>
              </div>
            </div>
            <Input className="pl-9" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-four" id="option-two" />
          <div className="relative w-full">
            <div className="absolute left-2 flex h-full items-center">
              <div className="flex h-5 w-5 rounded-md bg-slate-700 font-mono text-sm font-bold leading-none text-slate-200">
                <span className="m-auto">D</span>
              </div>
            </div>
            <Input className="pl-9" />
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};
