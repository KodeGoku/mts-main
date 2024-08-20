import React, { useState } from 'react';
import TestResultTable from './TestResultTable';
import { getSummary } from './query';

const App = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetSummary = async () => {
    try {
      const summaryText = await getSummary();
      setSummary(summaryText);
      setError(null);
    } catch (err) {
      setSummary(null);
      setError('Failed to fetch summary. Please try again.');
    }
  };

  return (
    <div>
      <h1>Test Results</h1>
      {summary && (
        <div>
          <h2>Summary of Common Errors:</h2>
          <p>{summary}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <TestResultTable />
    </div>
  );
};

export default App;
