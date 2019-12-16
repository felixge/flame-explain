import React from 'react';
import VisualizerInput from './VisualizerInput';
import VisualizerFlamegraph from './VisualizerFlamegraph';
import VisualizerTable from './VisualizerTable';
import {transformQueries} from './lib/Transform';
import {useRouteMatch, Redirect} from "react-router-dom";
import {Link} from "react-router-dom";
import {Node as FlameNode} from './lib/FlameExplain';

interface Props {
  planText?: string,
}

export default function Visualizer(p: Props) {
  const [planText, setPlanText] = React.useState(p.planText || '');

  let rootNode: FlameNode | null = null;
  let errorText: string | null = null;
  try {
    let data = JSON.parse(planText);
    rootNode = transformQueries(data);
  } catch (e) {
    errorText = e + '';
  }

  const match = useRouteMatch<{tab: string}>('/visualize/:tab');
  if (!match) {
    return <Redirect to="/" />;
  }

  let tab: JSX.Element;
  switch (match.params.tab) {
    case 'input':
      tab = <VisualizerInput
        errorText={errorText}
        planText={planText}
        onChange={(text) => {setPlanText(text)}}
      />;
      break;
    case 'table':
      if (!rootNode) {
        return <Redirect to="/" />;
      }
      tab = <VisualizerTable root={rootNode} />;
      break;
    case 'flamegraph':
      tab = <VisualizerFlamegraph planText={planText} />
      break;
    default:
      return <Redirect to="/" />;

  }

  return <section className="section">
    <div className="container">
      <div className="tabs is-toggle">
        <ul>
          <li className={match.params.tab === 'input' ? 'is-active' : ''}>
            <Link to="/visualize/input">Input</Link>
          </li>
          <li className={match.params.tab === 'table' ? 'is-active' : ''}>
            <Link to="/visualize/table">Tree Table</Link>
          </li>
          <li className={match.params.tab === 'flamegraph' ? 'is-active' : ''}>
            <Link to="/visualize/flamegraph">Flame Graph</Link>
          </li>
        </ul>
      </div>
      {tab}
    </div>
  </section>;

};
