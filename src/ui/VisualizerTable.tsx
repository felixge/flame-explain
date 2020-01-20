import React from 'react';
import {FlameNode} from '../lib/FlameExplain';
import {columnText} from '../lib/TextTable';
import {SettingsState} from './Settings';

interface Props {
  root: FlameNode;
  settings: SettingsState;
}

export default function VisualizerTable(p: Props) {
  const rows: JSX.Element[] = [];
  const columns = p.settings.SelectedKeys;

  const visit = (fn: FlameNode, depth = 0) => {
    if (fn.Kind !== 'Root') {
      const colVals = columns.map(col => {
        let colVal = columnText(fn, col);
        if (col === 'Label') {
          colVal = '\u00a0'.repeat((depth - 1) * 2) + colVal;
        }
        return <td key={col}>{colVal}</td>;
      });
      rows.push(<tr key={fn.ID}>{colVals}</tr>);
    }
    fn.Children?.forEach(child => visit(child, depth + 1));
  };
  visit(p.root);

  const headers = columns.map(col => {
    return <th key={col}>{col}</th>
  });

  return (<div className="content">
    <table className="table">
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  </div>);
};
