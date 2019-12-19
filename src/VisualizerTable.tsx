import React from 'react';
import {Node as FlameNode} from './lib/FlameExplain';
import {faExclamationTriangle as iconWarning} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {formatDuration} from './lib/Util';

interface Props {
  root: FlameNode;
  //planText: string,
  //onChange: (planText: string) => void;
  //onSubmit: () => void;
}

export default function VisualizerTable(p: Props) {
  let rows: JSX.Element[] = [];

  let maxInclusive = 0;
  if ('Total Time' in p.root) {
    maxInclusive = p.root['Total Time'];
  }

  let calcMaxSelfTime = (n: FlameNode): number => {
    let max = 0;
    if ('Self Time' in n) {
      max = n['Self Time'];
    }
    (n.Children || []).forEach(child => {
      max = Math.max(max, calcMaxSelfTime(child));
    });
    return max;
  }
  let maxSelfTime = calcMaxSelfTime(p.root);

  let visit = (node: FlameNode, depth: number = 0, lastChild: boolean[] = [true]) => {
    const indentSize = 16;
    let row: JSX.Element | null = null;

    // TODO allow filtering virtual nodes
    if (!node.Root) {
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

      const selfColor = 'Self Time' in node
        ? `rgba(255,0,0,${node['Self Time'] / maxSelfTime})`
        : '';
      const totalColor = 'Total Time' in node
        ? `rgba(255,0,0,${node['Total Time'] / maxInclusive})`
        : '';

      row = <tr key={rows.length}>
        <td className="has-text-right">{rows.length + 1}</td>
        <td style={{position: 'relative'}}>
          {treeLines()}
          <div style={{marginLeft: indent}}>{node.Label}
            &nbsp;
        {(node.Warnings || []).map((warning, i) => <FontAwesomeIcon key={i} title={warning} color="grey" icon={iconWarning} />)}
          </div></td>
        <td>{'Actual Rows' in node.Source ? node.Source['Actual Rows'] : ''}</td>
        <td>{'Actual Loops' in node.Source ? node.Source['Actual Loops'] : ''}</td>
        <td style={{backgroundColor: totalColor}} className="has-text-right">{'Total Time' in node ? formatDuration(node['Total Time']) : ''}</td>
        <td style={{backgroundColor: totalColor}} className="has-text-right">{'Total Time' in node ? formatPercent(node['Total Time'] / maxInclusive) : ''}</td>
        <td style={{backgroundColor: selfColor}} className="has-text-right">{'Self Time' in node ? formatDuration(node['Self Time']) : ''}</td>
        <td style={{backgroundColor: selfColor}} className="has-text-right">{'Self Time' in node ? formatPercent(node['Self Time'] / maxInclusive) : ''}</td>
      </tr>;
      rows.push(row);
    }

    let children = node.Children || [];
    children.forEach(
      (child, i) => visit(child, depth + (row ? 1 : 0), lastChild.concat(children.length === i + 1))
    );
  };
  visit(p.root);


  return (<div>
    <table className="table">
      <thead>
        <tr>
          <th className="has-text-centered">#</th>
          <th>Node</th>
          <th>Actual Rows</th>
          <th>Loops</th>
          <th className="has-text-centered" colSpan={2}>Total Time</th>
          <th className="has-text-centered" colSpan={2}>Self Time</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  </div>);
};

function formatPercent(f: number): string {
  return (isNaN(f))
    ? '-'
    : (f * 100).toFixed(2) + '%';
}
