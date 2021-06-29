// Define SVG area dimensions
var svgWidth = 900;
var svgHeight = 600;

// Define the chart's margins as an object
var margin = {
  top: 20,
  right: 40,
  bottom: 120,
  left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select id="scatter", append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set initial parameters of x and y aixs
var selectedX = "poverty";
var selectedY = "healthcare";

// Update the scale for x upon selected parameter
function xScale(censusData, selectedX) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[selectedX]) * 0.85 , d3.max(censusData, d => d[selectedX]) * 1.15])
    .range([0, chartWidth]);
  return xLinearScale;
}

// Update the scale for y upon selected parameter
function yScale(censusData, selectedY) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[selectedY]) * 0.85, d3.max(censusData, d => d[selectedY]) * 1.15])
    .range([chartHeight, 0]);
  return yLinearScale;
}

// Update x axis with new parameter upon click
function renderX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(2000)
    .call(bottomAxis);
  return xAxis;
}

// Update y axis with new parameter upon click
function renderY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(2000)
    .call(leftAxis);
  return yAxis;
}

// Update the circles with a transition to match new parameters
function renderCircles(circlesGroup, newXScale, selectedX, newYScale, selectedY) {
  circlesGroup.transition()
    .duration(2000)
    .attr("cx", d => newXScale(d[selectedX]))
    .attr("cy", d => newYScale(d[selectedY]))
  return circlesGroup;
}

// Update the labels with state abbreviations
function renderText(textGroup, newXScale, selectedX, newYScale, selectedY) {
  textGroup.transition()
    .duration(2000)
    .attr("x", d => newXScale(d[selectedX]))
    .attr("y", d => newYScale(d[selectedY]))
  return textGroup;
}

// Stylize x axis values for tooltips
function styleX(value, selectedX) {
  switch (selectedX) {
    case "poverty":
      return `${value}%`;
    case "income":
      return `${value}`;
    default:
      return `${value}`;
  }
}

// Update circle group
function updateToolTip(selectedX, selectedY, circlesGroup) {
    if (selectedX === "poverty") {
      var xLabel = "Poverty:";
    }
    else if (selectedX === "income") {
      var xLabel = "Median Income: ";
    }
    else {
      var xLabel = "Age:";
    }
    if (selectedY === "healthcare") {
      var yLabel = "No Healthcare: ";
    }
    else if (selectedY === "obesity") {
      var yLabel = "Obesity:";
    }
    else {
      var yLabel = "Smokers:";
    }

  // Create tooltip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${styleX(d[selectedX], selectedX)}<br>${yLabel} ${d[selectedY]}%`);
    });
  
  circlesGroup.call(toolTip);

  // Event listener with transitions
  circlesGroup.on("mouseover", toolTip.show)
    // onmouseout event
    .on("mouseout", toolTip.hide);
  
    return circlesGroup;
}

// Load data from data.csv
d3.csv("./assets/data/data.csv").then(function(censusData) {

    console.log(censusData);
  
    // Parse data
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.age = +data.age;
    });

    // Create a scale for x and y, respectively
    var xLinearScale = xScale(censusData, selectedX);
    var yLinearScale = yScale(censusData, selectedY);

    // Create create the chart's axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);
    
    // Append circles to data points
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[selectedX]))
        .attr("cy", d => yLinearScale(d[selectedY]))
        .attr("r", 12)
        .attr("opacity", 0.9);

    // Create circle labels
    var textGroup = chartGroup.selectAll(".stateText")
        .data(censusData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[selectedX]) )
        .attr("y", d => yLinearScale(d[selectedY]))
        .attr('dy', 3)
        .attr("font-size", 12)
        .text(d => d.abbr);

    // Append axes titles
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top})`);

    var povertyLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .text("Household Income (Median)");
    
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${chartHeight/2})`);

    var healthcareLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 20)
        .attr("x", 0)
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)");
    
    var smokesLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 40)
        .attr("x", 0)
        .attr("value", "smokes")
        .text("Smoker (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 60)
        .attr("x", 0)
        .attr("value", "obesity")
        .text("Obese (%)");

    var circlesGroup = updateToolTip(selectedX, selectedY, circlesGroup);

    // x axis event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value != selectedX) {
          // Assign the selected value to x
          selectedX = value;
          // Update x with new selected data
          xLinearScale = xScale(censusData, selectedX);
          // Render x axis
          xAxis = renderX(xLinearScale, xAxis);
          // Update the circles with a new x value
          circlesGroup = renderCircles(circlesGroup, xLinearScale, selectedX, yLinearScale, selectedY);
          // Update the text
          textGroup = renderText(textGroup, xLinearScale, selectedX, yLinearScale, selectedY);
          // Update the tooltip
          circlesGroup = updateToolTip(selectedX, selectedY, circlesGroup);
        
          if (selectedX === "poverty") {
          povertyLabel.classed("active", true).classed("inactive", false);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", false).classed("inactive", true);
        }
        else if (selectedX === "age") {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", true).classed("inactive", false);
          incomeLabel.classed("active", false).classed("inactive", true);
        }
        else {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", true).classed("inactive", false);
        }
        }
      });

    // y axis event listener
    yLabelsGroup.selectAll("text")
      .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value != selectedY) {
          // Assign the selected value to y
          selectedY = value;
          // Update y with new selected data
          yLinearScale = yScale(censusData, selectedY);
          // Render y axis
          yAxis = renderY(yLinearScale, yAxis);
          // Update circles with a new y value
          circlesGroup = renderCircles(circlesGroup, xLinearScale, selectedX, yLinearScale, selectedY);
          // Update the text
          textGroup = renderText(textGroup, xLinearScale, selectedX, yLinearScale, selectedY);
          // Update the tooltip
          circlesGroup = updateToolTip(selectedX, selectedY, circlesGroup);
        
          if (selectedY === "healthcare") {
          healthcareLabel.classed("active", true).classed("inactive", false);
          smokesLabel.classed("active", false).classed("inactive", true);
          obesityLabel.classed("active", false).classed("inactive", true);
        }
        else if (selectedY === "smokes") {
          healthcareLabel.classed("active", false).classed("inactive", true);
          smokesLabel.classed("active", true).classed("inactive", false);
          obesityLabel.classed("active", false).classed("inactive", true);
        }
        else {
          healthcareLabel.classed("active", false).classed("inactive", true);
          smokesLabel.classed("active", false).classed("inactive", true);
          obesityLabel.classed("active", true).classed("inactive", false);
        }
        }
      });
    
  }).catch(function(error) {
    console.log(error);
  });
