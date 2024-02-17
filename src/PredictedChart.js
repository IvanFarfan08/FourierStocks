import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

const PredictedChart = ({ predictedData, stockData, stockName }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if ((predictedData, stockData) && chartRef.current) {
      const predictedDates = predictedData.map((item) =>
        item.Date.substring(0, 10)
      );
      const predictedValues = predictedData.map((item) => item.Predicted);

      const stockDates = stockData.map((item) => item.Date.substring(0, 10));
      const stockCloseValues = stockData.map((item) => item.Close);

      chartInstance.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: predictedDates, // Assuming both datasets have the same dates
          datasets: [
            {
              label: "Predicted Price",
              data: predictedValues,
              backgroundColor: "rgba(0, 123, 255, 0.5)",
              borderColor: "rgba(0, 123, 255, 1)",
              borderWidth: 1,
            },
            {
              label: "Actual Closing Price",
              data: stockCloseValues,
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              title: {
                display: true,
                text: "Price ($USD)",
              },
              beginAtZero: false,
            },
            x: {
              title: {
                display: true,
                text: "Date",
              },
            },
          },
          plugins: {
            title: {
              display: true,
              text: "Predicted vs Actual Prices for: " + stockName,
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [predictedData, stockData]); // Dependency array includes both data sets

  return <canvas ref={chartRef} width="800" height="400"></canvas>;
};

export default PredictedChart;
