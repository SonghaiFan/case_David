function ScatterPlot(data, canvas, article) {
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

  g.selectAll("path").transition(t).attr("opacity", 0).remove();

  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr(
    "transform",
    `translate(${margin.left},${height + margin.top})`
  );
  gy.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);

  const yValue = (d) => d.Confirmed;
  const xValue = (d) => d.Date;

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

  const syntaxElement = g
    .selectAll("rect")
    .data(data, (d) => [d["Province/State"], d.Date]);

  const r = 5;

  syntaxElement.join(
    (enter) =>
      enter
        .append("rect")
        .attr("fill", "red")
        .style("mix-blend-mode", "multiply")
        .attr("x", (d) => xScale(xValue(d)) - r / 2)
        .attr("y", (d) => yScale(yValue(d)) - r / 2)
        .call((enter) =>
          enter
            .transition(t)
            .attr("rx", r)
            .attr("ry", r)
            .attr("width", r)
            .attr("height", r)
        ),
    (update) =>
      update.call((update) =>
        update
          .transition(t)
          .attr("rx", r)
          .attr("ry", r)
          .attr("width", r)
          .attr("height", r)
          .attr("x", (d) => xScale(xValue(d)) - r / 2)
          .attr("y", (d) => yScale(yValue(d)) - r / 2)
      ),
    (exit) =>
      exit.call((exit) =>
        exit
          .transition(t)
          .attr("rx", 0)
          .attr("ry", 0)
          .attr("width", 0)
          .attr("height", 0)
      )
  );
}

export { ScatterPlot };
