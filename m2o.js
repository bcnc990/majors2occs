var color_list = ['#BD226B', '#D92423', '#D96637', '#F38C3B', '#FBAF31', '#A6BE43', '#53B64E', '#0D723D',
  '#169882', '#55C4D5', '#25A0D8', '#147FE0', '#0B5D92', '#7D7BA4', '#8C65A9'];

var units = "%";

var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 800 - margin.left - margin.right,
    height = 1400 - margin.top - margin.bottom;

var formatPct = d3.format(".1f"),    // one decimal places
    pctFormat = function(d) { return formatPct(d) + " " + units; },
    formatComma = d3.format(","),
    p50Format = function(d) { return formatComma(d); },
    colorM = d3.scale.category20b(),
    colorO = d3.scale.category20c();

// append the svg canvas to the page
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "sankey")
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(10)
    .size([width, height]);

var path = sankey.link();

var dmgo, gmdo, dmdo;

function processData(data, param) {
  graph = {"nodes" : [], "links" : []};

  data.forEach(function (d) {
    d.value = d[param] * 100;
    //console.log(d);
    graph.nodes.push({ "name": d.source /*, "gmajor": d.gmajor */ /* this does not work: gmajor contains d.source after assigning nodes below */ });
    graph.nodes.push({ "name": d.target });
    graph.links.push({ "source": d.source,
                       "target": d.target,
                       "gmajor": d.gmajor,
                       "p50": d.radj_wagp,
                       "value": +d.value});
   });

   // return only the distinct / unique nodes
   graph.nodes = d3.keys(d3.nest()
     .key(function (d) { return d.name; })
     .map(graph.nodes));

   // loop through each link replacing the text with its index from node
   graph.links.forEach(function (d, i) {
     graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
     graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
   });

   //now loop through each nodes to make nodes an array of objects
   // rather than an array of strings
   graph.nodes.forEach(function (d, i) {
     graph.nodes[i] = { "name": d, "gmajor": d };
     /* not sure why gmajor field contains name even when assigned gmajor in above, use name instead to get gmajor */
     graph.nodes[i]["gmajor"] = graph.nodes[i]["gmajor"].substring(7);
   });
   return graph;
};

function renderSankey(dsn, param, nodeMOtxt = "percent of major") {
  d3.select('body').selectAll('g').remove();

  graph = processData(dsn, param);
  //console.log(graph);
  myLinks = graph.links;
  myNodes = graph.nodes;

  svg = d3.select('.sankey')
      .attr("width", width)
      .attr("height", height)
      .append("g");

  sankey = d3.sankey()
    .size([width, height])
    .nodes(myNodes)
    .links(myLinks)
    .layout(32);

  path = sankey.link();

// add in the links
  var link = svg.append("g").selectAll(".link")
      .data(myLinks)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

// add the link titles
  link.append("title")
        .text(function(d) {
    		return d.source.name + " → " +
                d.target.name + "\n" + pctFormat(d.value) + " (Median earnings: $" + p50Format(d.p50) + ")"; });

// add in the nodes
  var node = svg.append("g").selectAll(".node")
      .data(myNodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
		  return "translate(" + d.x + "," + d.y + ")"; })
      /* .on("click",function(d){
        if (d3.event.defaultPrevented) return;
        alert("clicked! "+d.name); })
      .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() {
		  this.parentNode.appendChild(this); })
      .on("drag", dragmove)) */;

// add the rectangles for the nodes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) {
      	  if (d.name.substring(0,5) === 'Major') {
            //console.log(d);
      	  	//var colornameM = d.name.substring(7);
      	  	//return d.color = colorM(colornameM.replace(/ .*/, ""));
            if (d.gmajor === "Agriculture and natural resources") {
              return d.color = color_list[0];
            } else if (d.gmajor === "Architecture and engineering") {
              return d.color = color_list[1];
            } else if (d.gmajor === "Arts") {
              return d.color = color_list[2];
            } else if (d.gmajor === "Biology and life sciences") {
              return d.color = color_list[3];
            } else if (d.gmajor === "Business") {
              return d.color = color_list[4];
            } else if (d.gmajor === "Communications and journalism") {
              return d.color = color_list[5];
            } else if (d.gmajor === "Computers, statistics, and mathematics") {
              return d.color = color_list[6];
            } else if (d.gmajor === "Education") {
              return d.color = color_list[7];
            } else if (d.gmajor === "Health") {
              return d.color = color_list[8];
            } else if (d.gmajor === "Humanities and liberal arts") {
              return d.color = color_list[9];
            } else if (d.gmajor === "Industrial arts, consumer services, and recreation") {
              return d.color = color_list[10];
            } else if (d.gmajor === "Law and public policy") {
              return d.color = color_list[11];
            } else if (d.gmajor === "Physical sciences") {
              return d.color = color_list[12];
            } else if (d.gmajor === "Psychology and social work") {
              return d.color = color_list[13];
            } else if (d.gmajor === "Social sciences") {
              return d.color = color_list[14];
            } else {
              var colornameM = d.name.substring(7);
              return d.color = colorM(colornameM.replace(/ .*/, ""));
            }
      	  }
      	  else {
      	  	var colornameO = d.name.substring(5);
      	  	return d.color = colorO(colornameO.replace(/ .*/, ""));
      	  }
		  // return d.color = color(colorname.replace(/ .*/, ""));
		  })
      .style("stroke", function(d) {
		  return d3.rgb(d.color).darker(2); })
      .append("title")
      .text(function(d) {
		  return d.name + "\n" + pctFormat(d.value) + " " + nodeMOtxt; });

// add in the title for the nodes
  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) {
      	if (d.name.substring(0,3) == 'Occ') {
      	    return d.name.substring(5);
      	  } else
      	  {
      	  	return d.name.substring(7); } })
      // .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");
    // the function for moving the nodes
    /*
      function dragmove(d) {
        d3.select(this).attr("transform",
            "translate(" + d.x + "," + (
                    d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
                ) + ")");
        sankey.relayout();
        link.attr("d", path);
      }
    */
};

// load the data (using the timelyportfolio csv method)
d3.csv("gocc_gmajor_sankey2554.csv", function(error, data) {

  // assign data to current data for use in filtering
  // steps for filtering follows https://bl.ocks.org/austinczarnecki/cc6371af0b726e61b9ab
  var gocc_gmajor_data = data;

  //set up graph in same style as original example but empty
  renderSankey(gocc_gmajor_data, "pct_overall", nodeMOtxt = "percent of Bachelor's degrees");
  //console.log(data);
  d3.select('#all-major-groups').on('click', function () {
    gocc_gmajor_data = data;
    renderSankey(gocc_gmajor_data, "pct_overall", nodeMOtxt = "percent of Bachelor's degrees");
    });

  d3.select('#agriculture-and-natural-resources').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Agriculture and natural resources') > -1;
      });
      //console.log(gocc_gmajor_data);
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      console.log(data);
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Agriculture and natural resources') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      //console.log(data); //refers to gocc_gmajor_data
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Agriculture and natural resources') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Agriculture and natural resources') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#architecture-and-engineering').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Architecture and engineering') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Architecture and engineering') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Architecture and engineering') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Architecture and engineering') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#arts').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Arts') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Arts') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Arts') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Arts') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#biology-and-life-sciences').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Biology and life sciences') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Biology and life sciences') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Biology and life sciences') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Biology and life sciences') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#business').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Business') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Business') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Business') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Business') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#communications-and-journalism').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Communications and journalism') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Communications and journalism') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Communications and journalism') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Communications and journalism') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#computers-statistics-and-mathematics').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Computers, statistics, and mathematics') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Computers, statistics, and mathematics') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Computers, statistics, and mathematics') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Computers, statistics, and mathematics') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#education').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Education') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Education') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Education') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Education') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#health').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Health') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Health') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Health') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Health') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#humanities-and-liberal-arts').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Humanities and liberal arts') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Humanities and liberal arts') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Humanities and liberal arts') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Humanities and liberal arts') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#industrial-arts-consumer-services-and-recreation').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Industrial arts') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Industrial arts') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Industrial arts') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Industrial arts') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#law-and-public-policy').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Law and public policy') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Law and public policy') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Law and public policy') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Law and public policy') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#physical-sciences').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Physical sciences') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Physical sciences') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Physical sciences') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Physical sciences') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#psychology-and-social-work').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Psychology and social work') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Psychology and social work') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Psychology and social work') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Psychology and social work') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });
  d3.select('#social-sciences').on('click', function () {
    if ($("#goccgmajor").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Social sciences') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
      } else if ($("#doccgmajor").hasClass("active")) {
      docc_gmajor_data = gmdo.filter(function (d) {
        return d["gmajor"].indexOf('Social sciences') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
      } else if ($("#goccdmajor").hasClass("active")) {
      gocc_dmajor_data = dmgo.filter(function (d) {
        return d["gmajor"].indexOf('Social sciences') > -1;
      });
      renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#doccdmajor").hasClass("active")) {
      docc_dmajor_data = dmdo.filter(function (d) {
        return d["gmajor"].indexOf('Social sciences') > -1;
      });
      renderSankey(docc_dmajor_data, "pct");
      }
    });


  /* Disable on load since all majors is displayed and no detail is
     available at this level */
  $("#goccdmajor").prop('disabled', true);
  $("#doccgmajor").prop('disabled', true);
  $("#doccdmajor").prop('disabled', true);

  $(".btnMajor .btn").click(function(){
    if ($("#all-major-groups").hasClass("active")) {
      $("#goccdmajor").prop('disabled', true);
      $("#doccgmajor").prop('disabled', true);
      $("#doccdmajor").prop('disabled', true);
    } else {
      $("#goccdmajor").prop('disabled', false);
      $("#doccgmajor").prop('disabled', false);
      $("#doccdmajor").prop('disabled', false);
    }
  });

  d3.select("#goccgmajor").on('click', function () {
    if ($("#agriculture-and-natural-resources").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Agriculture and natural resources') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#architecture-and-engineering").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Architecture and engineering') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#arts").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Arts') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#biology-and-life-sciences").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Biology and life sciences') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#business").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Business') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#communications-and-journalism").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Communications and journalism') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#computers-statistics-and-mathematics").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Computers, statistics, and mathematics') > -1;
      });
      renderSankey(docc_gmajor_data, "pct");
    } else if ($("#education").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Education') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#health").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Health') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#humanities-and-liberal-arts").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Humanities and liberal arts') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#industrial-arts-consumer-services-and-recreation").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Industrial arts, consumer services, and recreation') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#law-and-public-policy").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Law and public policy') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#physical-sciences").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Physical sciences') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#psychology-and-social-work").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Psychology and social work') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    } else if ($("#social-sciences").hasClass("active")) {
      gocc_gmajor_data = data.filter(function (d) {
        return d["gmajor"].indexOf('Social sciences') > -1;
      });
      renderSankey(gocc_gmajor_data, "pct");
    };
  });

  d3.select("#doccgmajor").on('click', function () {
    d3.csv("docc_gmajor_sankey2554.csv", function(error, data) {
      var docc_gmajor_data = data;
      gmdo = data;
      if ($("#agriculture-and-natural-resources").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Agriculture and natural resources') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#architecture-and-engineering").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Architecture and engineering') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#arts").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Arts') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#biology-and-life-sciences").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Biology and life sciences') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#business").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Business') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#communications-and-journalism").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Communications and journalism') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#computers-statistics-and-mathematics").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Computers, statistics, and mathematics') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#education").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Education') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#health").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Health') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#humanities-and-liberal-arts").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Humanities and liberal arts') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#industrial-arts-consumer-services-and-recreation").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Industrial arts, consumer services, and recreation') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#law-and-public-policy").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Law and public policy') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#physical-sciences").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Physical sciences') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#psychology-and-social-work").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Psychology and social work') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      } else if ($("#social-sciences").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Social sciences') > -1;
        });
        renderSankey(docc_gmajor_data, "pct");
      };
    });
  });
  d3.select("#goccdmajor").on('click', function () {
    d3.csv("gocc_dmajor_sankey2554.csv", function(error, data) {
      var gocc_dmajor_data = data;
      dmgo = gocc_dmajor_data;
      if ($("#agriculture-and-natural-resources").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Agriculture and natural resources') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#architecture-and-engineering").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Architecture and engineering') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#arts").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Arts') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#biology-and-life-sciences").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Biology and life sciences') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#business").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Business') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#communications-and-journalism").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Communications and journalism') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#computers-statistics-and-mathematics").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Computers, statistics, and mathematics') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#education").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Education') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#health").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Health') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#humanities-and-liberal-arts").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Humanities and liberal arts') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#industrial-arts-consumer-services-and-recreation").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Industrial arts, consumer services, and recreation') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#law-and-public-policy").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Law and public policy') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#physical-sciences").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Physical sciences') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#psychology-and-social-work").hasClass("active")) {
        gocc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Psychology and social work') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      } else if ($("#social-sciences").hasClass("active")) {
        docc_gmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Social sciences') > -1;
        });
        renderSankey(gocc_dmajor_data, "pct");
      };
    });
  });
  d3.select("#doccdmajor").on('click', function () {
    d3.csv("docc_dmajor_sankey2554.csv", function(error, data) {
      var docc_dmajor_data = data;
      dmdo = docc_dmajor_data;
      if ($("#agriculture-and-natural-resources").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Agriculture and natural resources') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#architecture-and-engineering").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Architecture and engineering') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#arts").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Arts') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#biology-and-life-sciences").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Biology and life sciences') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#business").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Business') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#communications-and-journalism").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Communications and journalism') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#computers-statistics-and-mathematics").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Computers, statistics, and mathematics') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#education").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Education') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#health").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Health') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#humanities-and-liberal-arts").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Humanities and liberal arts') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#industrial-arts-consumer-services-and-recreation").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Industrial arts, consumer services, and recreation') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#law-and-public-policy").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Law and public policy') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#physical-sciences").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Physical sciences') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#psychology-and-social-work").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Psychology and social work') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      } else if ($("#social-sciences").hasClass("active")) {
        docc_dmajor_data = data.filter(function (d) {
          return d["gmajor"].indexOf('Social sciences') > -1;
        });
        renderSankey(docc_dmajor_data, "pct");
      };
    });
  });

});

$(".btnMajor .btn").click(function(){
    $(".btnMajor .btn").removeClass("active");
    $(this).addClass("active");
  });
$(".btnType .btn").click(function(){
    $(".btnType .btn").removeClass("active");
    $(this).addClass("active");
  });
