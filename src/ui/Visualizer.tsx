import React from 'react';
import VisualizerInput from './VisualizerInput';
import {Link, useHistory} from "react-router-dom";
import VisualizerTable from './VisualizerTable';
import {SettingsState, default as Settings} from './Settings';
import {FlameNode, fromRawQueries} from '../lib/FlameExplain';
import {useRouteMatch, Redirect} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faWrench as iconSettings} from '@fortawesome/free-solid-svg-icons';

interface Props {
  planText?: string,
}

const defaultSettings: SettingsState = {
  Visible: false,
  SelectedKeys: [
    'ID',
    'Label',
    'Plan Rows',
    'Actual Rows',
    'Actual Total Time',
    'Total Time',
    'Self Time',
    'Self Time %',
  ],
};

export default function Visualizer(p: Props) {
  const history = useHistory();
  const [planText, setPlanText] = React.useState(p.planText || '');
  const [settings, setSettings] = React.useState(defaultSettings);

  let rootNode: FlameNode | undefined = undefined;
  let errorText: string | null = null;
  try {
    let data = JSON.parse(planText);
    rootNode = fromRawQueries(data);
  } catch (e) {
    errorText = e + '';
  }

  const toggleSettings = () => {
    setSettings({...settings, ...{Visible: !settings.Visible}});
  };


  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'i':
          history.push('/visualize/input');
          break
        case 't':
          history.push('/visualize/treetable');
          break
        case 'f':
          history.push('/visualize/flamegraph');
          break
        case 'n':
          history.push('/visualize/networkgraph');
          break
        case 's':
          toggleSettings();
          break
      }
    };
    document.addEventListener('keyup', listener);

    return () => document.removeEventListener('keyup', listener);
  });

  const match = useRouteMatch<{tab: string}>('/visualize/:tab');
  if (!match) {
    return <Redirect to="/" />;
  }

  let tab: JSX.Element = <div />;
  switch (match.params.tab) {
    case 'treetable':
      if (!rootNode) {
        return <Redirect to="/" />;
      }
      tab = <VisualizerTable settings={settings} root={rootNode} />;
      break;
    case 'input':
      tab = <VisualizerInput
        errorText={errorText}
        planText={planText}
        onChange={(text) => {setPlanText(text)}
        }
      />;
      break;
    //default:
    //return <Redirect to="/" />;
  }

  const onSettingsChange = (newSettings: SettingsState) => {
    setSettings(newSettings);
  };

  return <section className="section">
    <Settings onChange={onSettingsChange} settings={{...settings, ...{Root: rootNode}}} />
    <div className="container">
      <div className="tabs is-toggle">
        <ul>
          <li className={match.params.tab === 'input' ? 'is-active' : ''}>
            <Link to="/visualize/input"><u>I</u>nput</Link>
          </li>
          <li className={match.params.tab === 'treetable' ? 'is-active' : ''}>
            <Link to="/visualize/treetable"><u>T</u>ree Table</Link>
          </li>
          <li className={match.params.tab === 'flamegraph' ? 'is-active' : ''}>
            <Link to="/visualize/flamegraph"><u>F</u>lame Graph</Link>
          </li>
          <li className={match.params.tab === 'networkgraph' ? 'is-active' : ''}>
            <Link to="/visualize/networkgraph"><u>N</u>etwork Graph</Link>
          </li>
        </ul>
        <button onClick={toggleSettings} className="button is-rounded is-warning">
          <span className="icon is-small">
            <FontAwesomeIcon icon={iconSettings} />
          </span>
          <span><u>S</u>ettings</span>
        </button>
      </div>
      {tab}
    </div>
  </section>;
};
