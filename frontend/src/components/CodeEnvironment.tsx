import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const CodeEnvironment = () => {
  // State variables for code, output, and validation message
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<string>('');

  // Fetch the last submitted code from the server
  useEffect(() => {
    const fetchLastCode = async () => {
      try {
        const response = await axios.get('/api/getLastCode');
        setCode(response.data.code);
      } catch (error: any) {
        console.error('Error fetching last code:', error);
      }
    };

    fetchLastCode();
  }, []);

  // Handle code editor changes
  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  // Test the code
  const testCode = async () => {
    try {
      setOutput('Loading...')
      const response = await axios.post('/api/execute', { code });
      setOutput(response.data.output);
      setValidationMessage('');
    } catch (error: any) {
      setOutput(error.response?.data?.detail || 'An error occurred');
      setValidationMessage('');
    }
  };

  // Submit the code
  const submitCode = async () => {
    setOutput('Loading...')
    if (!code.trim()) {
      setValidationMessage('Please enter code before submitting.');
      return;
    }
    try {
      const response = await axios.post('/api/submit', { code });
      setOutput(response.data.output);
      setValidationMessage('Code submitted successfully!');
    } catch (error: any) {
      setOutput(error.response?.data?.detail || 'An error occurred');
      setValidationMessage('Failed to submit code!');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-200 text-white">
      <div className="flex flex-grow">
        <div className="w-1/2 bg-slate-900 relative">
          <div className="p-4 flex justify-between items-center">
            <div className="text-2xl font-bold">Editor</div>
            <div>
              {/* Test Code button */}
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all mr-4"
                onClick={testCode}
              >
                Test Code
              </button>
              {/* Submit button */}
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
                onClick={submitCode}
              >
                Submit
              </button>
            </div>
          </div>
          {/* Code editor */}
          <Editor
            defaultLanguage="python"
            defaultValue="# Write your Python code here"
            onChange={handleEditorChange}
            options={{minimap: {enabled: false}}}
            value={code}
            theme="vs-dark"
          />
        </div>
        <div className="w-1/2 p-4 bg-slate-950 relative">
          {/* Output section title */}
          <div className="absolute top-8 left-8 text-2xl font-bold">Output</div>
          <div className="absolute top-24 left-8 right-4 overflow-y-auto text-white">
            {/* Validation message */}
            {(validationMessage !== '') && (
              <div className="pb-4 font-mono">{validationMessage}</div>
            )}
            {/* Output display */}
            <pre className="font-mono">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEnvironment;

