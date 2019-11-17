import React from 'react';
import VisualizerInput from './VisualizerInput';
import VisualizerFlamegraph from './VisualizerFlamegraph';
import VisualizerTable from './VisualizerTable';
import {fromPlan} from './lib/Convert';
import {useRouteMatch, Redirect} from "react-router-dom";
import {Link} from "react-router-dom";
import {Node as FlameNode} from './lib/FlameJSON';

interface Props {
  planText?: string,
}

export default function Visualizer(p: Props) {
  const [planText, setPlanText] = React.useState(p.planText || '');

  let rootNode: FlameNode | null = null;
  let errorText: string | null = null;
  try {
    let data = JSON.parse(planText);
    rootNode = fromPlan(data);
  } catch (e) {
    errorText = e + '';
  }

  const match = useRouteMatch<{visualizer: string}>('/visualize/:visualizer');
  if (match) {
    const visualizer = match.params.visualizer;
    if (!rootNode) {
      return <Redirect to="/" />;
    }

    return <section className="section">
      <div className="container">
        <div className="tabs is-toggle">
          <ul>
            <li className={visualizer === 'table' ? 'is-active' : ''}>
              <Link to="/visualize/table">Table</Link>
            </li>
            <li className={visualizer === 'flamegraph' ? 'is-active' : ''}>
              <Link to="/visualize/flamegraph">Flame Graph</Link>
            </li>
          </ul>
        </div>
        {
          visualizer === 'table' ?
            <VisualizerTable root={rootNode} /> :
            <VisualizerFlamegraph planText={planText} />
        }
      </div>
    </section>;
  }

  return <VisualizerInput
    errorText={errorText}
    planText={planText}
    onChange={setPlanText}
  />;
};
