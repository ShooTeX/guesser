import { get } from "./procedures/get";
import { edit } from "./procedures/edit";
import { create } from "./procedures/create";
import { remove } from "./procedures/remove";
import { reorder } from "./procedures/reorder";
import { router } from "../../trpc/create-router";

export const questionsRouter = router({
  get,
  create,
  edit,
  remove,
  reorder,
});
