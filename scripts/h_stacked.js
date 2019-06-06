function make_h_stacked(csv_file,divID, legendID){
  var margin = {top: 80, right: 10, bottom: 0, left: 75},
    width = 650 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;



  var g = d3.select("#"+divID).append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("align","center")
  .append("g")
  .attr("transform","translate(" + margin.left + "," + margin.top + ")");


    var y = d3.scaleBand()
        .rangeRound([0, height])
        .padding(0.1)
        .align(0.1);

    var x = d3.scaleLinear()
        .rangeRound([width, 0]);

    var z = d3.scaleOrdinal()
        .range(['#5cbddd','#1c5f83','#66666E','#fefefe','#7ebea5','#3c765f','#EFE9AE','#AFBE8F']);

    var stack = d3.stack()
        .offset(d3.stackOffsetExpand);

    d3.csv(csv_file, type, function (error, data) {
        if (error) throw error;

        // List of subgroups = header of the csv files = soil condition here
        var subgroups = data.columns.slice(1)

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        var groups = d3.map(data, function(d){return(d.Index)}).keys()

        y.domain(data.map(function (d) {
            return d.Index;
        }));
        z.domain(data.columns.slice(1));

        var mouseover = function(d, i) {
          // what subgroup are we hovering?
          var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
          var subgroupValue = d.data[subgroupName];
          var obsvalue;
          var modelvalue;

          d3.selectAll("."+divID+"class").style("opacity", 0.2).select("text").remove();

          var bardata = serie.selectAll("rect")
              .data(function (d) {
                if(d.key == subgroupName){
                  obsvalue =  (d[0].data[subgroupName])
                  modelvalue =  (d[1].data[subgroupName])
                }
                return d
              })

          console.log(obsvalue)

          // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
          d3.selectAll("."+subgroupName)
            .style("opacity", 1)
            .append("text")
              .attr("x", 60)
              .attr("y", -30) // 100 is where the first dot appears. 25 is the distance between dots
              .text(subgroupName.replace(/_/g, " ") + " - Observed Total = " + obsvalue + " | Modeled Total = "+modelvalue)
              .attr("text-anchor", "left")
              .style("alignment-baseline", "middle")
              .style("fill","black")
              .style("font-size","16px")
        }

      // When user do not hover anymore
      var mouseleave = function(d) {
        // Back to normal opacity: 0.8
        d3.selectAll("."+divID+"class")
          .style("opacity",0.8)
          .select("text").remove();
        }


        var serie = g.selectAll(".serie")
            .data(stack.keys(data.columns.slice(1))(data))
            .enter().append("g")
            .attr("class", "serie")
            .attr("fill", function (d) {
                return z(d.key);
            })
            .attr("class", function(d){
              return divID+"class " + d.key })



        var bar = serie.selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("y", function (d) {
                return y(d.data.Index);
            })
            .attr("x", function (d) {
                return x(d[1]);
            })
            .attr("width", function (d) {
                return x(d[0]) - x(d[1]);
            })
            .attr("height", y.bandwidth())
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)

        bar.append("text")
            .attr("x", function (d) {
                return x(d[1]);
            })
            .attr("dy", "1.35em")
            .text(function (d) { return d; });

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y));

            // select the svg area
    var legend = d3.select("#"+legendID).append("svg")
    .attr("height", 210)
    .attr("width", 250)

    // create a list of keys
    var keys = data.columns.slice(1)

    // Usually you have a color scale in your chart already
    var color = d3.scaleOrdinal()
      .domain(keys)
      .range(['#5cbddd','#1c5f83','#66666E','#fefefe','#7ebea5','#3c765f','#EFE9AE','#AFBE8F']);

    // Add one dot in the legend for each name.
    legend.selectAll("mydots")
      .data(keys)
      .enter()
      .append("circle")
        .attr("cx", 10)
        .attr("cy", function(d,i){ return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return color(d)})

    // Add one dot in the legend for each name.
    legend.selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
        .attr("x", 20)
        .attr("y", function(d,i){ return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .text(function(d){ return d.replace(/_/g, " ")})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        });

    function type(d, i, columns) {
        var t;
        for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
        d.total = t;
        return d;
    }
}