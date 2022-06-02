function UnitChart(data, canvas, article) {
  const margin = {
      top: 30,
      right: 50,
      bottom: 100,
      left: 70,
    },
    width = canvas.attr("width") - margin.left - margin.right,
    height = canvas.attr("height") - margin.top - margin.bottom;

  const g = canvas.select("#figureGroup"),
    gx = canvas.select("#xAxisGroup"),
    gy = canvas.select("#yAxisGroup");

  const t = canvas.transition().duration(750);

  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr(
    "transform",
    `translate(${margin.left},${height + margin.top})`
  );
  gy.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);

  data.sort((a, b) => a.Date - b.Date);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([height, 0]);

  const xScale = d3
    .scaleTime()
    .domain(data.map(xValue))
    .domain(d3.extent(data, xValue))
    .range([0, width]);

  gx.transition(t)
    .attr("opacity", 1)
    .call(d3.axisBottom(xScale))
    .call((g) =>
      g
        .selectAll("text")
        .attr("transform", "rotate(15)")
        .style("text-anchor", "start")
    );

  gy.transition(t)
    .attr("opacity", 1)
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat(d3.format("~s"))
        .ticks(Math.round(width / 100))
    );

  g.selectAll("rect").transition(t).attr("width", 0).attr("height", 0).remove();

  const area0 = d3
    .area()
    .x((d) => xScale(xValue(d)))
    .y0((d) => yScale(yValue(d)))
    .y1((d) => yScale(yValue(d)));

  g.selectAll("path").transition(t).attr("d", area0).remove();

  const line = d3
    .line()
    .x((d) => xScale(xValue(d)))
    .y((d) => yScale(yValue(d)));

  g.append("path")
    .attr("stroke-width", 0)
    .transition(t)
    .attr("opacity", 1)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 5)
    .attr("d", line(data));
}

export { UnitChart };
