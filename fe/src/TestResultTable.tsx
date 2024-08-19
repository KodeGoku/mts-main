//Added this file for the table to display the test results

import React, { useEffect, useState } from 'react';
import { getTestResults } from './query';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

type TestResult = {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Input Under Test</TableCell>
            <TableCell>LLM Output</TableCell>
            <TableCell>Criteria</TableCell>
            <TableCell>Auto Eval</TableCell>
            <TableCell>Auto Feedback</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {testResults.map((result, index) => (
            <TableRow key={index}>
              <TableCell>{result.input_under_test}</TableCell>
              <TableCell>{result.llm_output}</TableCell>
              <TableCell>{result.criteria}</TableCell>
              <TableCell>{result.auto_eval}</TableCell>
              <TableCell>{result.auto_feedback}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TestResultTable;
