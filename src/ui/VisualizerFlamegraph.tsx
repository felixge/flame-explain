import React from 'react';
import {FlameNode} from '../lib/FlameExplain';
import {PreferencesState} from './Preferences';
import {flamegraph} from 'd3-flame-graph';
import * as d3 from 'd3';
import 'd3-flame-graph/src/flamegraph.css'
import {formatDuration, formatPercent} from '../lib/Util';

interface Props {
  root: FlameNode;
  settings: PreferencesState;
  clickNode: (fn: FlameNode) => void;
}

export default function VisualizerFlamegraph(p: Props) {
  const input = flameInput(p.root);
  const flameRef = React.useRef<HTMLDivElement>(null);
  const detailRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!flameRef.current) {
      return;
    }

    const fg = flamegraph()
      .width(flameRef.current.offsetWidth)
      .label((d) => {
        if (!d) {
          return '';
        }
        const total = p.root["Total Time"];
        if (typeof total !== 'number') {
          return '';
        }
        const duration = formatDuration(d.value);
        const percent = formatPercent(d.value / total);
        const label = d.data.name;
        return `${label} ${duration} (${percent} of total)`;
      })
      //.onClick((d) => {
      //if (!detailRef.current) {
      //return;
      //}
      ////ReactDOM.render(<FlameDetail node={d.data.explainNode} />, detailRef.current);
      //})
      .inverted(true)
      .sort(true);

    d3.select(flameRef.current)
      .datum(input)
      .call(fg);

    return () => fg.destroy();
  });

  return <div>
    <div ref={flameRef} className="flamegraph" />
    <div ref={detailRef}></div>
  </div>;
};

function flameInput(n: FlameNode): FlameInput | null {
  if (n.Kind === 'Root' && n.Children?.length === 1) {
    n = n.Children[0];
  }

  if (typeof n["Total Time"] !== 'number') {
    return null;
  }

  const children: FlameInput[] = [];
  n.Children?.map(flameInput).forEach(child => {
    if (child !== null) {
      children.push(child);
    }
  });

  return {
    name: n.Label || '',
    value: n["Total Time"],
    children: children,
    node: n,
  }
};

/**
 * see https://github.com/spiermar/d3-flame-graph#input-format
 */
type FlameInput = {
  name: string,
  value: number,
  children?: FlameInput[],
  node: FlameNode,
}
