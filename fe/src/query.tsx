import { BACKEND_ENDPOINT } from "./constants";

type TestResult = {
  id: string;
  input_under_test: string;
  llm_output: string;
  criteria: string;
  auto_eval: number;
  auto_feedback: string;
  human_eval?: number;
  human_feedback?: string;
};

export async function getTestResults(): Promise<TestResult[]> {
  let requestOptions = {
    method: "GET",
  };
  let response = await fetch(
    `${BACKEND_ENDPOINT}/test_results/`,
    requestOptions
  );
  if (response.status !== 200) {
    let text = await response.text();
    throw new Error(text);
  }
  let response_json = await response.json();
  return response_json as TestResult[];
}

export async function getSummary(): Promise<string> {
  let requestOptions = {
    method: "GET",
  };
  let response = await fetch(
    `${BACKEND_ENDPOINT}/summarize/`,
    requestOptions
  );
  if (response.status !== 200) {
    let text = await response.text();
    throw new Error(text);
  }
  let response_json = await response.json();

  // Assuming the backend returns a 'summary' field in the response JSON
  return response_json.summary as string;
}
