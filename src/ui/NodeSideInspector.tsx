import React from 'react';
import {FlameNode, FlameKey, flameKeyMeta} from '../lib/FlameExplain';
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

    const meta = flameKeyMeta[col];
    const source = (meta?.Source === 'FlameExplain')
      ? '🔥'
      : '🐘';

    return <tr>
      <td>{source} {col}</td>
      <td>{columnText(fn, col)}</td>
    </tr>;
  });
  //<p className="panel-tabs">
  //<a className="is-active">All</a>
  //<a>Timing</a>
  //<a>Rows</a>
  //<a>I/O</a>
  //<a>Misc</a>
  //</p>

  return <nav className="panel inspector">
    <p className="panel-heading">
      #{fn.ID} - {fn.Label}
      <button className="delete" aria-label="close" onClick={p.onClose}></button>
    </p>
    <p className="panel-block">
      <div>
        <table className="table is-narrow">
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    </p>
  </nav>;
};
