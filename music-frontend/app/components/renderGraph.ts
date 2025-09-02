import * as d3 from "d3";
import { GraphData, Node, Edge } from "@/types/graph";

const RESPONSIVE_BREAKPOINT = 750;
const DECREASE_LINK_DISTANCE = 0.7;

const BOUNDS_PADDING = 60;
const NODE_RADIUS = 40;
const NODE_COLLISION_RADIUS = 45;
const NODE_FONT_SIZE = 9;

const COLOR_CENTER_NODE = "#E07A5F";
const COLOR_NODES = "#81B29A";
const COLOR_TEXT_MOBILE = "#000000";
const COLOR_TEXT_DESKTOP = "#ffffff";

export default function renderGraph(svgElement: SVGSVGElement, data: GraphData, width: number, height: number) {
    const forceBounds = (simulation: d3.Simulation<Node, Edge>, width: number, height: number) => {
        const cx = width / 2;
        const cy = height / 2;
        const rx = width / 2 - BOUNDS_PADDING;
        const ry = height / 2 - BOUNDS_PADDING;

        return (alpha: number) => {
            for (const d of simulation.nodes()) {
                const dx = (d.x! - cx) / rx;
                const dy = (d.y! - cy) / ry;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 1) {
                    d.x! = cx + (dx / dist) * rx;
                    d.y! = cy + (dy / dist) * ry;
                }
            }
        }
    }
    
    const svg = d3.select<SVGSVGElement, unknown>(svgElement);
    svg.selectAll("*").remove();

    const linkDistance = Math.min(width, (width < RESPONSIVE_BREAKPOINT ? height : height * DECREASE_LINK_DISTANCE));
    const chargeStrength = -Math.min(width, height);

    console.log(width);
    console.log(height);

    const centerNode = data.nodes[0];
    if (centerNode) {
        centerNode.fx = width / 2;
        centerNode.fy = height / 2;
    }

    const nodesMap = new Map(data.nodes.map(n => [n.id, n]));
    const edges: Edge[] = data.edges.map(e => ({
        source: nodesMap.get(e.from)!,
        target: nodesMap.get(e.to)!,
        similarity: e.similarity
    }));

    const simulation = d3
        .forceSimulation<Node>(data.nodes)
        .force("link", d3.forceLink<Node, Edge>(edges).id(d => d.id).distance(d => linkDistance * (1 - d.similarity)))
        .force("charge", d3.forceManyBody().strength(chargeStrength))
        .force("center", d3.forceCenter(width / 2, height / 2));

    simulation.force("bounds", forceBounds(simulation, width, height))

    simulation.force(
        "collide",
        d3.forceCollide<Node>(width < RESPONSIVE_BREAKPOINT ? 0 : NODE_COLLISION_RADIUS)
    );

    const link = svg
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0)
        .selectAll("line")
        .data(edges)
        .join("line")
        .attr("stroke-width", d => d.similarity * 3);

    const node = svg
        .append("g")
        .selectAll<SVGGElement, Node>("g")
        .data(data.nodes)
        .join("g")

    node.append("circle").attr("r", width < RESPONSIVE_BREAKPOINT ? 0 : NODE_RADIUS).attr("fill", d => (d === centerNode ? COLOR_CENTER_NODE : COLOR_NODES));

    node
        .append("text")
        .text(d => d.label)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", `${NODE_FONT_SIZE}px`)
        .style("fill", width < RESPONSIVE_BREAKPOINT ? COLOR_TEXT_MOBILE : COLOR_TEXT_DESKTOP)


    simulation.on("tick", () => {
        link
            .attr("x1", d => (d.source as Node).x!)
            .attr("y1", d => (d.source as Node).y!)
            .attr("x2", d => (d.target as Node).x!)
            .attr("y2", d => (d.target as Node).y!);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    return simulation;
}