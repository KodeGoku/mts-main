import { BACKEND_ENDPOINT } from "./constants";

type TestResult = {
  input_under_test: string;
  llm_output: string;
  criteria: string;
  auto_eval: string;
  auto_feedback: string;
};

export async function getTestResults() {
  let requestOptions = {
    method: "POST",
  };
  let response = await fetch(
    `${BACKEND_ENDPOINT}/test_results/`,
    requestOptions
  );
  if (response.status != 200) {
    let text = await response.text();
    throw Error(text);
  }
  let response_json = await response.json();
  return response_json as TestResult[];
}
