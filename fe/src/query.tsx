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

type GetTestResultsResponse = {
  results: TestResult[];
  total_count: number;
};

export async function getTestResults(offset: number = 0, limit: number = 10, keyword?: string): Promise<GetTestResultsResponse> {
  let queryParams = `offset=${offset}&limit=${limit}`;
  if (keyword) {
    queryParams += `&keyword=${encodeURIComponent(keyword)}`;
  }

  let requestOptions = {
    method: "GET",
  };
  let response = await fetch(
    `${BACKEND_ENDPOINT}/test_results/?${queryParams}`,
    requestOptions
  );
  if (response.status !== 200) {
    let text = await response.text();
    throw new Error(text);
  }
  let response_json = await response.json();
  return response_json as GetTestResultsResponse;
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
  return response_json.summary as string;
}
