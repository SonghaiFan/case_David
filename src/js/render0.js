function initialRender0(canvas) {
  const margin = {
      top: 30,
      right: 100,
      bottom: 50,
      left: 200,
    },
    width = canvas.attr("width") - margin.left - margin.right,
    height = canvas.attr("height") - margin.top - margin.bottom;

  canvas
    .append("g")
    .attr("id", "figureGroup")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  canvas
    .append("g")
    .attr("id", "xAxisGroup")
    .attr("transform", `translate(${margin.left},${height + margin.top})`);
  canvas
    .append("g")
    .attr("id", "yAxisGroup")
    .attr("transform", `translate(${margin.left},${margin.top})`);
}

function HorizontalBarChart(data, canvas, article) {
  const margin = {
      top: 30,
      right: 100,
      bottom: 50,
      left: 200,
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

  const xValue = (d) => d.Confirmed;
  const yValue = (d) => d["Province/State"];

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, xValue)])
    .range([0, width]);

  const yScale = d3
    .scaleBand()
    .domain(data.map(yValue))
    .range([height, 0])
    .padding(0.1);

  gx.transition(t)
    .attr("opacity", 1)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat(d3.format("~s"))
        .ticks(Math.round(width / 100))
    );

  gy.transition(t).attr("opacity", 1).call(d3.axisLeft(yScale));

  const syntaxElement = g
    .selectAll("rect")
    .data(data, (d) => d["Province/State"]);

  syntaxElement.join(
    (enter) =>
      enter
        .append("rect")
        .attr("fill", "red")
        .style("mix-blend-mode", "multiply")
        .attr("x", 0)
        .attr("height", yScale.bandwidth)
        .attr("width", 0)
        .call((enter) =>
          enter
            .transition(t)
            .attr("y", (d) => yScale(yValue(d)))
            .transition(t)
            .attr("width", (d) => xScale(xValue(d)))
        ),
    (update) =>
      update.call((update) =>
        update
          .transition(t)
          .attr("height", yScale.bandwidth)
          .attr("y", (d) => yScale(yValue(d)))
          .transition(t)
          .attr("x", 0)
          .attr("width", (d) => xScale(xValue(d)))
      ),
    (exit) => exit.call((exit) => exit.transition(t).attr("width", 0).remove())
  );
}

function VerticalBarChart(data, canvas, article) {
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

  g.selectAll("path").remove();

  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr(
    "transform",
    `translate(${margin.left},${height + margin.top})`
  );
  gy.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);

  const yValue = (d) => d.Confirmed;
  const xValue = (d) => d["Province/State"];

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([height, 0]);

  const xScale = d3
    .scaleBand()
    .domain(data.map(xValue))
    .range([0, width])
    .padding(0.4);

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
    .data(data, (d) => d["Province/State"]);

  syntaxElement.join(
    (enter) =>
      enter
        .append("rect")
        .attr("fill", "red")
        .style("mix-blend-mode", "multiply")
        .attr("y", height)
        .call((enter) =>
          enter
            .transition(t)
            .attr("width", xScale.bandwidth)
            .attr("x", (d) => xScale(xValue(d)))
            .transition(t)
            .attr("y", (d) => yScale(yValue(d)))
            .attr("height", (d) => height - yScale(yValue(d)))
        ),
    (update) =>
      update.call((update) =>
        update
          .transition(t)
          .attr("rx", 0)
          .attr("ry", 0)
          .attr("width", xScale.bandwidth)
          .attr("x", (d) => xScale(xValue(d)))
          .transition(t)
          .attr("y", (d) => yScale(yValue(d)))
          .attr("height", (d) => height - yScale(yValue(d)))
      ),
    (exit) =>
      exit.call((exit) =>
        exit.transition(t).attr("height", 0).attr("y", height).remove()
      )
  );
}

export { initialRender0, HorizontalBarChart, VerticalBarChart };
