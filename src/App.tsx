import React, { useEffect, useState } from "react";
import logo from './logo.svg';
import './App.css';

function App() {

  const [quote, setQuote] = useState({ quote: "", by: "" });

  // Function to collect data

  const getApiData = async () => {
    const response = await fetch(
      "http://localhost:7000/api/randomquote"
    ).then(response => response.json())
    const q = response.quote;
    setQuote({ quote: q.quote, by: q.by });
  };

  useEffect(() => {
    getApiData();
  }, [setQuote]);

  const handleClick = () => {
    // update the books state property by adding a new book
    getApiData();
  }


  return (
    <div className="App">
      <div className="container">
        <div className="jumbotron">
          <h1 className="display-4">Quotes</h1>
        </div>
        <div className="card">
          <div className="card-header">
            <q> <b> {quote.quote}</b> </q>
            <br />

            by : {quote.by}
          </div>
        </div>
        <button className="text-center" onClick={handleClick}>Get Quote</button>
      </div>
    </div>
  );
}

export default App;
