/* global d3 */
/* eslint-disable max-len */

const NETWORK_DIV_ID = '#network'
const NETWORK_MARGIN = 50

// append the svg object to the body of the page
const networkSvg = d3.select(NETWORK_DIV_ID)
  .append('svg')
  .attr('width', window.innerWidth)
  .attr('height', window.innerHeight)
  .append('g')
  .attr('transform', `translate(${NETWORK_MARGIN},${NETWORK_MARGIN})`)

d3.json('./data.json').then(function(rawData) {
  const data = {
    links: rawData.links.map(([source, target]) => ({ source, target })),
    nodes: rawData.nodes
      .map(([name, year]) => ({ name, year }))
      .sort(({ year: year1 }, { year: year2 }) => year1 - year2)
  }

  // Initialize the links
  const link = networkSvg
    .selectAll('line')
    .data(data.links)
    .join('line')
    .style('stroke', '#aaa')
  
  // Initialize the nodes
  const node = networkSvg
    .selectAll('circle')
    .data(data.nodes)
    .join('circle')
    .attr('r', 10)
    .style('fill', '#69b3a2')

  const label = networkSvg.append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(data.nodes)
    .enter().append('text')
    .style('font-size', '10px')
    .style('font-family', 'monospace')
    .attr('class', 'label')
    .style('background-color', '#ffffff')
    .text((d) => d.name)
  
  // Let's list the force we wanna apply on the network
  d3.forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
    .force(
      'link', 
      d3.forceLink() // This force provides links between nodes
        .id((d) => d.name) // This provide  the id of a node
        .links(data.links) // and this the list of links
        .distance(150)
    )
    .force(
      'charge',
      d3.forceManyBody()
        .strength(-70)
    ) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2)) // This force attracts nodes to the center of the svg area
    .on('end', ticked)
  
  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
  
    node
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)

    label
      .attr('x', (d) => d.x + 16)
      .attr('y', (d) => d.y + 4)
  }
})