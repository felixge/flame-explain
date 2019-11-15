import React from 'react';
import VisualizerInput from './VisualizerInput';
import VisualizerFlamegraph from './VisualizerFlamegraph';
import {useRouteMatch, Redirect} from "react-router-dom";

interface Props {
  planText?: string,
}

export default function Visualizer(p: Props) {
  const [planText, setPlanText] = React.useState(p.planText || '');

  if (useRouteMatch('/visualize')) {
    if (!planText) {
      return <Redirect to="/" />;
    }
    return <VisualizerFlamegraph planText={planText} />;
  }

  return <VisualizerInput
    planText={planText}
    onChange={setPlanText}
    onSubmit={() => {}}
  />;
};
