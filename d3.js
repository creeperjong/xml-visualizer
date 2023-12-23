export function initSvg() {
  d3.select("#chart-area")
    .append("svg")
    .attr("width", "50vw")
    .attr("height", "100vh");
}

export function clearSvg() {
  d3.select("svg").selectAll("*").remove();
}

export function drawTree(tree) {
  clearSvg();

  const width = window.innerWidth / 2;
  const height = window.innerHeight;
  const svg = d3.select("svg");
  const data = {
    nodes: tree.map((node, index) => {
      return {
        id: index,
        name: node.nodeName,
        value: node.nodeValue,
        type: node.nodeType,
      };
    }),
    links: tree
      .map((node, index) => {
        return node.children.map((child) => {
          return { source: index, target: child.id, type: child.type };
        });
      })
      .flat(),
  };
  const types = ["node", "text", "attr"];
  const links = data.links.map((d) => Object.create(d));
  const nodes = data.nodes.map((d) => Object.create(d));
  const typeColor = d3.scaleOrdinal(types, d3.schemeSet1);

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force(
      "collide",
      d3.forceCollide((d) => 65)
    );

  svg
    .append("defs")
    .selectAll("marker")
    .data(types)
    .join("marker")
    .attr("id", (d) => `arrow-${d}`)
    .attr("viewBox", "0 0 7.5 7.5")
    .attr("refX", 17)
    .attr("refY", 2.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 L 5 2.5 L 0 5 z")
    .attr("fill", (d) => typeColor(d));

  const link = svg
    .append("g")
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("stroke", (d) => typeColor(d.type))
    .attr("stroke-width", 3)
    .attr("marker-end", (d) => `url(#arrow-${d.type})`);

  const node = svg
    .append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .call(drag(simulation));

  node
    .append("circle")
    .attr("stroke", (d) => {
      if (d.id === 0) {
        return "#FF00FF";
      }
      return typeColor(d.type);
    })
    .attr("stroke-width", 3)
    .attr("r", 30)
    .attr("fill", (d) => "#496F52");

  node
    .append("text")
    .attr("x", 0)
    .attr("y", "0.25rem")
    .text((d) => {
      if (d.type === "text") {
        return d.value;
      }
      if (d.type === "attr") {
        return `${d.name}=${d.value}`;
      }
      return `<${d.name}>`;
    })
    .attr("text-anchor", "middle")
    .attr("fill", "white");

  simulation.on("tick", () => {
    link.attr("d", linkArc);
    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });
}

const linkArc = (d) =>
  `M${d.source.x},${d.source.y}A0,0 0 0,1 ${d.target.x},${d.target.y}`;

const drag = (simulation) => {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};
