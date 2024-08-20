import React, { useEffect, useState } from 'react';
import { getTestResults } from './query';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import FeedbackForm from './FeedbackForm';

type TestResult = {
  id: string;
  input_under_test: string;
  llm_output: string;
  criteria: string;
  auto_eval: string;
  auto_feedback: string;
};

const TestResultTable: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestResult, setSelectedTestResult] = useState<TestResult | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await getTestResults();
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
    // Re-fetch the test results after feedback submission
    const fetchData = async () => {
      try {
        const results = await getTestResults();
        setTestResults(results);
      } catch (error) {
        setError('Failed to load test results.');
      }
    };

    fetchData();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Input Under Test</TableCell>
              <TableCell>LLM Output</TableCell>
              <TableCell>Criteria</TableCell>
              <TableCell>Auto Eval</TableCell>
              <TableCell>Auto Feedback</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.input_under_test}</TableCell>
                <TableCell>{result.llm_output}</TableCell>
                <TableCell>{result.criteria}</TableCell>
                <TableCell>{result.auto_eval}</TableCell>
                <TableCell>{result.auto_feedback}</TableCell>
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
