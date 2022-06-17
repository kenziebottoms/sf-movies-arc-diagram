/* global d3 */
/* eslint-disable max-len */

const NETWORK_DIV_ID = '#network'

// append the svg object to the body of the page
const networkSvg = d3.select(NETWORK_DIV_ID)
  .append('svg')
  .attr('viewBox', [
    -window.innerWidth / 2,
    -window.innerHeight / 2,
    window.innerWidth,
    window.innerHeight
  ])
  .append('g')


d3.json('./data.json').then(function(rawData) {
  const data = {
    links: rawData.links.map(
      ([
        source,
        target,
        refs
      ]) => ({ source, target, value: refs ? refs.length : 1 })),
    nodes: rawData.nodes
      .map(([name, year]) => ({ name, year }))
      .sort(({ year: year1 }, { year: year2 }) => year1 - year2)
  }
  
  // Let's list the force we wanna apply on the network
  const sim = d3.forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
    .force('link', d3.forceLink() // This force provides links between nodes
      .id((d) => d.name) // This provide  the id of a node
      .links(data.links) // and this the list of links
      .distance(150))
    // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force('charge', d3.forceManyBody().strength(-400))
    .force('x', d3.forceX())
    .force('y', d3.forceY())

  // Initialize the links
  const link = networkSvg
    .selectAll('line')
    .data(data.links)
    .join('line')
    .style('stroke', '#aaa')
    .style('stroke-width', (d) => d.value)
  
  // Initialize the nodes
  const node = networkSvg
    .selectAll('circle')
    .data(data.nodes)
    .join('circle')
    .attr('r', 10)
    .style('fill', '#69b3a2')
    .call(drag(sim))

  const label = networkSvg.append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(data.nodes)
    .enter().append('text')
    .style('font-size', '12px')
    .style('font-family', 'monospace')
    .attr('class', 'label')
    .style('background-color', '#ffffff')
    .text((d) => d.name)
  
  sim.on('tick', () => {
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
  })
})

function drag (simulation) {
  
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }
    
  function dragged(event) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }
    
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
    
  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
}