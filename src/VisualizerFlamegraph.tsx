import React from 'react';
import ReactDOM from 'react-dom';
import {transformPlan} from './lib/Transform';
import {flamegraph} from 'd3-flame-graph';
import {Node as FlameNode} from './lib/TransformedPlan';
import * as d3 from 'd3';
import 'd3-flame-graph/src/flamegraph.css'

interface Props {
  planText: string,
}

export interface FoldedJSON {
  name: string,
  value: number,
  explainNode: FlameNode,
  children?: FoldedJSON[],
}

function flameJSON(n: FlameNode): FoldedJSON {
  if (!('Total Time' in n)) {
    throw new Error('bad n');
  }
  return {
    name: n.Label,
    value: n["Total Time"],
    explainNode: n,
    children: (n.Children || []).map(flameJSON),
  }
}

export default function VisualizerFlamegraph(p: Props) {
  const flameRef = React.useRef<HTMLDivElement>(null);
  const detailRef = React.useRef<HTMLDivElement>(null);

  let fudged: FoldedJSON = {} as FoldedJSON;
  try {
    let data = JSON.parse(p.planText);
    let node = transformPlan(data);
    fudged = flameJSON(node);
  } catch (e) {
    // TODO handle
  }

  React.useEffect(() => {
    if (!flameRef.current) {
      return;
    }

    const fg = flamegraph()
      .width(flameRef.current.offsetWidth)
      .label((d) => {
        if (!d) {
          return '';
        }
        return formatDuration(d.value) + ' (' + (100 * (d.value / fudged.value)).toFixed(1) + '% of total)';
      })
      .onClick((d) => {
        if (!detailRef.current) {
          return;
        }
        ReactDOM.render(<FlameDetail node={d.data.explainNode} />, detailRef.current);
      })
      .inverted(true)
      .sort(true);

    d3.select(flameRef.current)
      .datum(fudged)
      .call(fg);
    return () => {
      fg.destroy();
    }
  })


  return <div>
    <div ref={flameRef} className="flamegraph" />
    <div ref={detailRef}></div>
  </div>;
};

function formatDuration(ms: number): string {
  const msec = 1,
    sec = 1000 * ms,
    min = 60 * sec,
    usec = msec / 1000;

  if (ms > min) {
    return (ms / min).toFixed(1) + ' m';
  } else if (ms > sec) {
    return (ms / sec).toFixed(1) + ' s';
  } else if (ms > msec) {
    return (ms / msec).toFixed(1) + ' ms';
  } else {
    return (ms / usec).toFixed(0) + ' μs';
  }
}

function FlameDetail(p: {node: FlameNode}) {
  let rows: JSX.Element[] = [];
  if (p.node.Source) {
    rows = Object.keys(p.node.Source)
      .filter((key) => {
        let val = (p.node.Source as any)[key];
        return ['string', 'number'].includes(typeof val);
      })
      .map((key) => {
        return <tr key={key}>
          <th>{key}</th>
          <td>{(p.node.Source as any)[key]}</td>
        </tr>;
      })
  }
  console.log(rows);
  return (<table><tbody>{rows}</tbody></table>);
}
