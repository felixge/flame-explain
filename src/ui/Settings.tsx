import React from 'react';
import {FlameNode, FlameKey, FlameKeyDesc, FlameKeyDescs} from '../lib/FlameExplain';
import ReactMarkdown from 'react-markdown';

type Props = {
  settings: SettingsState;
  onChange: (s: SettingsState) => void;
};

export type SettingsState = {
  Visible: boolean,
  SelectedKeys: Array<FlameKey>,
  Root?: FlameNode,
};

export default function Settings(p: Props) {
  let descs = FlameKeyDescs;
  if (p.settings.Root) {
    descs = descs.concat(flameKeys(p.settings.Root)
      .filter(key => !descs.find(desc => desc.Key === key))
      .map((key): FlameKeyDesc => ({
        Key: key,
        Description: 'This field has not been documented yet.',
      })));
  }


  const rows = descs.map(desc => {
    const toggleCheckbox = (val: boolean) => {
      const newSettings: SettingsState = {
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
      p.onChange(newSettings);
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
    const newSettings: SettingsState = {...p.settings, ...{Visible: false}};
    p.onChange(newSettings);
  };

  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        clickClose();
      }
    };
    document.addEventListener('keyup', listener);

    return () => document.removeEventListener('keyup', listener);
  });

  if (!p.settings.Visible) {
    return null;
  }

  return <div className="modal is-active">
    <div className="modal-background"></div>
    <div className="modal-card">
      <header className="modal-card-head">
        <p className="modal-card-title">Settings</p>
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
      <footer className="modal-card-foot" style={{justifyContent: 'flex-end'}}>
        <button onClick={clickClose} className="button is-success"><u>S</u>ave changes</button>
      </footer>
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
