export default function UnitChart() {
  // CANVAS SETUP
  let margin = {
      top: 100,
      right: 400,
      bottom: 100,
      left: 400,
    },
    dim_color = "id",
    color_domain,
    pad = 0.1,
    bin = 4;

  function chart(selection) {
    selection.each(function (aqData, i, g) {
      const datum = aqData
        .params({ bin: bin })
        .derive({ g_id: (d) => op.row_number() - 1 })
        .derive({
          g_x_id: (d) => d.g_id % bin,
          g_y_id: (d) => op.floor(d.g_id / bin),
        });

      const data = datum.objects();

      const continerRect = d3.select(this).node().getBoundingClientRect(),
        height = continerRect.height,
        width = continerRect.width;

      const svg = d3
        .select(this)
        .selectAll("svg")
        .data(datum.partitions())
        .join("svg")
        .attr("width", width)
        .attr("height", height);

      const innerWidth = continerRect.width - margin.left - margin.right,
        innerHeight = continerRect.height - margin.top - margin.bottom;

      const defaultLayters = [
        "morphLayer",
        "figureLayer1",
        "figureLayer2",
        "figureLayer3",
        "figureLayer4",
        "xAxisLayer",
        "yAxisLayer",
        "anotationLayer",
      ];

      svg
        .selectAll("g")
        .data(defaultLayters)
        .enter()
        .append("g")
        .attr("class", (d) => d);

      const fl1 = svg.select(".figureLayer1");

      fl1
        .transition()
        .duration(750)
        .style("opacity", 1)
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = d3
        .scaleBand()
        .domain(datum.array("g_x_id"))
        .range([0, innerWidth])
        .padding(pad);

      const yScale = d3
        .scaleBand()
        .domain(datum.array("g_y_id"))
        .range([0, innerHeight])
        .padding(pad);

      const colorScale = d3
        .scaleOrdinal()
        .domain(color_domain || datum.array(dim_color))
        .range([
          "#fa4d1d",
          "#fcdb39",
          "#1c6ae4",
          "#03b976",
          "#fac3d3",
          "#fffaf0",
        ]);

      const xValue = (d) =>
        xScale.bandwidth() > yScale.bandwidth()
          ? xScale(d.g_x_id) + (xScale.bandwidth() - yScale.bandwidth()) / 2
          : xScale(d.g_x_id);
      const yValue = (d) =>
        yScale.bandwidth() > xScale.bandwidth()
          ? yScale(d.g_y_id) - (xScale.bandwidth() - yScale.bandwidth()) / 2
          : yScale(d.g_y_id);
      const colorValue = (d) => d[dim_color];

      const sizeValue = Math.min(xScale.bandwidth(), yScale.bandwidth());

      const OE = fl1.selectAll("rect").data(data, (d) => d.id);
      OE.join(
        function (enter) {
          const rectEner = enter
            .append("rect")
            .attr("stroke", dim_color || "white")
            .style("mix-blend-mode", "multiply")
            .attr("fill", (d) => !dim_color || colorScale(colorValue(d)))
            .attr("x", (d) => xValue(d))
            .attr("y", (d) => -2 * height)
            .attr("width", sizeValue);
          const rectEnterTransition = rectEner
            .transition()
            .duration(750)
            .style("opacity", 1)
            .attr("y", (d) => yValue(d))
            .attr("height", sizeValue);

          return rectEnterTransition;
        },
        function (update) {
          const rectUpdateTransition = update
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .delay((d, i) => i * 5)
            .attr("height", sizeValue)
            .attr("width", sizeValue)
            .attr("x", (d) => xValue(d))
            .attr("y", (d) => yValue(d))
            .attr("rx", sizeValue)
            .attr("ry", sizeValue);
          return rectUpdateTransition;
        },
        function (exit) {
          const rectExitTransition = exit
            .transition()
            .style("opacity", 0.2)
            .transition()
            .ease(d3.easeExp)
            .attr("y", (d) => -2 * height)
            .remove();

          return rectExitTransition;
        }
      );
    });
  }

  chart.aqDatum = function (_) {
    if (!arguments.length) return originDatum;
    originDatum = _;
    // if (typeof updateData === 'function') updateData();
    return chart;
  };

  chart.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.dim = function (_) {
    if (!arguments.length) return dim;
    dim = _;
    return chart;
  };

  chart.dim_color = function (_) {
    if (!arguments.length) return dim_color;
    dim_color = _;
    return chart;
  };

  chart.color_domain = function (_) {
    if (!arguments.length) return color_domain;
    color_domain = _;
    return chart;
  };

  chart.pad = function (_) {
    if (!arguments.length) return pad;
    pad = _;
    return chart;
  };

  chart.bin = function (_) {
    if (!arguments.length) return bin;
    bin = _;
    return chart;
  };

  return chart;
}
