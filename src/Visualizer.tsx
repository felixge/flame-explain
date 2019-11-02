import React from 'react';
import VisualizerInput from './VisualizerInput';
import VisualizerFlamegraph from './VisualizerFlamegraph';
import { useRouteMatch, Redirect } from "react-router-dom";

export default function Visualizer() {
    const [planText, setPlanText] = React.useState('');
    
    if (useRouteMatch('/visualize')) {
        if (!planText) {
            return <Redirect to="/" />;
        }
        return <VisualizerFlamegraph planText={planText} />;
    }
    
    return <VisualizerInput
        planText={planText}
        onChange={setPlanText}
        onSubmit={() => { }}
    />;
};
