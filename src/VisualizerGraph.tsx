import React from 'react';
import {Node as FNode} from './lib/FlameExplain';
import {graphlib, render} from 'dagre-d3';
import * as d3 from 'd3';
//import {formatDuration} from './lib/Util';

interface Props {
  root: FNode;
}

export default function VisualizerGraph(p: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  let g = newGraph(p.root);

  React.useEffect(() => {
    if (!ref.current) {
      return;
    }

    // @ts-ignore
    let dg = new graphlib.Graph().setGraph({rankdir: 'BT'});
    g.Nodes.forEach(node => {
      dg.setNode(node.ID.toString(), {label: node.Source.Label, rank: node.Rank});
    });
    g.Edges.forEach(edge => {
      //dg.setEdge(edge.From.toString(), edge.To.toString(), {label: 'foo'});
      const weight = 1;
      dg.setEdge(edge.From.toString(), edge.To.toString(), {label: edge.Label, weight: weight});
    });


    var svg = d3.select(ref.current.querySelector('svg')), inner = svg.select("g");
    var zoom = d3.zoom().on("zoom", function () {
      inner.attr("transform", d3.event.transform);
    });
    // @ts-ignore
    svg.call(zoom);
    var r = new render();
    // @ts-ignore
    r(inner, dg);
    var initialScale = 0.75;

    // @ts-ignore
    svg.call(zoom.transform, d3.zoomIdentity.translate((svg.attr("width") - dg.graph().width * initialScale) / 2, 20).scale(initialScale));

    // @ts-ignore
    svg.attr('height', dg.graph().height * initialScale + 40);
  });

  return <div ref={ref}><svg width={960} height={600}><g /></svg></div>;
};

function newGraph(n: FNode): Graph {
  const nodes = newNodes(n);
  const edges = newEdges(nodes);

  nodes.sort((a, b) => {
    if (a.Rank < b.Rank) {
      return -1;
    } else if (a.Rank > b.Rank) {
      return 1
    }
    return 0;
  });
  console.log(nodes);

  return {
    Nodes: nodes,
    Edges: edges,
  };
}

function newNodes(n: FNode, nodes: Node[] = [], depth = 1): Node[] {
    nodes.push({
      ID: nodes.length + 1,
      Label: n.Label,
      Source: n,
      Rank: depth,
    });
  (n.Children || []).forEach(child => newNodes(child, nodes, depth + 1));
  return nodes;
}

function newEdges(nodes: Node[]): Edge[] {
  let edges: Edge[] = [];
  nodes.forEach(node => {
    let keys: Array<'Parent' | 'FilterParent' | 'CTEParent'> = ['Parent', 'FilterParent', 'CTEParent'];
    keys.forEach(key => {
      let candidate = node.Source[key];

      let parent = nodes.find(node => node.Source === candidate);
      if (parent) {
        let label: string = key;
        if (key === 'Parent'
          && 'Parent Relationship' in node.Source.Source
          && node.Source.Source["Parent Relationship"]) {
          label = node.Source.Source["Parent Relationship"];
        }

        edges.push({
          From: node.ID,
          To: parent.ID,
          Label: label,
        });
      }
    });
  });
  return edges;
}

type Graph = {
  Nodes: Node[];
  Edges: Edge[];
}

type Node = {
  ID: number;
  Label: string;
  Source: FNode;
  Rank: number;
};

type Edge = {
  From: number;
  To: number;
  Label: string;
};
