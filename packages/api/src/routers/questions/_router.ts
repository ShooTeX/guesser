import { router } from "../../create-router";
import { get } from "./procedures/get";
import { edit } from "./procedures/edit";
import { create } from "./procedures/create";
import { addAnswers } from "./procedures/add-answers";
import { remove } from "./procedures/remove";

export const questionsRouter = router({
  get,
  create,
  addAnswers,
  edit,
  remove,
});
