import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";
import "chartjs-plugin-annotation"; // Import the annotation plugin

const StockChart = ({ stockData, stockName }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null); // Ref for storing the chart instance

  useEffect(() => {
    // Destroy the previous chart before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (stockData && chartRef.current) {
      const dates = stockData.map((item) => item.Date.substring(0, 10));
      const closeValues = stockData.map((item) => item.Close);

      chartInstance.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: dates,
          datasets: [
            {
              label: "Closing Price",
              data: closeValues,
              backgroundColor: "rgba(0, 123, 255, 0.5)",
              borderColor: "rgba(0, 123, 255, 1)",
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
              // Add title configuration for x-axis
              title: {
                display: true,
                text: "Date",
              },
            },
          },
          // Title configuration
          plugins: {
            title: {
              display: true,
              text: stockName, // Title text
            },
          },
        },
      });
    }

    // Cleanup function to destroy chart
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [stockData]); // Dependency array to re-run the effect when stockData changes

  return <canvas ref={chartRef} width="800" height="400"></canvas>;
};

export default StockChart;
