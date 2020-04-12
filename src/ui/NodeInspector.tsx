import React from 'react';
import {FlameNode, FlameKey} from '../lib/FlameExplain';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {columnText} from '../lib/TextTable';
import {assert} from '../lib/Util';

type Props = {
  visible: boolean;
  node?: FlameNode;
  onClose: () => void;
};

export default function NodeInspector(p: Props) {
  if (!p.visible || !p.node) {
    return null;
  }

  const fn = p.node;
  const columns = Object.keys(fn)
    .map(key => key as FlameKey)
    .filter(key => ['string', 'number'].includes(typeof fn[key]))
    .sort();


  const rows = columns.map(col => {
    // ts doesn't trust our earlier check to still be valid inside of this
    // closure, but we do.
    assert(fn !== undefined);

    return <tr>
      <td>{col}</td>
      <td>{columnText(fn, col)}</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>;
  });

  return <div className="modal is-active">
    <div className="modal-background"></div>
    <div className="modal-card" style={{width: '90%', maxWidth: '870px'}}>
      <header className="modal-card-head">
        <span className="icon">
          <FontAwesomeIcon icon={faInfoCircle} />
        </span>
        <p className="modal-card-title">Node Inspector</p>
        <button className="delete" aria-label="close" onClick={p.onClose}></button>
      </header>
      <section className="modal-card-body">
        <div className="content">
          <table className="table">
            <thead>
              <tr>
                <th>Column</th>
                <th>Value</th>
                <th>Source</th>
                <th>Unit</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>;
};
