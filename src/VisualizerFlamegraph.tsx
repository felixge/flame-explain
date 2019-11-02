import React from 'react';

interface Props {
    planText: string,
}

export default function VisualizerFlamegraph(p: Props) {
    return <section className="section">
        <div className="container">
            {p.planText}
        </div>
    </section>;
};
