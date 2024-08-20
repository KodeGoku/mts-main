import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box } from '@mui/material';

type FeedbackFormProps = {
  open: boolean;
  onClose: () => void;
  onFeedbackSubmitted: () => void;
  testResult: {
    id: string;
    input_under_test: string;
    llm_output: string;
    criteria: string;
    auto_eval: string;
    auto_feedback: string;
    human_eval: number | null;
    human_feedback: string | null;
  };
};

const FeedbackForm: React.FC<FeedbackFormProps> = ({ open, onClose, onFeedbackSubmitted, testResult }) => {
  const [humanEval, setHumanEval] = useState<number | ''>(testResult.human_eval ?? '');
  const [humanFeedback, setHumanFeedback] = useState<string>(testResult.human_feedback ?? '');

  useEffect(() => {
    setHumanEval(testResult.human_eval ?? '');
    setHumanFeedback(testResult.human_feedback ?? '');
  }, [testResult]);

  const handleSubmit = async () => {
    const feedbackData = {
      id: testResult.id,
      human_eval: humanEval,
      human_feedback: humanFeedback,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/add_feedback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        // Notify the parent to re-fetch the test results and close the model.
        onFeedbackSubmitted();
        onClose();
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add Feedback</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="row" gap={2}>
          {/* Details Section */}
          <Box flex={1} p={2}>
            <Typography variant="h6">Test Result Details:</Typography>
            <Typography><strong>Input Under Test:</strong> {testResult.input_under_test}</Typography>
            <Typography><strong>LLM Output:</strong> {testResult.llm_output}</Typography>
            <Typography><strong>Criteria:</strong> {testResult.criteria}</Typography>
            <Typography><strong>Auto Eval:</strong> {testResult.auto_eval}</Typography>
            <Typography><strong>Auto Feedback:</strong> {testResult.auto_feedback}</Typography>
          </Box>
          {/* Form Section */}
          <Box flex={1} p={2}>
            <Typography variant="h6">Feedback Form</Typography>
            <TextField
              margin="dense"
              label="Human Evaluation"
              type="number"
              fullWidth
              variant="standard"
              value={humanEval}
              onChange={(e) => setHumanEval(parseFloat(e.target.value))}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Human Feedback"
              type="text"
              fullWidth
              variant="standard"
              value={humanFeedback}
              onChange={(e) => setHumanFeedback(e.target.value)}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackForm;
