
/**
 * Create the Bubble Graph
 */

// Set dimensions for all the graphs (except pie chart)
var margin = {top: 10, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;

// Add an SVG to the bubble graph div
let svg_bubble = d3.select("#bubble_graph")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Make a GET Request to the FastAPI
let xmlHttp_bubble = new XMLHttpRequest();
xmlHttp_bubble.open("GET", "http://127.0.0.1:8000/getWeatherStat", true); // Aysnc GET request
xmlHttp_bubble.onload = function (e) {
    if (xmlHttp_bubble.readyState === 4 && xmlHttp_bubble.status === 200) { // If successful
        // Read the Data
        let data = JSON.parse(xmlHttp_bubble.responseText)["res"];
        
        // Add X axis
        let x = d3.scaleLinear()
        .domain([-25, 40]) // The actual value range
        .range([ 0, width ]); // The output value range
        
        // Add the graphic for the x-axis
        svg_bubble.append("g") 
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

        // Add Y axis
        let y = d3.scaleLinear()
        .domain([-15, 50])
        .range([ height, 0]);
        svg_bubble.append("g") // Add graphic for y-axis
        .call(d3.axisLeft(y));

        // Add a scale for bubble size
        let z = d3.scaleLinear()
        .domain([0, 30])
        .range([ 1, 40]);

        // Add Colouration
        let myColor = d3.scaleSequential()
        .domain([10000,70000])
        .interpolator(d3.interpolatePuRd); // Pick a colour palette

        // Create a tooltip div that is hidden by default
        let tooltip = d3.select("#bubble_graph")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")

        // Create three functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        let showTooltip = function(d) {
          tooltip
            .transition()
            .duration(200)
          tooltip
            .style("opacity", 1)
            .html("Code: " + d.code)
            .style("left", (d3.mouse(this)[0]+30) + "px")
            .style("top", (d3.mouse(this)[1]+30) + "px")
        }
        let moveTooltip = function(d) {
          tooltip
            .style("left", (d3.mouse(this)[0]+30) + "px")
            .style("top", (d3.mouse(this)[1]+30) + "px")
        }
        let hideTooltip = function(d) {
          tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
        }

        // Add dots
        svg_bubble.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.min_temp); } )
        .attr("cy", function (d) { return y(d.max_temp); } )
        .attr("r", function (d) { return z(d.max_wind_speed); } )
        .style("fill", function (d) { return myColor(d.code); } )
        .style("opacity", "0.7")
        .attr("stroke", "black")
        .on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip );

    } else {
        console.error(xmlHttp_bubble.statusText);
    }
};
xmlHttp_bubble.onerror = function (e) {
    console.error(xmlHttp_bubble.statusText);
};
xmlHttp_bubble.send(null);

/**
 * Create the Histogram
 */

// Add SVG to datavis
let svg_bar = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Make a GET Request to the FastAPI
let xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", "http://127.0.0.1:8000/getWeatherStat", true); // Async GET request
xmlHttp.onload = function (e) {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) { // If successful
        // Read the Data
        let data = JSON.parse(xmlHttp.responseText)["res"];
        
        // X axis: scale and draw
        var x = d3.scaleLinear()
            .domain([0, 20])
            .range([0, width]);
            svg_bar.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Y axis: initialization
        var y = d3.scaleLinear()
            .range([height, 0]);
        var yAxis = svg_bar.append("g")

        // A function that builds the graph for a specific value of bin
        function update(nBin) {

          // Set the parameters for the histogram
          let histogram = d3.histogram()
              .value(function(d) { return d.max_wind_speed; }) 
              .domain(x.domain())  
              .thresholds(x.ticks(nBin)); 

          // And apply this function to data to get the bins
          let bins = histogram(data);

          // Y axis: update now that we know the domain
          y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
          yAxis
              .transition()
              .duration(1000)
              .call(d3.axisLeft(y));

          // Join the rect with the bins data
          let u = svg_bar.selectAll("rect")
              .data(bins)

          // Manage the existing bars and eventually the new ones:
          u
              .enter()
              .append("rect") // Add a new rect for each new elements
              .merge(u) // get the already existing elements as well
              .transition() // and apply changes to all of them
              .duration(1000)
                .attr("x", 1)
                .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
                .attr("height", function(d) { return height - y(d.length); })
                .style("fill", "#69b3a2")


          // If less bar in the new histogram, I delete the ones not in use anymore
          u
              .exit()
              .remove()

          }


        // Initialize with 20 bins
        update(20)


        // Listen to the button -> update if user changes it
        d3.select("#nBin").on("input", function() {
          update(+this.value);
        });

    } else {
        console.error(xmlHttp.statusText);
    }
};
xmlHttp.onerror = function (e) {
    console.error(xmlHttp.statusText);
};
xmlHttp.send(null);

/**
 * Create the Map Graph
 */

// Append the SVG to the map div
let svg_map = d3.select("#map_korea")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Map and projection
var projection = d3.geoMercator()
    .center([129, 37]) // GPS of location to zoom on
    .scale(3000) // This is the "zoom"
    .translate([ width/2, height/2 ])

// Load external data (GeoJSON)
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function(data){

    // Filter data and chooses South Korea
    data.features = data.features.filter(function(d){return d.properties.name=="South Korea"})

    // Draw the map
    svg_map.append("g")
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
        .attr("fill", "grey")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
      .style("stroke", "none")
    
    // Make a GET request to FastAPI to grab the infection location details
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "http://127.0.0.1:8000/grabInfectionLocationDetails", true); // Async GET request
    xmlHttp.onload = function (e) {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) { // If successful
            // Read the Data
            let markers = JSON.parse(xmlHttp.responseText)["res"];

            // Create a color scale
            let myColor = d3.scaleSequential()
            .domain([204088,12479061])
            .interpolator(d3.interpolateYlOrRd); // Pick a colour palette

            // Add a scale for bubble size
            let size = d3.scaleLinear()
              .domain([464.89999,19031.40039])  // What's in the data
              .range([ 4, 50])  // Size in pixel

             // Create a tooltip (hover data)
            let Tooltip = d3.select("#map_korea")
              .append("div")
              .attr("class", "tooltip")
              .style("opacity", 1)
              .style("background-color", "white")
              .style("border", "solid")
              .style("border-width", "2px")
              .style("border-radius", "5px")
              .style("padding", "5px")

            // Three function that change the tooltip when user hover / move / leave a cell
            let mouseover = function(d) {
              Tooltip.style("opacity", 1)
            }
            let mousemove = function(d) {
              Tooltip
                .html(d.infcase + "<br>" + "lon: " + d.lon + "<br>" + "lat: " + d.lat)
                .style("left", (d3.mouse(this)[0]+10) + "px")
                .style("top", (d3.mouse(this)[1]+100) + "px")
            }
            let mouseleave = function(d) {
              Tooltip.style("opacity", 0)
            }


            // Add circles
            svg_map
              .selectAll("myCircles")
              .data(markers)
              .enter()
              .append("circle")
                .attr("cx", function(d){ return projection([d.lon, d.lat])[0] })
                .attr("cy", function(d){ return projection([d.lon, d.lat])[1] })
                .attr("r", function(d){ return size(d.area) })
                .style("fill", function(d){ return myColor(d.population) })
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 3)
                .attr("fill-opacity", .4)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);

          } else {
            console.error(xmlHttp.statusText); // If error, say so
        }
        };
        xmlHttp.onerror = function (e) {
            console.error(xmlHttp.statusText); // If error
        };
        xmlHttp.send(null); // Make request
})

/**
 * Create the Pie Graph
 */

// Set the dimensions and margins of the donut pie chart
let width_pie = 600
    height_pie = 450
    margin_pie = 40;

// The radius of the pieplot is half the width or half the height (smallest one). Subtract a bit of margin
var radius = Math.min(width_pie, height_pie) / 2 - margin_pie

// Append SVG to "pie_chart" card
var svg = d3.select("#pie_chart")
  .append("svg")
    .attr("width", width_pie)
    .attr("height", height_pie)
  .append("g")
    .attr("transform", "translate(" + width_pie / 2 + "," + height_pie / 2 + ")");


// Make a GET Request to the FastAPI for ageDistribution query
let xmlHttp_pie = new XMLHttpRequest();
xmlHttp_pie.open("GET", "http://127.0.0.1:8000/ageDistribution", true); // Async GET request
xmlHttp_pie.onload = function (e) {
    if (xmlHttp_pie.readyState === 4 && xmlHttp_pie.status === 200) { // If successful
        // Read the Data
        let data = JSON.parse(xmlHttp_pie.responseText)["res"];

        // set the color scale
        var color = d3.scaleSequential()
        .domain([0, 100])
        .interpolator(d3.interpolateViridis);

        // Compute the position of each group on the pie:
        var pie = d3.pie()
          .sort(null) // Do not sort group by size
          .value(function(d) {return d.value; })
        var data_ready = pie(d3.entries(data))

        // The arc generator
        var arc = d3.arc()
          .innerRadius(radius * 0.5) // Size of the hole
          .outerRadius(radius * 0.8)

        // Another arc that won't be drawn. Just for labels positioning
        var outerArc = d3.arc()
          .innerRadius(radius * 0.9)
          .outerRadius(radius * 0.9)

        // Build the pie chart: each part of the pie is a path that we build using the arc function.
        svg
          .selectAll('allSlices')
          .data(data_ready)
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', (d) => color(parseInt(d.data.key)))
          .attr("stroke", "white")
          .style("stroke-width", "2px")
          .style("opacity", 0.7)

        // Add the polylines between chart and labels
        svg
          .selectAll('allPolylines')
          .data(data_ready)
          .enter()
          .append('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function(d) {
              var posA = arc.centroid(d) // line insertion in the slice
              var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
              var posC = outerArc.centroid(d); // Label position = almost the same as posB
              var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
              posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
              return [posA, posB, posC]
            })

        // Add the polylines between chart and labels
        svg
          .selectAll('allLabels')
          .data(data_ready)
          .enter()
          .append('text')
            .text( function(d) { return d.data.key } )
            .attr('transform', function(d) {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
            })
            .style('text-anchor', function(d) {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })

    } else {
      console.error(xmlHttp_pie.statusText); // If error, say so
    }
};
xmlHttp_pie.onerror = function (e) {
    console.error(xmlHttp_pie.statusText);
};
xmlHttp_pie.send(null); // Send request
