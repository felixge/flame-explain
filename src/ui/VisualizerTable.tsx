import React from 'react';
import {FlameNode} from '../lib/FlameExplain';
import {columnText} from '../lib/TextTable';
import {PreferencesState} from './Preferences';
import {interpolateReds} from 'd3-scale-chromatic';
import {default as invert, RgbArray} from 'invert-color';
import {faMinusSquare, faPlusSquare, faLeaf} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

interface Props {
  root: FlameNode;
  settings: PreferencesState;
  collapsed: {[K: number]: true};
  clickNode: (fn: FlameNode) => void;
  toggleNode: (fn: FlameNode, recursive: boolean) => void;
  selectedNode?: number;
}

export default function VisualizerTable(p: Props) {
  const rows: JSX.Element[] = [];
  const columns = p.settings.SelectedKeys;

  const visit = (fn: FlameNode, depth = 0) => {
    const collapsed = typeof fn.ID === 'number' && p.collapsed[fn.ID];
    if (fn.Kind !== 'Root') {
      const colVals = columns.map(col => {
        let colVal = columnText(fn, col);
        let colEl: JSX.Element = <React.Fragment>{colVal}</React.Fragment>;
        let whiteSpace: React.CSSProperties["whiteSpace"] = 'nowrap';
        if (col === 'Label') {
          const leafNode = (fn.Children?.length || 0) <= 0;
          const icon = leafNode
            ? faLeaf
            : collapsed
              ? faPlusSquare
              : faMinusSquare;
          colEl =
            <React.Fragment>
              {'\u00a0'.repeat((depth - 1) * 4)}
              <span
                className="has-tooltip-right has-tooltip-arrow"
                data-tooltip="Shift click to expand/collapse nodes recursively."
                // prevent text-selection
                onMouseDown={e => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  p.toggleNode(fn, e.shiftKey || e.altKey)
                }}
              >
                <FontAwesomeIcon
                  icon={icon}
                />
              </span>
              &nbsp;{colVal}
            </React.Fragment>;
          whiteSpace = 'initial';
        }
        let color = '';
        let backgroundColor = '';
        const percent = fn.Colors?.[col as keyof FlameNode["Colors"]];
        if (typeof percent === 'number') {
          [color, backgroundColor] = colorPair(percent);
        }

        const textAlign = typeof fn[col] === 'number' ? 'right' : 'left';

        return <td key={col} style={{whiteSpace, textAlign, color, backgroundColor}}>{colEl}</td>;
      });
      rows.push(<tr
        onClick={() => p.clickNode(fn)}
        style={{cursor: 'pointer'}}
        key={fn.ID}
        className={fn.ID === p.selectedNode ? 'is-active' : ''}
      >{colVals}</tr>);
    }
    if (!collapsed) {
      fn.Children?.forEach(child => visit(child, depth + 1));
    }
  };
  visit(p.root);

  const headers = columns.map(col => {
    let style: React.CSSProperties = {};
    if (col === 'Label') {
      style.width = '99%';
    } else {
      style.whiteSpace = 'nowrap';
    }
    return <th key={col} style={style}>{col}</th>
  });

  return (<div className="content">
    <table className="table tree-table is-narrow">
      <thead>
        <tr>
          {headers}
        </tr>
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
