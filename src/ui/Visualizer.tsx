import React from 'react';
import {default as VisualizerInput, InputState} from './VisualizerInput';
import {Link, useHistory} from "react-router-dom";
import VisualizerTable from './VisualizerTable';
import {default as VisualizerShare} from './VisualizerShare';
import {PreferencesState, default as Preferences} from './Preferences';
import {FlameNode, fromRawQueries} from '../lib/FlameExplain';
import {useRouteMatch, Redirect} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faWrench as iconPreferences, faShareAlt as iconShare} from '@fortawesome/free-solid-svg-icons';
import {useLocalStorage} from './LocalStorage';
import {Gist} from './Gist';
import {useKeyboardShortcuts} from './KeyboardShortcuts';


type VisualizerState = {
  input: InputState;
  modal: 'Preferences' | 'Share' | null;
  preferences: PreferencesState;
};

interface Props {
  planText?: string,
}

const defaultPreferences: PreferencesState = {
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

  const defaultState: VisualizerState = {
    input: {plan: p.planText || '', sql: ''},
    preferences: defaultPreferences,
    modal: null,
  };

  const [state, setState] = useLocalStorage('visualizer', defaultState);
  let planText = state.input.plan;
  const settings = state.preferences;
  const setPreferences = (s: PreferencesState) => {
    setState({...state, ...{preferences: s}});
  };
  const toggleModal = (modal: typeof state.modal) => {
    const m = state.modal === modal ? null : modal;
    setState({...state, ...{modal: m}});
  };

  const q = new URLSearchParams(history.location.search);
  const [gistPlanText, gistNotice] = Gist(q.get('gist'));
  if (gistPlanText) {
    planText = gistPlanText;
  }

  let rootNode: FlameNode | undefined = undefined;
  let errorText: string | null = null;
  try {
    let data = JSON.parse(planText);
    rootNode = fromRawQueries(data);
  } catch (e) {
    errorText = e + '';
  }


  useKeyboardShortcuts((key: string) => {
    switch (key) {
      case 'Enter':
      case 'Escape':
        setState({...state, ...{modal: null}});
        break;
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
      case 's':
        toggleModal('Share');
        break
      case ',':
      case 'p':
        toggleModal('Preferences');
        break
    }
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
        input={state.input}
        onChange={(input) => {
          history.push('/visualize/input');
          setState({...state, ...{input: input}});
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
    case 'flamegraph':
      break;
    case 'networkgraph':
      break;
    default:
      return <Redirect to="/" />;
  }

  const onPreferencesChange = (newPreferences: PreferencesState) => {
    setPreferences(newPreferences);
  };

  return <section className="section">
    <Preferences onChange={onPreferencesChange} visible={state.modal === 'Preferences'} settings={settings} root={rootNode} />
    <VisualizerShare planText={planText} visible={state.modal === 'Share'} />
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
        </ul>
        <div className="buttons has-addons">
          <button onClick={() => toggleModal('Preferences')} className="button">
            <span className="icon is-small">
              <FontAwesomeIcon icon={iconPreferences} />
            </span>
            <span><u>P</u>references</span>
          </button>
          <button onClick={() => toggleModal('Share')} className="button">
            <span className="icon is-small">
              <FontAwesomeIcon icon={iconShare} />
            </span>
            <span><u>S</u>hare</span>
          </button>
        </div>
      </div>
      {tab}
    </div>
  </section>;
};
