let dataOfDate = new Set();
let selectedDate = 201008;
let selectedCities = new Set();
let minDate;
let maxDate;

function showCity(cities) {
	var svg = d3.select(".selector");
	var width = +svg.attr('width');
	var height = +svg.attr('height'); 

	let margin = 20;
	let buttonHeight = height - 2 * margin;
	let buttonWidth = (width - (cities.length+1) * margin) / cities.length;
	// let buttonHeight = 70;
	// let buttonWidth = 150;

	for (let i = 0; i < cities.length; i++) {
		svg.append("rect")
		   .attr("class", "unclicked")
           .attr("rx", "15")
		   .attr("width", buttonWidth)
		   .attr("height", buttonHeight)
		   .attr("fill", "#0062cc")
		   .attr("x", margin)
		   .attr("y", margin + (buttonWidth + margin) * i)
		   .on('mouseenter', function() {
		   	   d3.select(this).style("fill", "#B2BEB5");
		   })
		   .on('mouseleave', function() {
		   	   d3.select(this).style("fill", "#0062cc");
		   })
		   .on('click', function() {
		   	    let rect = d3.select(this);

		   	    if (rect.attr("class") == "unclicked") {
	   	        	rect.attr("class", "clicked")
	   	        	    .style("fill", "grey")
	   	                .on('mouseenter',null)
	   	                .on('mouseleave',null)

			   	    selectedCities.add(cities[i]);
			   	} else {
			   		rect.attr("class", "unclicked")
			   		    .style("fill", "#0062cc")
			   		    .on('mouseenter', function() {
					   	   d3.select(this).style("fill", "#B2BEB5");
					    })
					    .on('mouseleave', function() {
					   	   d3.select(this).style("fill", "#0062cc");
					    })
					selectedCities.delete(cities[i]);
			   	}

		   	    plotLines(window.data, Array.from(selectedCities));

		   });
		// svg.append("text")
	    //  .attr("class", "city")
	    //  .attr("text-anchor", "middle")
        //  .attr("color", "white")
	    //  .attr("x", height / 2)
	    //  .attr("y", margin + buttonWidth / 2 + (margin + buttonWidth) * i)
	    //  .text(cities[i]);

		 svg.append("text")
	     .attr("class", "city")
	     .attr("text-anchor", "middle")
         .attr("color", "white")
	     .attr("x", margin + buttonWidth / 2 + (margin + buttonWidth) * i)
	     .attr("y", height / 2)
	     .text(cities[i]);
	}

}


function plotLines(data, cities) {

	var svg = d3.select('.linechart');
   	d3.selectAll(".linechart > *").remove();

	var width = +svg.attr('width');
	var height = +svg.attr('height'); 

	let title = "GDP 1970-2019";
	let xLabel = "Date";
	let yLabel = "Housing Price"

	let margin = {left:130, right:150, top:20, bottom: 100};
	let innerWidth = width - margin.left - margin.right;
	let innerHeight = height - margin.top - margin.bottom;

	var xScale = d3.scaleLinear()
	               .domain([d3.min(data, d => d["Date"]), d3.max(data, d => d["Date"])])
	               .range([0, innerWidth])

	var yScale = d3.scaleLinear()
				   .domain([0, getMax(data, cities)])
				   .range([innerHeight, 0]);

    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

	let g = svg.append('g')
	           .attr('transform', `translate(${margin.left}, ${margin.top})`)

	g.append('g').call(d3.axisLeft(yScale));
    g.append('g').call(d3.axisBottom(xScale))
    	         .attr('transform', `translate(0, ${innerHeight})`);

    for (let i = 0; i < cities.length; i++) {
	    g.append("path")
	     .datum(data)
	     .attr("fill", "none")
	     .attr("stroke", colorScale(i))
	     .attr("stroke-width", 5)
	     .attr("d", d3.line()
	        .x(function(d) { return xScale(d.Date) })
	        .y(function(d) { return yScale(d[cities[i]]) })
	    );
	    g.append("circle")
	     .attr("fill", colorScale(i))
	     .attr("cx", innerWidth + 20)
	     .attr("cy", (i + 1/2) * innerHeight / cities.length / 2)
	     .attr("r", 5);
	    g.append("text")
	     .attr("class", "legendLabel")
	     .attr("x", innerWidth + 20 + 20)
	     .attr("y", (i + 1/2) * innerHeight / cities.length / 2)
	     .text(cities[i]);
 	}
	g.append('line')
	 .attr('class', 'selectedDate')
	 .attr('x1', xScale(selectedDate))
	 .attr('x2', xScale(selectedDate))
	 .attr('y1', 0)
	 .attr('y2', innerHeight)

	g.append('rect')
	 .attr('width', innerWidth)
	 .attr('height', innerHeight)
	 .attr('fill', 'none')
	 .attr('pointer-events', 'all')
	 .on('mousemove', () => {
		// console.log(g.node())
	 	let x = d3.mouse(g.node())[0]
	 	selectedDate = Math.ceil(xScale.invert(x));
        // console.log("Selected Date 1: ", d3.mouse(g.node()))
        selectedDate = Math.max(minDate, Math.min(selectedDate, maxDate));
        // console.log(minDate);
	 	var line = d3.select(".selectedDate");
	 	line.attr("x1", x);
	 	line.attr("x2", x);
	 })
	 .on('click', () => {
	 	dataOfDate.clear();

	 	for (let [key, value] of Object.entries(data[selectedDate - minDate])) {
	 		if (selectedCities.has(key))
		    	dataOfDate.add([key, value]);
		}

		let arr = Array.from(dataOfDate);
		arr.sort(function(a,b){
		    return b[1] - a[1];
		});

	 	plotBar(arr);
	 });

	g.append("text")
     .attr("class", "xLabel")
     .attr("x", innerWidth / 2)
     .attr("y", innerHeight + 50)
     .text(xLabel);

    g.append("text")
     .attr("class", "yLabel")
     .attr("x", -margin.left)
     .attr("y", innerHeight / 2)
     .text(yLabel);

}


function getMax(data, cities) {
	let max = d3.max(data, d => d[cities[0]]);
	for (let i = 0; i < cities.length; i++) {
		let newItem = d3.max(data, d => d[cities[i]]);
		if (newItem > max) {
			max = newItem;
		}
	}

	return max;
}






d3.csv('housing.csv').then(data => {

	data.forEach(d => {
		d["Date"] = +d["Date"];
		d["New York"] = +d["New York"];
		d["Los Angeles"] = +d["Los Angeles"];
		d["Chicago"] = +d["Chicago"];
		d["Washington DC"] = +d["Washington DC"];
		d["Miami"] = +d["Miami"];
        d["Atlanta"] = +d["Atlanta"];
        d["Boston"] = +d["Boston"];
        d["San Francisco"] = +d["San Francisco"]
		d["Seattle"] = +d["Seattle"]
	});

	let cities = data.columns.slice();
	cities.shift();
    console.log(cities)
	showCity(cities);

	minDate = d3.min(data, d => d["Date"]);
	maxDate = d3.max(data, d => d["Date"]);
    console.log("Hello")
    // Save data as a global variable for later use.
	window.data = data;
});

const linechart = d3.select(".linechart")
console.log(linechart)




