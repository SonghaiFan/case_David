const primary_color = getComputedStyle(
  document.documentElement
).getPropertyValue("--primary");

const colorScale = d3
  .scaleSequentialPow()
  .exponent(8)
  .domain([1910, 2022])
  .interpolator(
    d3.interpolateRgb("hsla(120, 0%, 83%, 0.5)", "hsla(0, 0%, 33%, 1.00)")
  );

const colorValue = (d) => d.year;
const dateFormat = d3.timeFormat("%e %B %Y");
const selected_date_string = localStorage.getItem("selected_date_string");
const selected_date = new Date(selected_date_string);
const selected_year = selected_date.getFullYear();
const selected_decade = Math.round(selected_year / 10) * 10;

const custom_colorScale = function (d) {
  if (d.year == selected_year) {
    return primary_color;
  } else if (d.decade == selected_decade) {
    return "#ffaa92";
  } else {
    return colorScale(colorValue(d));
  }
};

async function Histgram(aqdata, container) {
  const { width, height } = container.node().getBoundingClientRect();

  const margin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    },
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;

  const data = aqdata
    .orderby(aq.desc("date"))
    .derive({ bin: aq.bin("value_final", { step: 0.5 }) })
    .groupby("bin")
    .derive({ hist_y1: aq.rolling((d) => op.sum(1)) })
    .derive({ hist_y0: (d) => op.lag(d.hist_y1, 1, 0) })
    .orderby("bin")
    .objects();

  console.log(data);

  const svg = container.select("svg");
  const tooltip = container.select("#tooltipContainer");

  const smart_duration = data.length < 100 ? 1500 : 750;

  const t = svg.transition().duration(smart_duration);
  const t2 = t.transition().duration(smart_duration);
  const t3 = t.transition().duration(smart_duration);

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

  const xValue = (d) => d.bin;
  const yValue = (d) => d.hist_y1;

  const padding = 0;

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([innerHeight, 0]);

  const xScale = d3
    .scaleBand()
    .domain(d3.range(d3.min(data, xValue), d3.max(data, xValue), 0.5))
    .range([0, innerWidth])
    .padding(padding);

  gx.transition(t).call(d3.axisBottom(xScale));

  gy.transition(t).call(
    d3
      .axisLeft(yScale)
      .tickFormat(d3.format("~s"))
      .ticks(Math.round(width / 100))
  );

  const temp_rect = g1
    .selectAll("rect")
    .data(data, (d) => `${d.year}_${d.day_of_year}`);

  temp_rect
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("class", "temp_rect")
          .style("fill", (d) => custom_colorScale(d))
          .attr("id", (d) => `temp_rect_${d.year}_${d.day_of_year}`)
          .attr("width", xScale.bandwidth())
          .attr("height", 0)
          .attr("x", (d) => xScale(xValue(d)))
          .attr("y", innerHeight)
          .call((enter) =>
            enter
              .transition(t3)
              .attr(
                "height",
                (d) => innerHeight - yScale(d.hist_y1 - d.hist_y0)
              )
              .attr("y", (d) => yScale(yValue(d)))
          ),
      (update) =>
        update.call((update) =>
          update
            .transition(t2)
            .delay((d, i) => i)
            .style("fill", (d) => custom_colorScale(d))
            .attr("width", xScale.bandwidth())
            .attr("rx", 0)
            .attr("ry", 0)
            .attr("x", (d) => xScale(xValue(d)))
            .transition(t)
            .attr("height", (d) => innerHeight - yScale(d.hist_y1 - d.hist_y0))
            .attr("y", (d) => yScale(yValue(d)))
        ),
      (exit) =>
        exit.call((exit) =>
          exit.transition(t).attr("y", innerHeight).attr("height", 0).remove()
        )
    )
    .on("mouseover", (e, d) => {
      tooltip
        .style("display", "block")
        .html(() => `${dateFormat(d.date)} <b>${d.value_final}°</b>`);
    })
    .on("mousemove", (e, d) => {
      tooltip
        .style("left", d3.pointer(e)[0] + 25 + margin.left + "px")
        .style("top", d3.pointer(e)[1] - 25 + margin.top + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });
}

async function Histgram2(aqdata, container) {
  const { width, height } = container.node().getBoundingClientRect();

  const margin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    },
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;

  const data = aqdata
    .orderby(aq.desc("date"))
    .derive({ bin: aq.bin("value_final", { step: 0.5 }) })
    .groupby("bin")
    .derive({ hist_y1: aq.rolling((d) => op.sum(1)) })
    .derive({ hist_y0: (d) => op.lag(d.hist_y1, 1, 0) })
    .orderby("bin")
    .objects();

  console.log(data);

  const svg = container.select("svg");
  const tooltip = container.select("#tooltipContainer");

  const smart_duration = data.length < 100 ? 1500 : 750;

  const t = svg.transition().duration(smart_duration);
  const t2 = t.transition().duration(smart_duration);
  const t3 = t.transition().duration(smart_duration);

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

  const xValue = (d) => d.bin;
  const yValue = (d) => d.hist_y1;

  const padding = 0;

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([innerHeight, 0]);

  const xScale = d3
    .scaleBand()
    .domain(d3.range(d3.min(data, xValue), d3.max(data, xValue), 0.5))
    .range([0, innerWidth])
    .padding(padding);

  gx.transition(t).call(d3.axisBottom(xScale));

  gy.transition(t).call(
    d3
      .axisLeft(yScale)
      .tickFormat(d3.format("~s"))
      .ticks(Math.round(width / 100))
  );

  const temp_rect = g1.selectAll("rect").data(data, (d) => `${d.day_of_year}`);

  temp_rect
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("class", "temp_rect")
          .style("fill", (d) => custom_colorScale(d))
          .attr("id", (d) => `temp_rect_${d.year}_${d.day_of_year}`)
          .attr("width", xScale.bandwidth())
          .attr("height", 0)
          .attr("x", (d) => xScale(xValue(d)))
          .attr("y", innerHeight)
          .call((enter) =>
            enter
              .transition(t3)
              .attr(
                "height",
                (d) => innerHeight - yScale(d.hist_y1 - d.hist_y0)
              )
              .attr("y", (d) => yScale(yValue(d)))
          ),
      (update) =>
        update.call((update) =>
          update
            .transition(t2)
            .style("fill", (d) => custom_colorScale(d))
            .attr("width", xScale.bandwidth())
            .attr("rx", 0)
            .attr("ry", 0)
            .attr("x", (d) => xScale(xValue(d)))
            .transition(t)
            .attr("height", (d) => innerHeight - yScale(d.hist_y1 - d.hist_y0))
            .attr("y", (d) => yScale(yValue(d)))
        ),
      (exit) =>
        exit.call((exit) =>
          exit.transition(t).attr("y", innerHeight).attr("height", 0).remove()
        )
    )
    .on("mouseover", (e, d) => {
      tooltip
        .style("display", "block")
        .html(() => `${dateFormat(d.date)} <b>${d.value_final}°</b>`);
    })
    .on("mousemove", (e, d) => {
      tooltip
        .style("left", d3.pointer(e)[0] + 25 + margin.left + "px")
        .style("top", d3.pointer(e)[1] - 25 + margin.top + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });
}

export { Histgram, Histgram2 };
