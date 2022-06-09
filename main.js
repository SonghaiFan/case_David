import { BubbleMap } from "./src/js/renderMap.js";
import { LineChart, LineChart_Dot } from "./src/js/renderLine.js";
import { DotPlot, DotPlot_dodge, DotPlot_dodge2 } from "./src/js/renderDot.js";
import { Histgram, Histgram2 } from "./src/js/renderBar.js";

const figures = d3.selectAll(".figure");
const article = d3.selectAll(".article");
const fig_map = d3.select("#fig_map");
const fig1 = d3.select("#fig1");
const fig2 = d3.select("#fig2");
const fig3 = d3.select("#fig3");
const steps = d3.selectAll(".step");
const chapters = d3.selectAll(".chapter");
const navbar = d3.select("#navbar");
const stationsIp = d3.select("#stationInput");

const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
);
const currentTheme = localStorage.getItem("theme")
  ? localStorage.getItem("theme")
  : null;
if (currentTheme) {
  document.documentElement.setAttribute("data-theme", currentTheme);

  if (currentTheme === "dark") {
    toggleSwitch.checked = true;
  }
}

function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark"); //add this
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light"); //add this
  }
}
// initialize the scrollama
const scroller = scrollama();

// load the data

const sdataPath = "src/data/stations.csv";
const tdataPath = "src/data/rich_mel_data.csv";

const aq_sdata = await aq.loadCSV(sdataPath);
const aq_tdata = await aq.loadCSV(tdataPath);

const sdata = aq_sdata.objects();
const tdata = aq_tdata.objects();

const dayOfYear = (date) =>
  Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );

const selected_date_string = "2020-7-9";
localStorage.setItem("selected_date_string", selected_date_string);

const selected_date = new Date(selected_date_string);
const selected_type = "tmax";

const selected_dayOfYear = dayOfYear(selected_date);

const tdataPOI = aq_tdata.filter(aq.escape((d) => d.type == selected_type));

const dataTable = d3
  .select("#tab1")
  .html(aq_sdata.slice(1, 10).toHTML())
  .select("table")
  .attr("class", "u-full-width");

// preparation for rendering

function stepTrigger(index) {
  switch (index) {
    case 0:
      break;
    case 1:
      break;
    case 2:
      LineChart(
        tdataPOI.filter(
          aq.escape((d) => d.year == selected_date.getFullYear())
        ),
        fig1
      );
      break;
    case 3:
      LineChart(
        tdataPOI.filter(
          aq.escape(
            (d) => (d.year == selected_date.getFullYear()) | (d.year == 1910)
          )
        ),
        fig1
      );
      break;
    case 4:
      LineChart(
        tdataPOI
          .filter(
            aq.escape(
              (d) => (d.year == selected_date.getFullYear()) | (d.year == 1910)
            )
          )
          .filter(aq.escape((d) => d.day_of_year >= selected_dayOfYear - 7))
          .filter(aq.escape((d) => d.day_of_year <= selected_dayOfYear + 7)),
        fig1
      );
      break;
    case 5:
      LineChart(
        tdataPOI
          .filter(aq.escape((d) => d.day_of_year >= selected_dayOfYear - 7))
          .filter(aq.escape((d) => d.day_of_year <= selected_dayOfYear + 7)),
        fig1
      );
      break;
    case 6:
      LineChart_Dot(
        tdataPOI
          .filter(aq.escape((d) => d.day_of_year >= selected_dayOfYear - 7))
          .filter(aq.escape((d) => d.day_of_year <= selected_dayOfYear + 7)),
        fig1
      );
      break;
    case 7:
      LineChart_Dot(
        tdataPOI
          .filter(aq.escape((d) => d.day_of_year >= selected_dayOfYear - 7))
          .filter(aq.escape((d) => d.day_of_year <= selected_dayOfYear + 7))
          .filter(aq.escape((d) => d.temp_percentile >= 95)),
        fig1
      );
      DotPlot(
        tdataPOI
          .filter(aq.escape((d) => d.day_of_year >= selected_dayOfYear - 7))
          .filter(aq.escape((d) => d.day_of_year <= selected_dayOfYear + 7))
          .filter(aq.escape((d) => d.temp_percentile >= 95)),
        fig1
      );
      break;
    case 8:
      DotPlot_dodge(
        tdataPOI
          .filter(aq.escape((d) => d.day_of_year >= selected_dayOfYear - 7))
          .filter(aq.escape((d) => d.day_of_year <= selected_dayOfYear + 7))
          .filter(aq.escape((d) => d.temp_percentile >= 95)),
        fig1
      );
      break;
    case 9:
      DotPlot_dodge2(
        tdataPOI
          .filter(aq.escape((d) => d.day_of_year >= selected_dayOfYear - 7))
          .filter(aq.escape((d) => d.day_of_year <= selected_dayOfYear + 7))
          .filter(aq.escape((d) => d.temp_percentile >= 95)),
        fig1
      );
      break;
    case 10:
      DotPlot_dodge2(
        tdataPOI
          .filter(aq.escape((d) => d.day_of_year >= selected_dayOfYear - 7))
          .filter(aq.escape((d) => d.day_of_year <= selected_dayOfYear + 7)),
        fig1
      );
      break;
    case 11:
      Histgram(
        tdataPOI
          .filter(aq.escape((d) => d.day_of_year >= selected_dayOfYear - 7))
          .filter(aq.escape((d) => d.day_of_year <= selected_dayOfYear + 7)),
        fig1
      );
      // Histgram2(
      //   tdataPOI
      //     .filter(aq.escape((d) => d.day_of_year >= selected_dayOfYear - 7))
      //     .filter(aq.escape((d) => d.day_of_year <= selected_dayOfYear + 7)),
      //   fig1
      // );
      break;
    case 12:
      Histgram2(
        tdataPOI
          .filter(aq.escape((d) => d.day_of_year >= selected_dayOfYear - 7))
          .filter(aq.escape((d) => d.day_of_year <= selected_dayOfYear + 7)),
        fig1
      );
      break;
    case 13:
      Histgram2(tdataPOI, fig1);
      break;
    case 14:
      Histgram2(tdataPOI.filter(aq.escape((d) => d.year == 1910)), fig1);
      break;
    case 15:
      Histgram2(
        tdataPOI.filter(
          aq.escape((d) => d.year == selected_date.getFullYear())
        ),
        fig1
      );
      break;
  }
}

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  const stepH = Math.floor(window.innerHeight * 0.95);
  steps
    .style("margin-top", stepH / 2 + "px")
    .style("margin-bottom", stepH / 2 + "px");
  chapters.style("min-height", stepH + "px");

  const figureHeight = window.innerHeight * 0.9;
  const figureMarginTop = (window.innerHeight - figureHeight) / 2;

  figures
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  // 3. tell scrollama to update new element dimensions
  scroller.resize();
}

// scrollama event handlers
function handleStepEnter({ element, direction, index }) {
  // add color to current step only
  steps.classed("is-active", false);
  d3.select(element).classed("is-active", true);

  // update graphic based on step
  figures.select("p").text(index);

  navbar.select("#next").attr("href", `#scrollama_step_${index + 1}`);
  navbar.select("#previous").attr("href", `#scrollama_step_${index - 1}`);

  d3.select("#dynamic_nav_container")
    .selectAll("a")
    .classed("is-active", false);
  d3.select(`#scrollama_step_tag_${index}`).classed("is-active", true);

  stepTrigger(index);
}

function setStepNavigationBar() {
  d3.selectAll(":is(.chapter,.step)").each(function () {
    const scrololama_index = d3.select(this).attr("data-scrollama-index");

    d3.select(this).attr("id", `scrollama_step_${scrololama_index}`);

    const symbol = d3.select(this).attr("class") == "step" ? "●" : "■";

    d3.select("#dynamic_nav_container")
      .append("a")
      .text(symbol)
      .attr("id", `scrollama_step_tag_${scrololama_index}`)
      .attr("href", `#scrollama_step_${scrololama_index}`);
  });
}

function initialCanvas() {
  const defaultLayters = [
    "figureLayer",
    "figureLayer1",
    "figureLayer2",
    "figureLayer3",
    "figureLayer4",
    "xAxisLayer",
    "yAxisLayer",
    "anotationLayer",
  ];

  figures
    .append("svg")
    .selectAll("g")
    .data(defaultLayters)
    .enter()
    .append("g")
    .attr("class", (d) => `layer ${d}`);
}

function init() {
  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  handleResize();
  initialCanvas();

  // 2. setup the scroller passing options
  // 		this will also initialize trigger observations

  scroller.setup({
    step: ":is(.chapter,.step)",
    offset: 0.5,
  });

  // 3. bind scrollama event handlers (this can be chained like below)
  scroller.onStepEnter(handleStepEnter);

  setStepNavigationBar();

  // 4. render the first map
  BubbleMap(sdata, fig_map);
  localStorage.setItem("selected_date_string", selected_date_string);
}

// kick things off
window.onload = init();
window.addEventListener("resize", handleResize);
toggleSwitch.addEventListener("change", switchTheme, false);
