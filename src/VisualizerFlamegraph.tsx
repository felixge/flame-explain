import React from 'react';

interface Props {
    planText: string,
}

export default function VisualizerFlamegraph(p: Props) {
    let parsed:{};
    try {
        parsed = JSON.parse(p.planText)
    } catch (e) {
        parsed = {}
    }

    return <section className="section">
        <div className="container">
            <p style={{whiteSpace: 'pre-wrap'}}>
            {JSON.stringify(parsed, null, 2)}
            </p>
        </div>
    </section>;
};
