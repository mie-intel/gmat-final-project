// components/BarChart.js

import React from "react";
import { Bar } from "react-chartjs-2";

function BarChart({ chartData }) {
  return (
    <>
      hello
      <Bar data={chartData} />
    </>
  );
}

export default BarChart;
