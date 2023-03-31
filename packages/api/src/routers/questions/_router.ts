import { router } from "../../create-router";
import { get } from "./procedures/get";
import { edit } from "./procedures/edit";
import { create } from "./procedures/create";
import { remove } from "./procedures/remove";

export const questionsRouter = router({
  get,
  create,
  edit,
  remove,
});
