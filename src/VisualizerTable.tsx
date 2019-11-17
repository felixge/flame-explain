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

  let visit = (node: FlameNode, depth: number = 0, lastChild: boolean[] = [true]) => {
    const indentSize = 16;

    // Generate the |- lines for making the table look like a tree view.
    const treeLines = (): JSX.Element[] => {
      const elements: JSX.Element[] = [];
      for (let i = 0; i <= depth; i++) {
        let indent = (indentSize * i) + 'px';

        if (!lastChild[i]) {
          elements.push(<div key={rows.length + '-' + i} style={{
            borderLeft: '2px dotted #dbdbdb',
            top: '-1px',
            bottom: '0',
            position: 'absolute',
            marginLeft: indent,
          }} />);
        }
      }
      elements.push(<div key={rows.length + '-last'} style={{
        top: '-1px',
        bottom: '50%',
        position: 'absolute',
        marginLeft: depth * indentSize + 'px',
        border: '2px dotted #dbdbdb',
        borderTop: '0 none transparent',
        borderRight: '0 none transparent',
        width: indentSize / 1.5 + 'px',
      }} />);
      return elements;
    };

    let indent = (depth + 1) * indentSize + 'px';

    const selfColor = 'Exclusive Time' in node
      ? `rgba(255,0,0,${node['Exclusive Time'] / maxInclusive})`
      : '';
    const totalColor = 'Inclusive Time' in node
      ? `rgba(255,0,0,${node['Inclusive Time'] / maxInclusive})`
      : '';

    rows.push(
      <tr key={rows.length}>
        <td className="has-text-right">{rows.length + 1}</td>
        <td style={{position: 'relative'}}>{treeLines()}<div style={{marginLeft: indent}}>{node.Label}</div></td>
        <td>{'Actual Loops' in node.Source ? node.Source['Actual Loops'] : ''}</td>
        <td>{'Actual Rows' in node.Source ? node.Source['Actual Rows'] : ''}</td>
        <td style={{backgroundColor: selfColor}} className="has-text-right">{'Exclusive Time' in node ? formatDuration(node['Exclusive Time']) : ''}</td>
        <td style={{backgroundColor: selfColor}} className="has-text-right">{'Exclusive Time' in node ? formatPercent(node['Exclusive Time'] / maxInclusive) : ''}</td>
        <td style={{backgroundColor: totalColor}} className="has-text-right">{'Inclusive Time' in node ? formatDuration(node['Inclusive Time']) : ''}</td>
        <td style={{backgroundColor: totalColor}} className="has-text-right">{'Inclusive Time' in node ? formatPercent(node['Inclusive Time'] / maxInclusive) : ''}</td>
      </tr>
    );
    let children = node.Children || [];
    children.forEach(
      (child, i) => visit(child, depth + 1, lastChild.concat(children.length === i + 1))
    );
  };
  visit(p.root);


  return (<div>
    <table className="table">
      <thead>
        <tr>
          <th className="has-text-centered">#</th>
          <th>Node</th>
          <th>Rows</th>
          <th>Loops</th>
          <th className="has-text-centered" colSpan={2}>Self Time</th>
          <th className="has-text-centered" colSpan={2}>Total Time</th>
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
