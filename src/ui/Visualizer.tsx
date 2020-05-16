import React from 'react';
import {default as VisualizerInput, InputState} from './VisualizerInput';
import {Link, useHistory} from "react-router-dom";
import VisualizerTable from './VisualizerTable';
import VisualizerFlamegraph from './VisualizerFlamegraph';
import {default as Inspector, InspectorCategory} from './Inspector';
import {
  default as VisualizerShare,
  SharingState,
} from './VisualizerShare';
import {PreferencesState, default as Preferences} from './Preferences';
import {FlameNode, fromRawQueries, nodeByID} from '../lib/FlameExplain';
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
  showInspector: boolean;
  inspectorCategory: InspectorCategory;
  collapsed: {[K: number]: true};
  preferences: PreferencesState;
  share: SharingState;
  selectedNode?: number;
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
    collapsed: {},
    modal: null,
    showInspector: false,
    inspectorCategory: 'All',
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

  const onClickNode = (fn: FlameNode) => {
    setState(state => ({
      ...state, ...{
        selectedNode: fn.ID,
        showInspector: true,
      }
    }));
  };

  const onToggleNode = (fn: FlameNode, recursive: boolean) => {
    setState(state => {
      if (!fn.ID) {
        return state;
      }

      const collapsed = {...state.collapsed};
      const expand = collapsed[fn.ID];

      const visit = (child: FlameNode) => {
        if (!child.ID) {
          // do nothing
        } else if (expand) {
          delete collapsed[child.ID];
        } else {
          collapsed[child.ID] = true;
        }

        if (!recursive) {
          return;
        }

        child.Children?.forEach(visit);
      };
      visit(fn);

      return {...state, ...{collapsed}};
    });
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

  // JSON Parsing + fromRawQueries can take ~10ms for large plans. This is
  // probably not the biggest perf issue right now, but useMemo lets us avoid
  // worrying about this overhead as fromRawQueries becomes more complex over
  // time.
  const {rootNode, errorText, newState} = React.useMemo(() => {
    let rootNode: FlameNode | undefined = undefined;
    let errorText: string | null = null;
    let newState;
    try {
      let data = JSON.parse(state.input.plan || '[]');
      if (typeof data === 'object' && 'flameExplain' in data) {
        // TODO(fg) there are more things we should probably accept here (e.g.
        // selected node)!
        const {input, preferences} = JSON.parse(state.input.plan);
        newState = {input, preferences};
        data = [];
      } else {
        rootNode = fromRawQueries(data);
      }
    } catch (e) {
      errorText = e + '';
    }
    return {rootNode, errorText, newState};
  }, [state.input.plan]);

  if (newState) {
    setState(state => ({...state, ...newState}));
  }

  useKeyboardShortcuts((key: string) => {
    switch (key) {
      case 'Enter':
      case 'Escape':
        setState(state => {
          if (state.modal) {
            return {...state, ...{modal: null}};
          } else if (key === 'Escape') {
            return {...state, ...{selectedNode: undefined, showInspector: false}};
          }
          return state;
        });
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
          setState(state => ({...state, ...{input: input, collapsed: {}}}));
        }}
      />;
      break;
    case 'treetable':
      if (!rootNode) {
        return <Redirect to="/" />;
      }
      tab = <div>
        <VisualizerTable
          settings={settings}
          root={rootNode}
          collapsed={state.collapsed}
          toggleNode={onToggleNode}
          clickNode={onClickNode}
          selectedNode={state.selectedNode}
        />
        <div className="content">
          <Highlight language="sql" source={state.input.sql} />
        </div>
      </div>
      break;
    case 'flamegraph':
      if (!rootNode) {
        return <Redirect to="/" />;
      }
      tab = <div>
        <VisualizerFlamegraph
          selected={nodeByID(rootNode, state.selectedNode)}
          settings={settings}
          root={rootNode}
          clickNode={onClickNode}
        />
        <div className="content">
          <Highlight language="sql" source={state.input.sql} />
        </div>
      </div>
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
    <GistNotice gist={gist} />
    <div className="tabs is-toggle">
      <ul>
        <li className={match.params.tab === 'input' ? 'is-active' : ''}>
          <Link to={"/visualize/input" + history.location.search}><u>I</u>nput</Link>
        </li>
        <li className={match.params.tab === 'flamegraph' ? 'is-active' : ''}>
          <Link to={"/visualize/flamegraph" + history.location.search}><u>F</u>lame Graph</Link>
        </li>
        <li className={match.params.tab === 'treetable' ? 'is-active' : ''}>
          <Link to={"/visualize/treetable" + history.location.search}><u>T</u>ree Table</Link>
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
    <div className="columns">
      <div className="column is-narrow">
        <Inspector
          category={state.inspectorCategory}
          onClickCategory={(category) => setState(state => ({
            ...state, ...{inspectorCategory: category}
          }))}
          onClose={() => setState(state => (
            {
              ...state, ...{
                showInspector: false,
                selectedNode: undefined,
              }
            }
          ))}
          visible={state.showInspector && match.params.tab !== 'input'}
          node={nodeByID(rootNode, state.selectedNode)}
        />
      </div>
      <div className="column">
        {tab}
      </div>
    </div>
  </section>;
};
