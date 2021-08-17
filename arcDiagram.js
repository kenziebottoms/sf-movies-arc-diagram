/* global d3 */
/* eslint-disable max-len */

const ARC_DIV_ID = '#arc'
const ARC_MARGIN = 50

// append the svg object to the body of the page
const arcSvg = d3.select(ARC_DIV_ID)
  .append('svg')
  .attr('width', window.innerWidth)
  .attr('height', window.innerHeight)
  .append('g')
  .attr('transform', `translate(${ARC_MARGIN},${ARC_MARGIN})`)

// Read dummy data
// eslint-disable-next-line max-len
d3.json('./data.json').then(function(rawData) {
  const data = {
    links: rawData.links.map(([source, target]) => ({ source, target })),
    nodes: rawData.nodes
      .map(([name, year]) => ({ name, year }))
      .sort(({ year: year1 }, { year: year2 }) => year1 - year2)
  }

  const maxNameLen = Math.max(...rawData.nodes.map(([name, _year]) => name.length))
  const labelColWidth = maxNameLen * 8
  const labelMarginLeft = 20
  const circleMarginLeft = 20
  const circleX = labelColWidth + labelMarginLeft + circleMarginLeft

  const allNodes = data.nodes.map((d) => d.name)

  // A linear scale to position the nodes on the X axis
  const y = d3.scalePoint()
    .range([0, window.innerHeight - ARC_MARGIN * 2])
    .domain(allNodes)
  
  // Add the circle for the nodes
  const nodes = arcSvg
    .selectAll('mynodes')
    .data(data.nodes)
    .join('circle')
    .attr('cx', circleX)
    .attr('cy', (d) => y(d.name))
    .attr('r', 8)
    .style('fill', '#69b3a2')
  
  // And give them a label
  arcSvg
    .selectAll('mylabels')
    .data(data.nodes)
    .join('text')
    // The right alignment of the label
    .attr('x', labelColWidth + labelMarginLeft)
    .attr('y', (d) => y(d.name) + 5)
    .text(({ name, year }) => `${name} (${year})`)
    .style('text-anchor', 'end')
    .style('font-family', 'monospace')
    .style('font-size', '15px')
  
  /*
   * Add links between nodes. Here is the tricky part.
   * In my input data, links are provided between nodes -id-, NOT between node names.
   * So I have to do a link between this id and the name
   */
  const nameHash = {}
  data.nodes.forEach((n) => nameHash[n.name] = n)
  
  // Add the links
  const links = arcSvg
    .selectAll('mylinks')
    .data(data.links)
    .join('path')
    .attr('d', (d) => {
      const start = y(nameHash[d.source].name) // X position of start node on the X axis
      const end = y(nameHash[d.target].name) // X position of end node
      return [
        'M',
        circleX,
        // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
        start,
        // This means we're gonna build an elliptical arc
        'A',
        start - end,
        // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
        ',',
        (start - end) / 2,
        0,
        0,
        ',',
        start < end ? 1 : 0,
        circleX,
        ',',
        // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
        end
      ] .join(' ')
    })
    .style('fill', 'none')
    .attr('stroke', 'black')
  
  // Add the highlighting functionality
  nodes
    .on('mouseover', function(event, d){
      // Highlight the nodes: every node is green except of him
      nodes.style('fill', '#B8B8B8')
      d3.select(this).style('fill', '#69b3b2')
      // Highlight the connections
      links
        .style('stroke', (a) => a.source === d.name || a.target === d.name ? '#69b3b2' : '#b8b8b8')
        .style('stroke-width', (a) => a.source === d.name || a.target === d.name ? 4 : 1)
    })
    .on('mouseout', function(_event, _d){
      nodes.style('fill', '#69b3a2')
      links
        .style('stroke', 'black')
        .style('stroke-width', '1')
    })
})
