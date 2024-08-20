import React, { useEffect, useState } from 'react';
import { getTestResults } from './query';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, FormControlLabel, Switch } from '@mui/material';
import FeedbackForm from './FeedbackForm';

type TestResult = {
  id: string;
  input_under_test: string;
  llm_output: string;
  criteria: string;
  auto_eval: string;
  auto_feedback: string;
  human_eval: number | null;
  human_feedback: string | null;
};

const TestResultTable: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestResult, setSelectedTestResult] = useState<TestResult | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [filterEnabled, setFilterEnabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results: TestResult[] = await getTestResults();
        setTestResults(results);
      } catch (error) {
        setError('Failed to load test results.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenForm = (result: TestResult) => {
    setSelectedTestResult(result);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedTestResult(null);
  };

  const handleFeedbackSubmitted = () => {
    const fetchData = async () => {
      try {
        const results: TestResult[] = await getTestResults();
        setTestResults(results);
      } catch (error) {
        setError('Failed to load test results.');
      }
    };

    fetchData();
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterEnabled(event.target.checked);
  };

  const filteredResults = filterEnabled
    ? testResults.filter(result => result.human_eval !== parseFloat(result.auto_eval))
    : testResults;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <FormControlLabel
        control={<Switch checked={filterEnabled} onChange={handleFilterChange} />}
        label="Show only mismatched evaluations"
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Input Under Test</TableCell>
              <TableCell>LLM Output</TableCell>
              <TableCell>Criteria</TableCell>
              <TableCell>Auto Eval</TableCell>
              <TableCell>Auto Feedback</TableCell>
              <TableCell>Human Eval</TableCell>
              <TableCell>Human Feedback</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.input_under_test}</TableCell>
                <TableCell>{result.llm_output}</TableCell>
                <TableCell>{result.criteria}</TableCell>
                <TableCell>{result.auto_eval}</TableCell>
                <TableCell>{result.auto_feedback}</TableCell>
                <TableCell>{result.human_eval ?? 'N/A'}</TableCell>
                <TableCell>{result.human_feedback || 'N/A'}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenForm(result)}>Add Feedback</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedTestResult && (
        <FeedbackForm
          open={formOpen}
          onClose={handleCloseForm}
          onFeedbackSubmitted={handleFeedbackSubmitted}
          testResult={selectedTestResult}
        />
      )}
    </>
  );
};

export default TestResultTable;
