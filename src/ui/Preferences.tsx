import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {FlameNode, FlameKey, flameKeyDescs} from '../lib/FlameExplain';
import ReactMarkdown from 'react-markdown';
import {useKeyboardShortcuts} from './KeyboardShortcuts';
import {faWrench} from '@fortawesome/free-solid-svg-icons';

type Props = {
  visible: boolean;
  settings: PreferencesState;
  onChange: (s: PreferencesState) => void;
  onClose: () => void;
  root?: FlameNode;
};

export type PreferencesState = {
  SelectedKeys: Array<FlameKey>,
};

export default function Preferences(p: Props) {
  const rows = PreferencesColumnsRows(p);

  const clickClose = () => {
    //const newPreferences: PreferencesState = {...p.settings, ...{Visible: false}};
    //p.onChange(newPreferences);
  };

  useKeyboardShortcuts((key: string) => {
    if (key === 'Enter' || key === 'Escape') {
      clickClose();
    }
  });

  if (!p.visible) {
    return null;
  }

  return <div className="modal is-active">
    <div className="modal-background" onClick={p.onClose}></div>
    <div className="modal-card" style={{width: '90%'}}>
      <header className="modal-card-head">
        <span className="icon">
          <FontAwesomeIcon icon={faWrench} />
        </span>
        <p className="modal-card-title">Preferences</p>
        <button className="delete" aria-label="close" onClick={p.onClose}></button>
      </header>
      <section className="modal-card-body">
        <div className="tabs is-toggle">
          <ul>
            <li className={''}>
              <a href="/">General</a>
            </li>
            <li className={'is-active'}>
              <a href="/">Tree Table</a>
            </li>
          </ul>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Column</th>
              <th>Source</th>
              <th>Unit</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </section>
    </div>
  </div>
};

function PreferencesColumnsRows(p: Props) {
  let allKeys = Object.keys(flameKeyDescs)
    .map(key => key as keyof typeof flameKeyDescs);

  if (p.root) {
    flameKeys(p.root).forEach(key => {
      if (!flameKeyDescs[key]) {
        allKeys.push(key);
      }
    });
  }

  // Our SelectedKeys keys might contain unknown keys (not found in
  // flameKeyDescs) from a previous plan. It'd be weird if we simply remove
  // those keys from the table view after the user had selected them, so we
  // add them back to our list of keys that can be selected. However if the
  // user then deselects those keys, they disappear from the list. This is
  // not perfect, but okay for now.
  allKeys = allKeys.concat(p.settings.SelectedKeys.filter(
    key => !allKeys.includes(key)
  ))

  const rows = allKeys.map(currentKey => {
    const toggleCheckbox = (val: boolean) => {
      const newKeys = allKeys.filter(key => {
        return (key === currentKey)
          ? val
          : p.settings.SelectedKeys.includes(key);
      });
      const newPreferences: PreferencesState = {
        ...p.settings,
        ...{SelectedKeys: newKeys}
      };
      p.onChange(newPreferences);
    };

    const desc = flameKeyDescs[currentKey] || {
      Description: 'This field has not been documented yet.'
    };

    return <tr
      key={currentKey}
      onClick={() => {
        toggleCheckbox(!p.settings.SelectedKeys.includes(currentKey));
      }}
    >
      <td>
        <input
          type="checkbox"
          onChange={e => {
            toggleCheckbox(e.target.checked);
            e.stopPropagation();
          }}
          checked={p.settings.SelectedKeys.includes(currentKey)}
        />
      </td>
      <td style={{whiteSpace: 'nowrap'}}><code>{currentKey}</code></td>
      <td>{desc.Source}</td>
      <td>{desc.Unit}</td>
      <td><ReactMarkdown source={desc.Description} /></td>
    </tr>;
  });
  return rows;
}

function flameKeys(root: FlameNode): FlameKey[] {
  const cols: {[key in FlameKey]?: boolean} = {};
  const visit = (fn: FlameNode) => {
    let key: keyof FlameNode;
    for (key in fn) {
      const val = fn[key];
      if (['string', 'number'].includes(typeof val)) {
        cols[key] = true;
      }
    }
    fn.Children?.forEach(visit);
  };
  visit(root);
  return Object.keys(cols).sort() as FlameKey[];
}
