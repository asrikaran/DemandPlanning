import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const SalesApp = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // January is 0
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null); // State to store the selected file

  // Function to handle form submission for the year/month selection
  const handleSubmit = async (endpoint) => {
    try {
      const response = await axios.get(`http://localhost:8080/sales/${endpoint}`, {
        params: { year, month },
      });

      // If response is empty, handle as no data
      if (!response.data) {
        setResult(null);
        setError(`No data available for ${year}-${month}`);
      } else {
        setResult(response.data); // Set the response data
        setError(null); // Clear error if the request is successful
      }
    } catch (err) {
      setError(err.response?.data || "Something went wrong"); // Set error message
      setResult(null); // Clear result in case of an error
    }
  };

  // Function to get the Best Sales Month for the selected year
  const handleBestSalesMonth = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/sales/bestSalesMonth`, {
        params: { year }, // Send the selected year as a query parameter
      });

      if (response.data) {
        // If the response is an object, stringify it for rendering
        if (typeof response.data === "object") {
          setResult(JSON.stringify(response.data, null, 2));
        } else {
          setResult(response.data); // If it's a string, render directly
        }
        setError(null); // Clear error
      } else {
        setResult(null);
        setError("No best sales month data available.");
      }
    } catch (err) {
      setError(err.response?.data || "Something went wrong"); // Set error message
      setResult(null); // Clear result in case of an error
    }
  };

  // Handle file change (uploading the file)
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Set the selected file
  };

  // Handle file upload (sending the file to the backend)
  const handleFileUpload = async () => {
    if (!file) {
      setError("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8080/sales/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(response.data); // Set the response data (success message)
      setError(null); // Clear any error
    } catch (err) {
      setError(err.response?.data || "Something went wrong during file upload");
      setResult(null); // Clear result in case of an error
    }
  };

  return (
    <div className="app-container">
      <h1>Sales Management</h1>

      {/* Year and Month Selection */}
      <div className="form-group">
        <label>
          Year:
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))} // Set selected year
          >
            {Array.from({ length: 10 }, (_, i) => {
              const currentYear = new Date().getFullYear();
              return (
                <option key={i} value={currentYear - i}>
                  {currentYear - i}
                </option>
              );
            })}
          </select>
        </label>

        <label>
          Month:
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))} // Set selected month
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })} {/* Month name */}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* File Upload */}
      <div className="form-group">
        <label>
          Upload CSV File:
          <input type="file" onChange={handleFileChange} accept=".csv" />
        </label>
        <button onClick={handleFileUpload}>Upload</button>
      </div>

      {/* Buttons to trigger API calls */}
      <div className="button-container">
        <button onClick={() => handleSubmit("predict")}>Predict Sales</button>
        <button onClick={() => handleSubmit("salesForMonth")}>Sales Per Month</button>
        <button onClick={() => handleSubmit("analyze")}>Analyze Month</button>
        <button onClick={handleBestSalesMonth}>Best Sales Month</button> {/* Best Sales Month button */}
      </div>

      {/* Display results or errors */}
      <div className="output-container">
        {result && (
          <div className="result-message">
            <h3>Result:</h3>
            {typeof result === "string" ? <p>{result}</p> : <pre>{result}</pre>}
          </div>
        )}
        {error && (
          <div className="error-message">
            <h3>Error:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesApp;
