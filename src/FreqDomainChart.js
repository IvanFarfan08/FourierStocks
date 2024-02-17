import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

const FreqDomainChart = ({ freqData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null); // Ref for storing the chart instance

  useEffect(() => {
    // Destroy the previous chart before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (freqData && chartRef.current) {
      const freqs = freqData.map((item) => item.frequency);
      const ampValues = freqData.map((item) => item.amplitude);

      chartInstance.current = new Chart(chartRef.current, {
        type: "scatter",
        data: {
          labels: freqs,
          datasets: [
            {
              label: "Frequency Domain",
              data: ampValues,
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
                text: "Amplitude ($USD)",
              },
              beginAtZero: false,
            },
            x: {
              // Add title configuration for x-axis
              title: {
                display: true,
                text: "Frequency (Days)",
              },
            },
          },
          // Title configuration
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Frequency Domain", // Title text
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
  }, [freqData]);

  return <canvas ref={chartRef} width="800" height="400"></canvas>;
};

export default FreqDomainChart;
