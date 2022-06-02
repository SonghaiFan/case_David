function BubbleMap(data, container) {
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

  const world_url = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

  const t = svg.transition().duration(750);
  const t2 = t.transition().duration(750);

  const usedLayters = ["figureLayer", "figureLayer1"];

  const layers = svg.selectAll("g").data(usedLayters, (d) => d);

  layers
    .transition(t)
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .transition(t2)
    .style("opacity", 1);

  //   layers.exit().transition(t).sytle("opacity", 0);

  const g = svg.select(".figureLayer"),
    g1 = svg.select(".figureLayer1");

  d3.json(world_url).then((gdata) => {
    const countries = topojson.feature(gdata, gdata.objects.countries);
    // const states = topojson.feature(gdata, gdata.objects.sates);

    countries.features = countries.features.filter(
      (d) => d.properties.name == "Australia"
    );

    const projection = d3.geoMercator().fitExtent(
      [
        [0, 0],
        [innerWidth, innerHeight],
      ],
      countries
    );

    const map_path = d3.geoPath().projection(projection);

    g.selectAll("path")
      .data(countries.features)
      .join("path")
      .attr("class", "map_path")
      .attr("d", map_path);

    const station_rect = g1.selectAll("rect").data(data, (d) => d.station_id);

    const mark_size = 15;

    station_rect.join(
      (enter) =>
        enter
          .append("rect")
          .attr("class", "station_rect")
          .attr("width", 0)
          .attr("height", 0)
          .call((enter) =>
            enter
              .transition(t)
              .attr("rx", (d) => mark_size)
              .attr("ry", (d) => mark_size)
              .attr("width", (d) => mark_size)
              .attr("height", (d) => mark_size)
              .attr("x", (d) => projection([d.lon, d.lat])[0] - mark_size / 2)
              .attr("y", (d) => projection([d.lon, d.lat])[1] - mark_size / 2)
          ),
      (update) =>
        update.call((update) =>
          update
            .transition(t)
            .attr("width", (d) => mark_size)
            .attr("height", (d) => mark_size)
            .attr("rx", (d) => mark_size / 3)
            .attr("ry", (d) => mark_size / 3)
            .attr("x", (d) => projection([d.lon, d.lat])[0] - mark_size / 2)
            .attr("y", (d) => projection([d.lon, d.lat])[1] - mark_size / 2)
        ),
      (exit) =>
        exit.call((exit) =>
          exit.transition(t).attr("width", 0).attr("height", 0)
        )
    );
  });
}

export { BubbleMap };
