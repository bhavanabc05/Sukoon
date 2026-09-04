import { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./PHQ4TrendChart.css";

function PHQ4TrendChart({ assessments }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!assessments || assessments.length < 2) {
      return;
    }

    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();

    const containerWidth = svgRef.current.parentElement.clientWidth;

    const width = Math.max(containerWidth, 500);
    const height = 300;

    const margin = {
      top: 25,
      right: 30,
      bottom: 55,
      left: 45,
    };

    const innerWidth = width - margin.left - margin.right;

    const innerHeight = height - margin.top - margin.bottom;

    const data = [...assessments]
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
      .map((assessment, index) => ({
        ...assessment,
        index,
        date: new Date(assessment.completedAt),
      }));

    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.index))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3.scaleLinear().domain([0, 12]).range([innerHeight, 0]);

    const chart = svg
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Horizontal grid lines
    chart
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .tickValues([0, 2, 4, 6, 8, 10, 12])
          .tickSize(-innerWidth)
          .tickFormat(""),
      )
      .selectAll("line")
      .attr("stroke", "#e5e7eb");

    // Y axis
    chart
      .append("g")
      .call(d3.axisLeft(y).tickValues([0, 2, 4, 6, 8, 10, 12]))
      .select(".domain")
      .remove();

    // X axis
    chart
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((index) => d3.timeFormat("%d %b")(data[index].date)),
      )
      .select(".domain")
      .remove();

    // Line
    const line = d3
      .line()
      .x((d) => x(d.index))
      .y((d) => y(d.score));

    chart
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Points
    chart
      .selectAll(".trend-point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "trend-point")
      .attr("cx", (d) => x(d.index))
      .attr("cy", (d) => y(d.score))
      .attr("r", 6)
      .attr("fill", "#6366f1")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Score labels
    chart
      .selectAll(".score-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "score-label")
      .attr("x", (d) => x(d.index))
      .attr("y", (d) => y(d.score) - 12)
      .attr("text-anchor", "middle")
      .text((d) => d.score);
  }, [assessments]);

  if (!assessments || assessments.length < 2) {
    return null;
  }

  return (
    <div className="phq4-trend">
      <div className="trend-header">
        <h2>PHQ-4 Progress</h2>

        <p>Your total PHQ-4 score across completed assessments.</p>
      </div>

      <div className="trend-chart-wrapper">
        <svg ref={svgRef}></svg>
      </div>

      <p className="trend-note">
        Lower scores indicate fewer symptoms reported on this screening measure.
      </p>
    </div>
  );
}

export default PHQ4TrendChart;
