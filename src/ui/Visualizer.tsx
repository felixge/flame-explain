import React from 'react';
import {default as VisualizerInput, InputState} from './VisualizerInput';
import {Link, useHistory} from "react-router-dom";
import VisualizerTable from './VisualizerTable';
import VisualizerFlamegraph from './VisualizerFlamegraph';
import {
  default as VisualizerShare,
  SharingState,
} from './VisualizerShare';
import {PreferencesState, default as Preferences} from './Preferences';
import {FlameNode, fromRawQueries} from '../lib/FlameExplain';
import {useRouteMatch, Redirect} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faWrench as iconPreferences, faShareAlt as iconShare} from '@fortawesome/free-solid-svg-icons';
import {useLocalStorage} from './LocalStorage';
import {useGist, GistNotice} from './Gist';
import {useKeyboardShortcuts} from './KeyboardShortcuts';
import Highlight from './Highlight';


export type VisualizerState = {
  input: InputState;
  modal: 'Preferences' | 'Share' | null;
  preferences: PreferencesState;
  share: SharingState;
};

interface Props {
  planText?: string,
}

const defaultPreferences: PreferencesState = {
  SelectedKeys: [
    'ID',
    'Label',
    'Rows X',
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
    share: {tab: 'json'},
  };

  let [state, setState] = useLocalStorage('visualizer', defaultState);

  const settings = state.preferences;
  const setPreferences = (s: PreferencesState) => {
    setState(state => ({...state, ...{preferences: s}}));
  };
  const toggleModal = (modal: typeof state.modal) => {
    const m = state.modal === modal ? null : modal;
    setState(state => ({...state, ...{modal: m}}));
  };

  const q = new URLSearchParams(history.location.search);
  const gist = useGist(q.get('gist') || '');
  let [prevGist, setPrevGist] = React.useState<typeof gist>(null);
  if (gist && prevGist !== gist) {
    const plan = (gist === 'loading')
      ? '[]'
      : gist.planText || '[]';

    let newState: Partial<VisualizerState> = {
      input: {plan: plan, sql: ''},
    };
    setState(state => ({...state, ...newState}));
    setPrevGist(gist);
  }

  let rootNode: FlameNode | undefined = undefined;
  let errorText: string | null = null;
  try {
    let data = JSON.parse(state.input.plan || '[]');
    if (typeof data === 'object' && 'flameExplain' in data) {
      const {input, preferences} = JSON.parse(state.input.plan);
      setState(state => ({...state, ...{input, preferences}}));
      data = [];
    }
    rootNode = fromRawQueries(data);
  } catch (e) {
    errorText = e + '';
  }

  useKeyboardShortcuts((key: string) => {
    switch (key) {
      case 'Enter':
      case 'Escape':
        setState(state => ({...state, ...{modal: null}}));
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
          setState(state => ({...state, ...{input: input}}));
        }}
      />;
      break;
    case 'treetable':
      if (!rootNode) {
        return <Redirect to="/" />;
      }
      tab = <div>
        <div className="content">
          <Highlight language="sql" source={state.input.sql} />
        </div>
        <VisualizerTable settings={settings} root={rootNode} />
      </div>
      break;
    case 'flamegraph':
      if (!rootNode) {
        return <Redirect to="/" />;
      }
      tab = <div>
        <div className="content">
          <Highlight language="sql" source={state.input.sql} />
        </div>
        <VisualizerFlamegraph settings={settings} root={rootNode} />
      </div>
      break;
    case 'networkgraph':
      break;
    default:
      return <Redirect to="/" />;
  }

  const onPreferencesChange = (newPreferences: PreferencesState) => {
    setPreferences(newPreferences);
  };

  const onShareChange = (share: SharingState) => {
    setState(state => ({...state, ...{share}}));
  };


  return <section className="section">
    <Preferences
      onClose={() => toggleModal('Preferences')}
      onChange={onPreferencesChange}
      visible={state.modal === 'Preferences'}
      settings={settings}
      root={rootNode}
    />
    <VisualizerShare
      onClose={() => toggleModal('Share')}
      onChange={onShareChange}
      state={state}
      visible={state.modal === 'Share'}
    />
    <div className="container">
      <GistNotice gist={gist} />
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
