async function DotPlot(aqdata, container) {
  const { width, height } = container.node().getBoundingClientRect();

  const primary_color = getComputedStyle(
    document.documentElement
  ).getPropertyValue("--primary");

  const { h, s, l } = d3.hsl(primary_color);
  Math.round(h);

  console.log(d3.hsl(primary_color));

  const margin = {
      top: 200,
      right: 30,
      bottom: 200,
      left: 30,
    },
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;

  const data = aqdata
    .select("date", "year", "day_of_year", "value_final")
    .groupby("year")
    .orderby(aq.desc("date"))
    .objects();

  console.log(data);

  const svg = container.select("svg");
  const tooltip = container.select("#tooltipContainer");

  const smart_duration = data.length < 100 ? 1500 : 750;

  const t = svg.transition().duration(smart_duration);
  const t2 = t.transition().duration(smart_duration);

  const usedLayters = ["figureLayer1", "xAxisLayer", "yAxisLayer"];

  const layers = svg
    .selectAll("g")
    .data(usedLayters, (d) => d)
    .join(
      (enter) => enter,
      (update) => update.classed("is-active", true),
      (exit) => exit.classed("is-active", false)
    );

  const g1 = svg.select(".figureLayer1"),
    gx = svg.select(".xAxisLayer"),
    gy = svg.select(".yAxisLayer");

  g1.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr(
    "transform",
    `translate(${margin.left},${innerHeight + margin.top})`
  );
  gy.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);

  // data.sort((a, b) => a.date - b.date);

  const xValue = (d) => d.day_of_year;
  const yValue = (d) => d.value_final;
  const colorValue = (d) => d.year;

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([innerHeight, 0]);

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth]);

  // const colorScale = d3
  //   .scaleSequentialPow()
  //   .exponent(8)
  //   .domain([1910, 2022])
  //   .interpolator(d3.interpolateReds);

  const colorScale = d3
    .scaleSequential()
    .domain([1900, 2050])
    .interpolator(d3.interpolateReds);

  gx.transition(t).call(d3.axisBottom(xScale));

  gy.transition(t).call(
    d3
      .axisLeft(yScale)
      .tickFormat(d3.format("~s"))
      .ticks(Math.round(width / 100))
  );

  const mark_size = 15;

  const temp_rect = g1
    .selectAll("rect")
    .data(data, (d) => `${d.year}_${d.day_of_year}`);

  temp_rect.join(
    (enter) =>
      enter
        .append("rect")
        .attr("class", "temp_rect")
        .style("fill", (d) => colorScale(colorValue(d)))
        .attr("id", (d) => `temp_rect_${d.year}_${d.day_of_year}`)
        .attr("rx", (d) => mark_size)
        .attr("ry", (d) => mark_size)
        .attr("width", (d) => mark_size)
        .attr("height", (d) => mark_size)
        .attr("x", (d) => xScale(xValue(d)) - mark_size / 2)
        .attr("y", (d) => yScale(yValue(d)) - mark_size / 2)
        .call((enter) =>
          enter
            .transition(t)
            .attr("rx", (d) => mark_size)
            .attr("ry", (d) => mark_size)
            .attr("width", (d) => mark_size)
            .attr("height", (d) => mark_size)
            .attr("x", (d) => xScale(xValue(d)) - mark_size / 2)
            .attr("y", (d) => yScale(yValue(d)) - mark_size / 2)
        ),
    (update) =>
      update.call((update) =>
        update
          .transition(t)
          .style("fill", (d) => colorScale(colorValue(d)))
          .attr("width", (d) => mark_size)
          .attr("height", (d) => mark_size)
          .attr("rx", (d) => mark_size)
          .attr("ry", (d) => mark_size)
          .attr("x", (d) => xScale(xValue(d)) - mark_size / 2)
          .attr("y", (d) => yScale(yValue(d)) - mark_size / 2)
      ),
    (exit) =>
      exit.call((exit) => exit.transition(t).attr("width", 0).attr("height", 0))
  );
}

export { DotPlot as ScatterPlot };
