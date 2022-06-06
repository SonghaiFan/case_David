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

function dodge(X, radius) {
  const Y = new Float64Array(X.length);
  const radius2 = radius ** 2;
  const epsilon = 1e-3;
  let head = null,
    tail = null;

  // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
  function intersects(x, y) {
    let a = head;
    while (a) {
      const ai = a.index;
      if (radius2 - epsilon > (X[ai] - x) ** 2 + (Y[ai] - y) ** 2) return true;
      a = a.next;
    }
    return false;
  }

  // Place each circle sequentially.
  for (const bi of d3.range(X.length).sort((i, j) => X[i] - X[j])) {
    // Remove circles from the queue that can’t intersect the new circle b.
    while (head && X[head.index] < X[bi] - radius2) head = head.next;

    // Choose the minimum non-intersecting tangent.
    if (intersects(X[bi], (Y[bi] = 0))) {
      let a = head;
      Y[bi] = Infinity;
      do {
        const ai = a.index;
        let y = Y[ai] + Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
        if (y < Y[bi] && !intersects(X[bi], y)) Y[bi] = y;
        a = a.next;
      } while (a);
    }

    // Add b to the queue.
    const b = { index: bi, next: null };
    if (head === null) head = tail = b;
    else tail = tail.next = b;
  }

  return Y;
}

async function DotPlot(aqdata, container) {
  const { width, height } = container.node().getBoundingClientRect();

  const margin = {
      top: 200,
      right: 30,
      bottom: 200,
      left: 30,
    },
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;

  const data = aqdata
    .select("date", "year", "decade", "day_of_year", "value_final")
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

  g1.attr("transform", `translate(${margin.left},${margin.top})`);
  gx.attr("transform", `translate(${margin.left},${innerHeight + margin.top})`);
  gy.attr("transform", `translate(${margin.left},${margin.top})`);

  const xValue = (d) => d.day_of_year;
  const yValue = (d) => d.value_final;

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([innerHeight, 0]);

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth]);

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
        .style("fill", (d) => custom_colorScale(d))
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
          .style("fill", (d) => custom_colorScale(d))
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

async function DotPlot_dodge(aqdata, container) {
  const { width, height } = container.node().getBoundingClientRect();

  const margin = {
      top: 200,
      right: 30,
      bottom: 200,
      left: 30,
    },
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;

  const data = aqdata
    .select("date", "year", "decade", "day_of_year", "value_final")
    .orderby(aq.desc("date"))
    .derive({ index: (d) => op.row_number() - 1 })
    .objects();

  const svg = container.select("svg");
  const tooltip = container.select("#tooltipContainer");

  const smart_duration = data.length < 100 ? 1500 : 750;

  const t = svg.transition().duration(smart_duration);
  const t2 = t.transition().duration(smart_duration);

  const usedLayters = ["figureLayer1", "xAxisLayer"];

  const g1 = svg.select(".figureLayer1"),
    gx = svg.select(".xAxisLayer");

  const layers = svg
    .selectAll("g")
    .data(usedLayters, (d) => d)
    .join(
      (enter) => enter,
      (update) => update.classed("is-active", true),
      (exit) => exit.classed("is-active", false)
    );

  g1.attr("transform", `translate(${margin.left},${margin.top})`);
  gx.attr("transform", `translate(${margin.left},${innerHeight + margin.top})`);

  const mark_size = 15;
  const padding = 0;

  const xValue = (d) => d.year;
  const yValue = (d) => d.value_final;
  const iValue = (d) => d.index;

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth]);

  const X = d3.map(data, xValue).map((x) => (x == null ? NaN : +x));
  // Compute which data points are considered defined.
  const I = d3.range(X.length).filter((i) => !isNaN(X[i]));
  const Y = dodge(
    I.map((i) => xScale(X[i])),
    mark_size * 2 + padding
  );

  gx.transition(t).call(d3.axisBottom(xScale));

  const temp_rect = g1
    .selectAll("rect")
    .data(data, (d) => `${d.year}_${d.day_of_year}`);

  temp_rect.join(
    (enter) =>
      enter
        .append("rect")
        .attr("class", "temp_rect")
        .style("fill", (d) => custom_colorScale(d))
        .attr("id", (d) => `temp_rect_${d.year}_${d.day_of_year}`)
        .attr("rx", (d) => mark_size)
        .attr("ry", (d) => mark_size)
        .attr("width", (d) => mark_size)
        .attr("height", (d) => mark_size)
        .attr("x", (d) => xScale(X[d.index]) - mark_size / 2)
        .attr(
          "y",
          (d) => innerHeight - mark_size - padding - Y[d.index] - mark_size / 2
        )
        .call((enter) =>
          enter
            .transition(t)
            .attr("rx", (d) => mark_size)
            .attr("ry", (d) => mark_size)
            .attr("width", (d) => mark_size)
            .attr("height", (d) => mark_size)
            .attr("x", (d) => xScale(X[d.index]) - mark_size / 2)
            .attr(
              "y",
              (d) =>
                innerHeight - mark_size - padding - Y[d.index] - mark_size / 2
            )
        ),
    (update) =>
      update.call((update) =>
        update
          .transition(t)
          .style("fill", (d) => custom_colorScale(d))
          .attr("width", (d) => mark_size)
          .attr("height", (d) => mark_size)
          .attr("rx", (d) => mark_size)
          .attr("ry", (d) => mark_size)
          .attr("x", (d) => xScale(X[d.index]) - mark_size / 2)
          .attr(
            "y",
            (d) =>
              innerHeight - mark_size - padding - Y[d.index] - mark_size / 2
          )
      ),
    (exit) =>
      exit.call((exit) => exit.transition(t).attr("width", 0).attr("height", 0))
  );
}

export { DotPlot, DotPlot_dodge };
