import React from 'react';
import VisualizerInput from './VisualizerInput';
import {Link, useHistory} from "react-router-dom";
import VisualizerTable from './VisualizerTable';
import VisualizerShare from './VisualizerShare';
import {SettingsState, default as Settings} from './Settings';
import {FlameNode, fromRawQueries} from '../lib/FlameExplain';
import {useRouteMatch, Redirect} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faWrench as iconSettings} from '@fortawesome/free-solid-svg-icons';
import {useLocalStorage} from './LocalStorage';
import {loadGist} from './Gist';


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
  const [planText, setPlanText] = useLocalStorage('planText', p.planText || '');
  const [settings, setSettings] = React.useState(defaultSettings);
  const [gistNotice, setGistNotice] = React.useState();

  const q = new URLSearchParams(history.location.search);
  loadGist(q.get('gist'))
    .then(gist => {
      if (gist) {
        setPlanText(gist.planText);
        if (gist.expires) {
          const remain = ((gist.expires - Date.now()) / 1000).toFixed(0);
          setGistNotice(<div className="notification is-warning">
            <button onClick={() => setGistNotice(undefined)} className="delete"></button>
            {`To avoid GitHub rate limiting, this gist was read from local storage cache. It can be refreshed in ${remain} second(s).`}
          </div>);
        }
      }
    })
    .catch(err => {
      setGistNotice(<div className="notification is-danger">{err + ''}</div>);
    });

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
          history.push('/visualize/input' + history.location.search);
          break
        case 't':
          history.push('/visualize/treetable' + history.location.search);
          break
        case 'f':
          history.push('/visualize/flamegraph' + history.location.search);
          break
        case 'n':
          history.push('/visualize/networkgraph' + history.location.search);
          break
        case 'h':
          history.push('/visualize/share' + history.location.search);
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
    case 'input':
      tab = <VisualizerInput
        errorText={errorText}
        planText={planText}
        onChange={(text) => {
          history.push('/visualize/input');
          setPlanText(text);
        }
        }
      />;
      break;
    case 'treetable':
      if (!rootNode) {
        return <Redirect to="/" />;
      }
      tab = <VisualizerTable settings={settings} root={rootNode} />;
      break;
    case 'share':
      if (!rootNode) {
        return <Redirect to="/" />;
      }
      tab = <VisualizerShare planText={planText} />;
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
      {gistNotice}
      <div className="tabs is-toggle">
        <ul>
          <li className={match.params.tab === 'input' ? 'is-active' : ''}>
            <Link to={"/visualize/input" + history.location.search}><u>I</u>nput</Link>
          </li>
          <li className={match.params.tab === 'treetable' ? 'is-active' : ''}>
            <Link to={"/visualize/treetable" + history.location.search}><u>T</u>ree Table</Link>
          </li>
          <li className={match.params.tab === 'flamegraph' ? 'is-active' : ''}>
            <Link to={"/visualize/flamegraph" + history.location.search}><u>F</u>lame Graph</Link>
          </li>
          <li className={match.params.tab === 'networkgraph' ? 'is-active' : ''}>
            <Link to={"/visualize/networkgraph" + history.location.search}><u>N</u>etwork Graph</Link>
          </li>
          <li className={match.params.tab === 'share' ? 'is-active' : ''}>
            <Link to={"/visualize/share" + history.location.search}>S<u>h</u>are</Link>
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
