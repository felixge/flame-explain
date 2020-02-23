import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {FlameNode, FlameKey, FlameKeyDesc, FlameKeyDescs} from '../lib/FlameExplain';
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
  let descs = FlameKeyDescs;
  if (p.root) {
    descs = descs.concat(flameKeys(p.root)
      .filter(key => !descs.find(desc => desc.Key === key))
      .map((key): FlameKeyDesc => ({
        Key: key,
        Description: 'This field has not been documented yet.',
      })));
  }


  const rows = descs.map(desc => {
    const toggleCheckbox = (val: boolean) => {
      const newPreferences: PreferencesState = {
        ...p.settings,
        ...{
          SelectedKeys: [desc.Key]
            .concat(p.settings.SelectedKeys)
            .filter(key => key !== desc.Key || val === true)
            .sort((a: FlameKey, b: FlameKey) => {
              const ai = descs.findIndex(desc => desc.Key === a);
              const bi = descs.findIndex(desc => desc.Key === b);
              return ai - bi;
            }),
        }
      };
      p.onChange(newPreferences);
    };

    return <tr
      key={desc.Key}
      onClick={() => {
        toggleCheckbox(!p.settings.SelectedKeys.includes(desc.Key));
      }}
    >
      <td>
        <input
          type="checkbox"
          onChange={e => {
            toggleCheckbox(e.target.checked);
            e.stopPropagation();
          }}
          checked={p.settings.SelectedKeys.includes(desc.Key)}
        />
      </td>
      <td style={{whiteSpace: 'nowrap'}}><code>{desc.Key}</code></td>
      <td>{desc.Source}</td>
      <td>{desc.Unit}</td>
      <td><ReactMarkdown source={desc.Description} /></td>
    </tr>;
  });

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
    <div className="modal-background"></div>
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
