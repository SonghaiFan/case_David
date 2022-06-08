function HorizontalBarchart() {
  // CANVAS SETUP
  let margin = {
      top: 100,
      right: 100,
      bottom: 100,
      left: 30,
    },
    dim_x,
    dim_color,
    dim,
    measure_y,
    x_domain,
    color_domain,
    y_domain,
    pad = 0.4,
    smooth = true;

  function chart(selection) {
    selection.each(function (d, i, g) {
      // Throw erro if the required configuration is not defined
      if (!dim_x) throw new Error('"dim_x" must be defined.');
      if (!measure_y) throw new Error('measure_y" must be defined.');

      dim_color = dim_color ? dim_color : dim_x;
      dim = dim ? dim : dim_x;

      console.log(dim_x, dim_color, dim);

      const datum = d
        .derive({
          dim_x: `d['${dim_x}']`,
          dim_color: `d['${dim_color}']`,
          measure_y: `d['${measure_y}']`,
          dim: `d['${dim}']`,
        })
        .groupby(["dim_x", "dim_color", "dim"])
        .rollup({ measure_y: (d) => op.sum(d.measure_y) })
        .groupby("dim_x")
        .orderby(["dim_x", "dim_color", "dim"])
        .derive({ sum_measure_y: (d) => op.sum(d.measure_y) })
        .derive({ sum_measure_y1: aq.rolling((d) => op.sum(d.measure_y)) })
        .derive({ sum_measure_y0: (d) => op.lag(d.sum_measure_y1, 1, 0) })
        .ungroup();

      // data is array object

      const data = datum.objects();

      // initial rendering

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

      const innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom;

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
        .attr("class", (d) => d)
        .attr(
          "transform",
          `translate(${margin.left},${margin.top + innerHeight})`
        );

      const fl1 = d3.select(this).select(".figureLayer1");
      const xal = d3.select(this).select(".xAxisLayer");
      const yal = d3.select(this).select(".yAxisLayer");

      fl1
        .transition()
        .duration(750)
        .style("opacity", 1)
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = d3
        .scaleBand()
        .domain(x_domain || datum.array("dim_x"))
        .range([0, innerWidth])
        .padding(pad);

      const yScale = d3
        .scaleLinear()
        .domain(y_domain || [0, d3.max(datum.array("sum_measure_y"))])
        .range([innerHeight, 0]);

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

      xal
        .transition()
        .duration(750)
        .style("opacity", 1)
        .attr(
          "transform",
          `translate(${margin.left},${margin.top + innerHeight})`
        )
        .call(d3.axisBottom(xScale));

      yal
        .transition()
        .duration(750)
        .style("opacity", 1)
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(yScale));

      const xValue = (d) => xScale(d.dim_x);
      const heightValue = (d) =>
        innerHeight - yScale(d.sum_measure_y1 - d.sum_measure_y0);
      const yValue = (d) => yScale(d.sum_measure_y1);
      const colorValue = (d) => colorScale(d.dim_color);

      const keyOE = (d) =>
        [...new Set([d.dim, d.dim_x, d.dim_color])]
          .sort()
          .map((d) => d)
          .join(" ");

      const OE = fl1.selectAll("rect").data(data, (d) => keyOE(d));

      OE.join(
        function (enter) {
          const rectEner = enter
            .append("rect")
            .attr("class", (d) => keyOE(d))
            .attr("fill", (d) => colorValue(d))
            .style("mix-blend-mode", "multiply")
            .style("opacity", 0)
            .attr("y", innerHeight)
            .attr("height", 0)
            .attr("x", (d) => xValue(d))
            .attr("width", xScale.bandwidth());

          const rectEnterTransition = rectEner
            .transition()
            .duration(smooth ? 750 : 0)
            .style("opacity", 1)
            .attr("y", (d) => yValue(d))
            .attr("height", (d) => heightValue(d));

          return rectEnterTransition;
        },
        function (update) {
          const rectUpdateTransition = update
            .transition()
            .duration(500)
            .style("opacity", 1)
            .delay((d, i) => i * 5)
            .attr("width", xScale.bandwidth())
            .attr("x", (d) => xValue(d))
            .transition()
            .duration(500)
            .attr("y", (d) => yValue(d))
            .attr("height", (d) => heightValue(d));

          return rectUpdateTransition;
        },
        function (exit) {
          const rectExitTransition = exit
            .transition()
            .duration(smooth ? 500 : 0)
            .attr("height", 0)
            .attr("y", innerHeight)
            .style("opacity", 0)
            .remove();

          return rectExitTransition;
        }
      );
    });
  }

  chart.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.dim_x = function (_) {
    if (!arguments.length) return dim_x;
    dim_x = _;
    return chart;
  };

  chart.x_domain = function (_) {
    if (!arguments.length) return x_domain;
    x_domain = _;
    return chart;
  };

  chart.measure_y = function (_) {
    if (!arguments.length) return measure_y;
    measure_y = _;
    return chart;
  };

  chart.y_domain = function (_) {
    if (!arguments.length) return y_domain;
    y_domain = _;
    return chart;
  };

  chart.dim_color = function (_) {
    if (!arguments.length) return dim_color;
    dim_color = _;
    return chart;
  };

  chart.dim = function (_) {
    if (!arguments.length) return dim;
    dim = _;
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

  chart.smooth = function (_) {
    if (!arguments.length) return smooth;
    smooth = _;
    return chart;
  };

  return chart;
}

export { HorizontalBarchart };
