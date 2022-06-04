async function LineChart(aqdata, container) {
  const { width, height } = container.node().getBoundingClientRect();

  const primary_color = getComputedStyle(
    document.documentElement
  ).getPropertyValue("--primary");

  console.log(d3.hsl(primary_color));

  const lumin85_interprator = (s) => `hsl(13, 96%, ${55 + 30 * s}%)`;

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
    .orderby("day_of_year")
    .derive({
      value_final_lead: (d) =>
        op.is_nan(+op.lead(d.value_final))
          ? d.value_final
          : op.lead(d.value_final),
    })
    .derive({
      day_of_year_lead: (d) =>
        op.is_nan(+op.lead(d.day_of_year))
          ? d.day_of_year
          : op.lead(d.day_of_year),
    })
    .derive({
      value_final_diff: (d) => op.abs(d.value_final_lead - d.value_final),
    })
    .derive({
      value_final_diff_rolsum: aq.rolling((d) => op.sum(d.value_final_diff)),
    })
    .orderby("date")
    .objects();

  console.log(data);

  const svg = container.select("svg");
  const tooltip = container.select("#tooltipContainer");

  const t = svg.transition().duration(750);
  const t2 = t.transition();

  const usedLayters = ["figureLayer", "xAxisLayer", "yAxisLayer"];

  const layers = svg.selectAll("g").data(usedLayters, (d) => d);

  layers
    .transition(t)
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .transition(t2)
    .style("opacity", 1);

  const g = svg.select(".figureLayer"),
    gx = svg.select(".xAxisLayer"),
    gy = svg.select(".yAxisLayer");

  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr(
    "transform",
    `translate(${margin.left},${innerHeight + margin.top})`
  );
  gy.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);

  // data.sort((a, b) => a.date - b.date);

  const x1Value = (d) => d.day_of_year;
  const y1Value = (d) => d.value_final;
  const x2Value = (d) => d.day_of_year_lead;
  const y2Value = (d) => d.value_final_lead;
  const colorValue = (d) => d.year;

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, y1Value)])
    .range([innerHeight, 0]);

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, x1Value))
    .range([0, innerWidth]);

  const colorScale = d3
    .scaleSequentialPow()
    .exponent(6.5)
    .domain([2022, 1910])
    .interpolator(lumin85_interprator);

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

  const temp_lines = g
    .selectAll("line")
    .data(data, (d) => `${d.year}_${d.day_of_year}`);

  temp_lines
    .join(
      (enter) =>
        enter
          .append("line")
          .attr("class", "temp_line")
          .attr("id", (d) => `temp_line'_${d.year}_${d.day_of_year}`)
          .attr("opacity", 0)
          .attr("stroke", (d) => colorScale(colorValue(d)))
          .attr("x1", (d) => xScale(x1Value(d)))
          .attr("y1", (d) => yScale(y1Value(d)))
          .attr("x2", (d) => xScale(x1Value(d)))
          .attr("y2", (d) => yScale(y1Value(d)))
          .call((enter) =>
            enter
              .transition(t2)
              .delay((d, i) => i)
              .duration((d) => d.value_final_diff)
              .delay((d) => d.value_final_diff_rolsum)
              .attr("opacity", 1)
              .attr("x2", (d) => xScale(x2Value(d)))
              .attr("y2", (d) => yScale(y2Value(d)))
          ),
      (update) =>
        update.call((update) =>
          update
            .transition(t)
            .style("opacity", 1)
            .attr("stroke", (d) => colorScale(colorValue(d)))
            .attr("x1", (d) => xScale(x1Value(d)))
            .attr("y1", (d) => yScale(y1Value(d)))
            .attr("x2", (d) => xScale(x2Value(d)))
            .attr("y2", (d) => yScale(y2Value(d)))
        ),
      (exit) =>
        exit.call((exit) => exit.transition(t).attr("opacity", 0).remove())
    )
    .lower();
}

export { LineChart };
