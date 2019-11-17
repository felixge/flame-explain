import React from 'react';
import {Node as FlameNode} from './lib/FlameJSON';

interface Props {
  root: FlameNode;
  //planText: string,
  //onChange: (planText: string) => void;
  //onSubmit: () => void;
}

export default function VisualizerTable(p: Props) {
  let rows: JSX.Element[] = [];


  let maxInclusive = 0;
  if ('Inclusive Time' in p.root) {
    maxInclusive = p.root['Inclusive Time'];
  }

  let visit = (node: FlameNode, depth: number = 0) => {
    rows.push(
      <tr key={rows.length}>
        <td className="has-text-right">{rows.length+1}</td>
        <td>{'\u00A0'.repeat(depth * 2) + node.Label}</td>
        <td className="has-text-right">{'Inclusive Time' in node ? formatDuration(node['Inclusive Time']) : ''}</td>
        <td className="has-text-right">{'Inclusive Time' in node ? formatPercent(node['Inclusive Time'] / maxInclusive) : ''}</td>
        <td className="has-text-right">{'Exclusive Time' in node ? formatDuration(node['Exclusive Time']) : ''}</td>
        <td className="has-text-right">{'Exclusive Time' in node ? formatPercent(node['Exclusive Time'] / maxInclusive) : ''}</td>
      </tr>
    );
    (node.Children || []).forEach((child) => visit(child, depth + 1));
  };
  visit(p.root);


  return (<div>
    <table className="table">
      <thead>
        <tr>
          <th className="has-text-centered">#</th>
          <th>Node</th>
          <th className="has-text-centered" colSpan={2}>Inclusive</th>
          <th className="has-text-centered" colSpan={2}>Exclusive</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  </div>);
};

function formatPercent(f: number): string {
  return (f * 100).toFixed(2) + '%';
}

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
