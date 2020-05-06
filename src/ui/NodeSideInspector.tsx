import React from 'react';
import {FlameNode, FlameKey, flameKeyDescs} from '../lib/FlameExplain';
import {columnText} from '../lib/TextTable';
import {assert} from '../lib/Util';

type Props = {
  visible: boolean;
  node?: FlameNode;
  onClose: () => void;
};

export default function NodeSideInspector(p: Props) {
  console.log(p);
  if (!p.visible || !p.node) {
    return null;
  }

  const exclude = new Set<FlameKey>([
    'Colors',
    'Children',
    'Parent',
    'CTE Node',
    'CTE Scans',
    'Filter Refs',
    'Filter Nodes',
  ]);

  const fn = p.node;
  const columns = Object.keys(fn)
    .map(key => key as FlameKey)
    .filter(key => !exclude.has(key))
    .sort();


  const rows = columns.map(col => {
    // ts doesn't trust our earlier check to still be valid inside of this
    // closure, but we do.
    assert(fn !== undefined);

    const desc = flameKeyDescs[col];
    let source = '❓';
    switch (desc?.Source) {
      case 'PostgreSQL':
        source = '🐘';
        break;
      case 'FlameExplain':
        source = '🔥';
        break;
    }

    return <tr>
      <td>{source} {col}</td>
      <td>{columnText(fn, col)}</td>
    </tr>;
  });

  return <nav className="panel inspector">
    <p className="panel-heading">
      #{fn.ID} - {fn.Label}
      <button className="delete" aria-label="close" onClick={p.onClose}></button>
    </p>
    <p className="panel-block">
      <div className="content inspector">
        <table className="table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    </p>
  </nav>;
};
