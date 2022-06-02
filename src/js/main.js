import UnitChart from "./UnitChart.js";
import { BubbleMap } from "./map.js";

const figures = d3.selectAll(".figure");
const article = d3.selectAll(".article");
const fig_map = d3.select("#fig_map");
const fig1 = d3.select("#fig1");
const fig2 = d3.select("#fig2");
const fig3 = d3.select("#fig3");
const steps = d3.selectAll(".step");
const chapters = d3.selectAll(".chapter");
const navbar = d3.select("#navbar");

// initialize the scrollama
const scroller = scrollama();

// load the data

const dataPath = "src/data/demo.csv";

const aqData = await aq.loadCSV(dataPath);

// const data = await d3.csv(dataPath);
const data = aqData.objects();

console.log(data);

const dataTable = d3
  .select("#tab1")
  .html(aqData.slice(1, 10).toHTML())
  .select("table")
  .attr("class", "u-full-width");

// preparation for rendering

function stepTrigger(index) {
  switch (index) {
    case 0:
      BubbleMap(data, fig_map);
      break;
    case 1:
      break;
    case 2:
      break;
    case 3:
      break;
  }
}

// generic window resize listener event
function handleResize() {
  // 1. update height of step elements
  const stepH = Math.floor(window.innerHeight * 0.95);
  steps
    // .style("margin-top", stepH / 2 + "px")
    .style("margin-bottom", stepH + "px");
  chapters.style("min-height", stepH + "px");

  const figureHeight = window.innerHeight * 0.9;
  const figureMarginTop = (window.innerHeight - figureHeight) / 4;

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
    .attr("class", (d) => d)
    .style("opacity", 0);
}

const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
);

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
}

// kick things off
window.onload = init();
window.addEventListener("resize", handleResize);

function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

toggleSwitch.addEventListener("change", switchTheme, false);
