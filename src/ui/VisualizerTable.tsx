import React from 'react';
import {FlameNode, FlameKey} from '../lib/FlameExplain';
import {columnText} from '../lib/TextTable';
import {PreferencesState} from './Preferences';
import {interpolateReds} from 'd3-scale-chromatic';
import {default as invert, RgbArray} from 'invert-color';

interface Props {
  root: FlameNode;
  settings: PreferencesState;
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
        let color = '';
        let backgroundColor = '';
        const percent = fn[(col + ' %%' as FlameKey)];
        if (typeof percent === 'number') {
          [color, backgroundColor] = colorPair(percent);
        }

        const textAlign = typeof fn[col] === 'number' ? 'right' : 'left';

        return <td key={col} style={{textAlign, color, backgroundColor}}>{colVal}</td>;
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
    <ColorScale n={200} />
  </div>);
};

function ColorScale(p: {n: number}) {
  const children = Array(...Array(p.n)).map((_, i) =>
    <div key={i} style={{flex: '1 1', backgroundColor: colorPair(i / p.n)[1]}} />
  );
  return <div style={{display: 'flex', flexWrap: 'nowrap', height: '20px'}}>
    {children}
  </div>
}

function colorPair(n: number): [string, string] {
  const bg = interpolateReds(n);
  const bgArray = bg
    .split("(")[1]
    .split(")")[0]
    .split(/ *, */).map(s => parseInt(s, 10)) as RgbArray;
  const fg = invert(bgArray, true);
  return [fg, bg];
}
