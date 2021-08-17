/* global d3 */

// set the dimensions and margins of the graph
var margin = { top: 20, right: 30, bottom: 20, left: 30 },
  width = 450 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom

// append the svg object to the body of the page
var svg = d3.select('#graph')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform',
    'translate(' + margin.left + ',' + margin.top + ')')

// Read dummy data
// eslint-disable-next-line max-len
d3.json('./data.json', function(data) {

  // List of node names
  var allNodes = data.nodes.map(function(d){
    return d.name
  })

  // A linear scale to position the nodes on the X axis
  var y = d3.scalePoint()
    .range([0, height])
    .domain(allNodes)

  // Add the circle for the nodes
  svg
    .selectAll('mynodes')
    .data(data.nodes)
    .enter()
    .append('circle')
    .attr('cx', 50)
    .attr('cy', function(d){
      return y(d.name)
    })
    .attr('r', 8)
    .style('fill', '#69b3a2')

  // And give them a label
  svg
    .selectAll('mylabels')
    .data(data.nodes)
    .enter()
    .append('text')
    .attr('x', 20)
    .attr('y', function(d){
      return y(d.name)
    })
    .text(function(d){
      return d.name
    })
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'middle')

  /**
   * Add links between nodes. Here is the tricky part.
   * In my input data, links are provided between nodes -id-,
   * NOT between node names.
   * So I have to do a link between this id and the name
   */
  var idToNode = {}
  data.nodes.forEach(function (n) {
    idToNode[n.id] = n
  })
  /**
   * Cool, now if I do idToNode["2"].name
   * I've got the name of the node with id 2
   */

  // Add the links
  svg
    .selectAll('mylinks')
    .data(data.links)
    .enter()
    .append('path')
    .attr('d', function (d) {
      // X position of start node on the X axis
      let start = y(idToNode[d.source].name)
      // X position of end node
      let end = y(idToNode[d.target].name) 
      return ['M',
        50,
        /** 
         * the arc starts at the coordinate x=start, y=height-30
         * (where the starting node is)
         */
        start,
        // This means we're gonna build an elliptical arc
        'A',
        (start - end) / 2 * 4,
        /**
         * Next 2 lines are the coordinates of the inflexion point.
         * Height of this point is proportional with start - end distance
         */
        ',', 
        (start - end) / 2,
        0,
        0,
        ',',
        start < end ? 1 : 0,
        50,
        ',',
        /**
         * We always want the arc on top. So if end is before start,
         * putting 0 here turn the arc upside down.
         */
        end] 
        .join(' ')
    })
    .style('fill', 'none')
    .attr('stroke', 'black')

})
