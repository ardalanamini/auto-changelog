import { info, getInput, setOutput, setFailed } from "@actions/core";
import { context } from "@actions/github";

try {
  const token = getInput("token", { required: true });

  info(JSON.stringify(context.repo));

  setOutput("changelog", "Changelog");
} catch (error) {
  setFailed(error.message);
}
