"use client";
import * as d3 from "d3";
import { useEffect, useRef } from "react";
import nodeData from "../../public/nodedata.json";

type Node = { id: string; name: string; x?: number; y?: number; fx?: number | null; fy?: number | null };
type Edge = {
    source: string | Node;
    target: string | Node;
    similarity: number;
};

type GraphData = {
    nodes: Node[];
    edges: Edge[];
};

export default function Graph() {
    const data = nodeData;
    const ref = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        const svg = d3.select<SVGSVGElement, unknown>(ref.current);
        svg.selectAll("*").remove(); // cleanup

        const width = window.innerWidth;
        const height = window.innerHeight;

        const simulation = d3
            .forceSimulation<Node>(data.nodes)
            .force(
                "link",
                d3
                    .forceLink<Node, Edge>(data.edges)
                    .id((d) => d.id)
                    .distance((d) => 400 * (1 - d.similarity))
            )
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg
            .append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(data.edges)
            .join("line")
            .attr("stroke-width", (d) => d.similarity * 3);

        const node = svg
            .append("g")
            .selectAll<SVGGElement, Node>("g")
            .data(data.nodes)
            .join("g")
            .call(
                d3
                    .drag<SVGGElement, Node>()
                    .on("start", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    })
            );

        node
            .append("circle")
            .attr("r", 20)
            .attr("fill", "#69b3a2");

        node
            .append("text")
            .text((d) => d.name)
            .attr("x", 25)
            .attr("y", 5)
            .style("font-size", "12px");

        simulation.on("tick", () => {
            link
                .attr("x1", (d) => (d.source as Node).x!)
                .attr("y1", (d) => (d.source as Node).y!)
                .attr("x2", (d) => (d.target as Node).x!)
                .attr("y2", (d) => (d.target as Node).y!);

            node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });
    }, [data]);

    return <svg ref={ref} width={window.innerWidth} height={window.innerHeight}></svg>;
}