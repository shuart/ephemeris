var createOccurrenceDiagram = function ({
  onSave= undefined,
  onClose= undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;



  var init = function () {
    connections()
    render()
  }
  var connections =function () {

  }

  var render = function () {
    sourceOccElement = document.createElement('div');
    sourceOccElement.style.height = "100%"
    sourceOccElement.style.width = "100%"
    sourceOccElement.style.zIndex = "11"
    sourceOccElement.style.position = "fixed"

    var dimmer = document.createElement('div');
    dimmer.classList="dimmer occurence-dimmer"
    var mainEl = document.createElement('div');

    mainEl.style.position = "fixed"
    mainEl.style.top = "0px"
    mainEl.style.display = "flex"
    mainEl.style.flexDirection = "column"
    mainEl.style.zIndex = "9999999999"
    mainEl.style.backgroundColor = "white"

    mainEl.classList ="ui raised padded container segment"
    // mainEl.style.width = "50%"
    mainEl.style.width = "90%"
    mainEl.style.maxHeight = "90%"
    mainEl.style.left= "5%";
    // mainEl.style.left= "25%";

    var menuArea = document.createElement("div");
    menuArea.style.padding = "3px";
    var saveButton = document.createElement("button")
    saveButton.classList ="ui mini basic primary button";
    saveButton.innerHTML ="Save"
    saveButton.addEventListener('click', event => {
      if (onSave) {

      };
    });
    var closeButtonOCC = document.createElement("button")
    closeButtonOCC.classList ="ui mini red basic button closeButtonOCC";
    closeButtonOCC.innerHTML ="Close"
    closeButtonOCC.addEventListener('click', event => {
      if (onClose) {

      }
      console.log(sourceOccElement);
      // alert("fefsefes")
      sourceOccElement.remove()
    });
    // menuArea.appendChild(saveButton)
    menuArea.appendChild(closeButtonOCC)
    menuArea.appendChild(toNode(`<div class='occ-graph-select'>
      <div class="select rightTop">
      <select id="order">
        <option value="name">Alphabetical</option>
        <option value="count">Quantity</option>
        <option value="group"></option>
      </select>
      </div>
    </div>`))

    var textarea = `
    <div class="container occ-graph">
         <graph></graph>

     </div>
    `
    sourceOccElement.appendChild(dimmer)
    sourceOccElement.appendChild(mainEl)
    mainEl.appendChild(menuArea)
    mainEl.appendChild(toNode(textarea))

    document.body.appendChild(sourceOccElement)
    renderDiagram(originalData)
    var svgPanZoom= $(".occ-graph svg").svgPanZoom({maxZoom:11})
  }

  var renderDiagram = function (originalData) {




         var margin = {
          top: 100,
          right: 0,
          bottom: 0,
          left: 200
          },
          width = 700,
          height = 700;

        var svg = d3.select("graph").append("svg")
            // .attr("width", width + margin.left + margin.right)
            // .attr("height", height + margin.top + margin.bottom)
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ") scale(0.5)");

        svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height);

            transformData(originalData)

        function transformData(data) {
            var matrix = [];
            var nodes = data.nodes;
            var total_items = nodes.length;

            var matrixScale = d3.scaleBand().range([0, width]).domain(d3.range(total_items));
            var opacityScale = d3.scaleLinear().domain([0, 10]).range([0.3, 1.0]).clamp(true);
            var colorScale = d3.scaleSequential(d3.interpolateYlGn);

              console.log(nodes);

            // Create rows for the matrix
            nodes.forEach(function(node, index) {
                node.count = 0;
                node.group = node.group;
                node.index = index
                // node.group = groupToInt(node.group);
                matrix[node.index] = d3.range(total_items).map(item_index => {
                    return {
                        x: item_index,
                        y: node.index,
                        z: 0
                    };
                });
            });

            console.log(matrix);

            // Fill matrix with data from links and count how many times each item appears
            data.links.forEach(function(link) {
                matrix[link.source][link.target].z += link.value;
                matrix[link.target][link.source].z += link.value;
                nodes[link.source].count += link.value;
                nodes[link.target].count += link.value;
            });

            // Draw each row (translating the y coordinate)
            var rows = svg.selectAll(".row")
                .data(matrix)
                .enter().append("g")
                .attr("class", "row")
                .attr("transform", (d, i) => {
                    return "translate(0," + matrixScale(i) + ")";
                });

            var squares = rows.selectAll(".cell")
                .data(d => d.filter(item => item.z > 0))
                .enter().append("rect")
                .attr("class", "cell")
                .attr("x", d => matrixScale(d.x))
                .attr("width", matrixScale.bandwidth())
                .attr("height", matrixScale.bandwidth())
                .style("fill-opacity", d => opacityScale(d.z))
                .style("fill", d => {
                    return nodes[d.x].group == nodes[d.y].group ? colorScale(nodes[d.x].group) : "grey";
                })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("click", click);

            var columns = svg.selectAll(".column")
                .data(matrix)
                .enter().append("g")
                .attr("class", "column")
                .attr("transform", (d, i) => {
                    return "translate(" + matrixScale(i) + ")rotate(-90)";
                });

            rows.append("text")
                .attr("class", "label")
                .attr("x", -5)
                .attr("y", matrixScale.bandwidth() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "end")
                .attr("style", "font-size:"+Math.min(40,(matrixScale.bandwidth() / 1.3))+"px")
                .text((d, i) => capitalize_Words(nodes[i].name));

            columns.append("text")
                .attr("class", "label")
                .attr("y", 100)
                .attr("y", matrixScale.bandwidth() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "start")
                .attr("style", "font-size:"+ Math.min(40,(matrixScale.bandwidth() / 1.3))+"px")
                .attr("transform", function(d) {
                  return "translate(15)rotate(25)"
                })
                .text((d, i) => capitalize_Words(nodes[i].name));

            // Precompute the orders.
            var orders = {
                name: d3.range(total_items).sort((a, b) => {
                    return d3.ascending(nodes[a].name, nodes[b].name);
                }),
                count: d3.range(total_items).sort((a, b) => {
                    return nodes[b].count - nodes[a].count;
                }),
                group: d3.range(total_items).sort((a, b) => {
                    return nodes[b].group - nodes[a].group;
                })
            };

            d3.select("#order").on("change", function() {
                changeOrder(this.value);
            });

            function changeOrder(value) {
                matrixScale.domain(orders[value]);
                var t = svg.transition().duration(1000);

                t.selectAll(".row")
                    .delay((d, i) => matrixScale(i) * 4)
                    .attr("transform", function(d, i) {
                        return "translate(0," + matrixScale(i) + ")";
                    })
                    .selectAll(".cell")
                    .delay(d => matrixScale(d.x) * 4)
                    .attr("x", d => matrixScale(d.x));

                t.selectAll(".column")
                    .delay((d, i) => matrixScale(i) * 4)
                    .attr("transform", (d, i) => "translate(" + matrixScale(i) + ")rotate(-90)");
            }

            rows.append("line")
                .attr("x2", width);

            columns.append("line")
                .attr("x1", -width);

            var tooltip = d3.select(".occ-graph")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            function mouseover(p) {
                d3.selectAll(".row text").classed("active", (d, i) => {
                    return i == p.y;
                });
                d3.selectAll(".column text").classed("active", (d, i) => {
                    return i == p.x;
                });
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(capitalize_Words(nodes[p.y].name) + "</br>" +
                        capitalize_Words(nodes[p.x].name) + "</br>" +
                        p.z + " interface")
                    .style("left", (d3.event.pageX - 200) + "px")
                    .style("top", (d3.event.pageY +10) + "px");
                // tooltip.html(capitalize_Words(nodes[p.y].name) + " [" + intToGroup(nodes[p.y].group|| '') + "]</br>" +
                //         capitalize_Words(nodes[p.x].name) + " [" + intToGroup(nodes[p.x].group|| '') + "]</br>" +
                //         p.z + " interface")
                //     .style("left", (d3.event.pageX - 200) + "px")
                //     .style("top", (d3.event.pageY +10) + "px");

            }
            function click(p) {
              console.log(p);
              console.log(nodes[p.x]);
              showSingleItemService.showById(nodes[p.x].linkUuid, function (e) {

              })
            }

            function mouseout() {
                d3.selectAll("text").classed("active", false);
                tooltip.transition().duration(500).style("opacity", 0);
            }
        };

        /* utils */

      function groupToInt(area) {
          if(area == "test"){
              return 1;
          }else if (area == "later"){
              return 2;
          }else if (area == "later"){
              return 3;
          }else if (area == "later"){
              return 4;
          }else if (area == "later"){
              return 5;
          }else if (area == "later"){
              return 6;
          }
      };

      function intToGroup(area) {
          if(area == 1){
              return "later";
          }else if (area == 2){
              return "later";
          }else if (area == 3){
              return "later";
          }else if (area == 4){
              return "later";
          }else if (area == 5){
              return "later";
          }else if (area == 6){
              return "later";
          }
      };

      function capitalize_Words(str){
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      }
  }

  var update = function () {
    render()
  }

  var setActive =function () {
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  init()

  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

// createInputPopup({originalData:jsonFile})
