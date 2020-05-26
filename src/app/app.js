import { select } from "d3-selection";
import { json } from "d3-fetch";
import { extent, min, max } from "d3-array";
import { timeParse, timeFormat } from "d3-time-format";
import { scaleOrdinal, scaleTime } from "d3-scale";
import { schemeSet1 } from "d3-scale-chromatic";
import { axisBottom, axisLeft } from "d3-axis";
import localApiData from "../data/data";

import "./app.scss";

const margins = { top: 75, right: 25, bottom: 50, left: 75 };
const svgW = 1060 - margins.left - margins.right;
const svgH = 625 - margins.top - margins.bottom;
const dataUrl =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const fetchData = async () => {
  let res = null;

  try {
    res = await json(dataUrl);
    return res;
  } catch (e) {
    console.error(e.message);
  }

  return res;
};

const runApp = async () => {
  select(".js-d3").html("");

  const svgElem = select(".js-d3")
    .append("svg")
    .attr("width", svgW + margins.left + margins.right)
    .attr("height", svgH + margins.top + margins.bottom)
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`);

  let dataset = await fetchData();
  if (!dataset) dataset = localApiData;

  const yearDates = dataset.map((d) => new Date(`${d.Year}`));

  const xMin = new Date(min(yearDates));
  const xMax = new Date(max(yearDates));

  // Create domain padding for scatter points
  xMin.setFullYear(xMin.getFullYear() - 1);
  xMax.setFullYear(xMax.getFullYear() + 1);

  const xScale = scaleTime().domain([xMin, xMax]).range([0, svgW]);
  const xAxis = axisBottom(xScale);

  // xAxisGroup
  svgElem
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${svgH})`);

  const finishTimes = dataset.map((d) => d.Time);
  const specifier = "%M:%S";
  const parsedTimes = finishTimes.map((item) => timeParse(specifier)(item));

  const yScale = scaleTime().domain(extent(parsedTimes)).range([0, svgH]);
  const yAxis = axisLeft(yScale).tickFormat(timeFormat(specifier));

  // yAxisGroup
  svgElem.append("g").call(yAxis).attr("id", "y-axis");

  svgElem
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -180)
    .attr("y", -45)
    .attr("class", "yLabel")
    .text("Finish Time (mins)");

  const colorScale = scaleOrdinal(schemeSet1);

  // Tooltip container
  const tooltip = select(".js-wrapper")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

  svgElem
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d, i) => xScale(yearDates[i]))
    .attr("cy", (d, i) => yScale(parsedTimes[i]))
    .attr("r", 6)
    .style("fill", (d) => colorScale(d.Doping !== ""))
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d, i) => parsedTimes[i].toISOString())
    .on("mouseover", function showTooltip(d) {
      const pos = select(this).node().getBoundingClientRect();
      tooltip.attr("data-year", d.Year);
      tooltip.style("opacity", 0.9);
      tooltip
        .html(
          `${d.Name}: ${d.Nationality} <br/> Year: ${d.Year}, Time: ${d.Time} ${
            d.Doping ? `<br/> ${d.Doping}` : ``
          }`
        )
        .style("left", `${pos.x}px`)
        .style("top", `${window.pageYOffset + pos.y + 16}px`);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  const legendContainer = svgElem.append("g").attr("id", "legend");

  const legend = legendContainer
    .selectAll("#legend")
    .data(colorScale.domain())
    .enter()
    .append("g")
    .attr("transform", (d, i) => {
      return `translate(0, ${svgH / 2 - i * 20 - 16})`;
    });

  legend
    .append("rect")
    .attr("x", svgW - 16)
    .attr("width", 16)
    .attr("height", 16)
    .style("fill", colorScale);

  legend
    .append("text")
    .attr("x", svgW - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .attr("class", "legend-text")
    .text((d) => (d ? "Doping Case" : "No Doping Case"));
};

export default runApp;
