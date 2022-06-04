async function LineChart(data, container) {
  const { width, height } = container.node().getBoundingClientRect();

  const margin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    },
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;

  const svg = container.select("svg");
  const tooltip = container.select("#tooltipContainer");

  const t = svg.transition().duration(750);
  const t2 = t.transition().duration(750);

  const usedLayters = ["figureLayer", "xAxisLayer", "yAxisLayer"];

  const layers = svg.selectAll("g").data(usedLayters, (d) => d);

  layers
    .transition(t)
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .transition(t2)
    .style("opacity", 1);

  const g = svg.select(".figureLayer"),
    gx = svg.select(".xAxisLayer"),
    gy = sbg.select(".yAxisLayer");

  console.log($("#single").value);
}

export { LineChart };
