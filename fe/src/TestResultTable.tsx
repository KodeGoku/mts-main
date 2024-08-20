import React, { useEffect, useState } from 'react';
import { getTestResults, getSummary } from './query';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControlLabel,
  Switch,
  CircularProgress,
  Pagination,
  TextField,
} from '@mui/material';
import FeedbackForm from './FeedbackForm';

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

const TestResultTable: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestResult, setSelectedTestResult] = useState<TestResult | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [filterEnabled, setFilterEnabled] = useState<boolean>(false);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const resultsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const offset = (page - 1) * resultsPerPage;
        const results = await getTestResults(offset, resultsPerPage, searchQuery);
        setTestResults(results.results);
        setTotalCount(results.total_count);
      } catch (error) {
        setError('Failed to load test results.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, searchQuery]);

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
        const offset = (page - 1) * resultsPerPage;
        const results = await getTestResults(offset, resultsPerPage, searchQuery);
        setTestResults(results.results);
        setTotalCount(results.total_count);
      } catch (error) {
        setError('Failed to load test results.');
      }
    };

    fetchData();
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterEnabled(event.target.checked);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleGetSummary = async () => {
    setLoadingSummary(true);
    try {
      const summaryResponse: string = await getSummary();
      setSummary(summaryResponse);
    } catch (error) {
      setError('Failed to fetch summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Button onClick={handleGetSummary} variant="contained" color="primary">
        Get Summary
      </Button>
      {loadingSummary ? (
        <CircularProgress />
      ) : (
        summary && <div>{summary}</div>
      )}
      <div style={{ margin: '20px 0' }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search word to filter the results"
          fullWidth
          style={{ marginBottom: '20px' }}
        />
        <FormControlLabel
          control={<Switch checked={filterEnabled} onChange={handleFilterChange} />}
          label="Show only mismatched evaluations"
        />
      </div>
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
            {testResults
              .filter(result => !filterEnabled || result.human_eval !== parseFloat(result.auto_eval.toString()))
              .map((result) => (
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
      <Pagination
        count={Math.ceil(totalCount / resultsPerPage)}
        page={page}
        onChange={(event, value) => setPage(value)}
        color="primary"
      />
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
