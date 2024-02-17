import React, { useState } from "react";
import "./App.css";
import StockChart from "./StockChart";
import FreqDomainChart from "./FreqDomainChart";
import DominantFreqChart from "./DominantFreqChart";
import PredictedChart from "./PredictedChart";
import CardLayout from "./CardLayout";

function App() {
  //State hook for managing the ticker and stock data.
  // Define [variable, updater function] and then set the initial value.
  const [ticker, setTicker] = useState("");
  const [stockData, setStockData] = useState(null);
  const [stockName, setStockName] = useState("");
  const [freqData, setFreqData] = useState(null);
  const [DomFreqData, setDomFreqData] = useState(null);
  const [predictedData, setPredictedData] = useState(null);

  // Async function to fetch stock data
  const fetchStockData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/getStockData/${ticker}`
      );
      if (!response.ok) {
        console.error(`Error: Received status code ${response.status}`);
        setStockData(null);
        return;
      }
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setStockData(null);
    }
  };

  const fetchStockName = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/getStockName/${ticker}`
      );
      if (!response.ok) {
        console.error(`Error: Received status code ${response.status}`);
        setStockName("");
        return;
      }
      const name = await response.text();
      setStockName(name);
    } catch (error) {
      console.error("Error fetching stock name:", error);
      setStockName("");
    }
  };

  const fetchFrequencyDom = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/getFrequencyDom/${ticker}`
      );
      if (!response.ok) {
        console.error(`Error: Received status code ${response.status}`);
        setFreqData(null);
        return;
      }
      const data = await response.json();
      setFreqData(data);
    } catch (error) {
      console.error("Error fetching frequency domain data:", error);
      setFreqData(null);
    }
  };

  const fetchDominantFreq = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/getDominantFreq/${ticker}`
      );
      if (!response.ok) {
        console.error(`Error: Received status code ${response.status}`);
        setDomFreqData(null);
        return;
      }
      const data = await response.json();
      setDomFreqData(data);
    } catch (error) {
      console.error("Error fetching dominant frequency data:", error);
      setDomFreqData(null);
    }
  };

  const fetchPredictedData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/getPredictedData/${ticker}`
      );
      if (!response.ok) {
        console.error(`Error: Received status code ${response.status}`);
        setPredictedData(null);
        return;
      }
      const data = await response.json();
      setPredictedData(data);
    } catch (error) {
      console.error("Error fetching predicted data:", error);
      setPredictedData(null);
    }
  };

  const handleGetDataClick = async () => {
    await Promise.all([
      fetchStockData(),
      fetchStockName(),
      fetchFrequencyDom(),
      fetchDominantFreq(),
      fetchPredictedData(),
    ]);
  };

  //   return (
  //     <div className="App">
  //       <h1>Stock Viewer</h1>
  //       <input
  //         type="text"
  //         value={ticker}
  //         onChange={(e) => setTicker(e.target.value)}
  //         placeholder="Enter Ticker Symbol"
  //       />
  //       <button onClick={handleGetDataClick}>Get Data</button>

  // {
  //   stockData && (
  //     <div>
  //       <StockChart stockData={JSON.parse(stockData)} stockName={stockName} />
  //     </div>
  //   );
  // }

  // {freqData && (
  //   <div>
  //     <FreqDomainChart freqData={JSON.parse(freqData)} />
  //   </div>
  // )}

  //       {DomFreqData && (
  //         <div>
  //           <DominantFreqChart DomFreqData={JSON.parse(DomFreqData)} />
  //         </div>
  //       )}

  // {predictedData && stockData && (
  //   <div>
  //     <PredictedChart
  //       predictedData={JSON.parse(predictedData)}
  //       stockData={JSON.parse(stockData)}
  //       stockName={stockName}
  //     />
  //   </div>
  //       )}
  //     </div>
  //   );
  // }

  return (
    <div className="App">
      <div className="AppGlass">
        <CardLayout
          ticker={ticker}
          setTicker={setTicker}
          onGetData={handleGetDataClick}
          stockData={stockData} // Pass stockData to CardLayout
          stockName={stockName} // Pass stockName to CardLayout
          freqData={freqData}
          DomFreqData={DomFreqData}
          predictedData={predictedData}
        />
      </div>
    </div>
  );
}

export default App;
