import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

const DominantFreqChart = ({ DomFreqData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (DomFreqData && chartRef.current) {
      // Format the data correctly for a scatter chart
      const chartData = DomFreqData.map((item) => ({
        x: item.frequency,
        y: item.amplitude,
      }));

      chartInstance.current = new Chart(chartRef.current, {
        type: "scatter",
        data: {
          datasets: [
            {
              label: "Dominant Frequency Domain",
              data: chartData,
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
            },
            x: {
              title: {
                display: true,
                text: "Frequency (Days)",
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Dominant Frequency Domain (Dominant & Positive)",
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
  }, [DomFreqData]); // Adding DomFreqData as a dependency

  return <canvas ref={chartRef} width="800" height="400"></canvas>;
};

export default DominantFreqChart;
