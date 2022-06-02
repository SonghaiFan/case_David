function BubbleMap(data, canvas, article) {
  const margin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    },
    width = canvas.attr("width") - margin.left - margin.right,
    height = canvas.attr("height") - margin.top - margin.bottom;

  const world_url = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

  const t = canvas.transition().duration(750);

  const g = canvas.select("#figureGroup"),
    gx = canvas.select("#xAxisGroup"),
    gy = canvas.select("#yAxisGroup");

  g.selectAll("path").transition(t).attr("opacity", 1);

  gx.transition(t).attr("opacity", 0);
  gy.transition(t).attr("opacity", 0);

  d3.json(world_url).then((gdata) => {
    // console.log(gdata);
    const countries = topojson.feature(gdata, gdata.objects.countries);
    // const states = topojson.feature(gdata, gdata.objects.sates);

    countries.features = countries.features.filter(
      (d) => d.properties.name == "Australia"
    );

    const projection = d3.geoMercator().fitExtent(
      [
        [0, 0],
        [width, height],
      ],
      countries
    );

    const path = d3.geoPath().projection(projection);

    g.selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .transition(t)
      .attr("opacity", 1)
      .attr("d", path)
      .attr("fill", "lightgray")
      .attr("stroke", "white");

    const xValue = (d) => d.Confirmed;
    const yValue = (d) => d["Province/State"];

    const circleScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, xValue)])
      .range([0, 100]);

    const syntaxElement = g
      .selectAll("rect")
      .data(data, (d) => [d["Province/State"], d.Date]);

    // console.log(data);

    syntaxElement.raise().join(
      (enter) =>
        enter
          .append("rect")
          .attr("fill", "red")
          .attr("width", 0)
          .attr("height", 0)
          .call((enter) =>
            enter
              .transition(t)
              .attr("rx", (d) => circleScale(xValue(d)))
              .attr("ry", (d) => circleScale(xValue(d)))
              .attr("width", (d) => circleScale(xValue(d)))
              .attr("height", (d) => circleScale(xValue(d)))
              .attr("x", (d) => projection([d.Long, d.Lat])[0])
              .attr("y", (d) => projection([d.Long, d.Lat])[1])
          ),
      (update) =>
        update.call((update) =>
          update
            .transition(t)
            .attr("width", (d) => circleScale(xValue(d)))
            .attr("height", (d) => circleScale(xValue(d)))
            .attr("rx", (d) => circleScale(xValue(d)))
            .attr("ry", (d) => circleScale(xValue(d)))
            .attr(
              "x",
              (d) => projection([d.Long, d.Lat])[0] - circleScale(xValue(d)) / 2
            )
            .attr(
              "y",
              (d) => projection([d.Long, d.Lat])[1] - circleScale(xValue(d)) / 2
            )
        ),
      (exit) =>
        exit.call((exit) =>
          exit
            .transition(t)
            .attr("width", 0)
            .attr("height", 0)
            .call((exit) => console.log(exit.nodes()))
        )
    );
  });
}

export { BubbleMap };
