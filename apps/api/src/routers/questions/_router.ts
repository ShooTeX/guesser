import { router } from "@/trpc/create-router";
import { get } from "./procedures/get";
import { edit } from "./procedures/edit";
import { create } from "./procedures/create";
import { remove } from "./procedures/remove";
import { reorder } from "./procedures/reorder";

export const questionsRouter = router({
  get,
  create,
  edit,
  remove,
  reorder,
});
