// components/BarChart.js

import React from "react";
import { Line } from "react-chartjs-2";

function LineChart({ chartData, title }) {
  return (
    <>
      <Line
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: title,
              align: "start",
              font: {
                weight: "bold",
                style: "italic",
                size: 20,
              },
            },
            subtitle: {
              display: true,
              text: "time",
              position: "bottom",
              font: {
                size: 18,
              },
            },
            legend: {
              display: true,
              align: "end",
              font: {
                weight: "bold",
                style: "italic",
                size: 12,
              },
            },
          },
        }}
      />
    </>
  );
}

export default LineChart;
