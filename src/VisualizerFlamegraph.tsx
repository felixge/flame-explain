import React from 'react';
import {fromPlan} from './lib/Convert';
import {flamegraph} from 'd3-flame-graph';
import {Node as FlameNode} from './lib/FlameJSON';
import * as d3 from 'd3';
import 'd3-flame-graph/src/flamegraph.css'

interface Props {
    planText: string,
}

export interface FoldedJSON {
    name: string,
    value: number,
    children?: FoldedJSON[],
}

function flameJSON(n: FlameNode): FoldedJSON  {
    if (!('Inclusive Time' in n)) {
        throw new Error('bad n');
    }
    return {
        name: n.Label,
        value: n["Inclusive Time"],
        children: (n.Children || []).map(flameJSON),
    }
}

export default function VisualizerFlamegraph(p: Props) {
    const flameRef = React.useRef<HTMLDivElement>(null);

    let fudged: FoldedJSON = {} as FoldedJSON;
    try {
        let data = JSON.parse(p.planText);
        let node = fromPlan(data);
        fudged = flameJSON(node);
    } catch (e) {
        // TODO handle
    }

    React.useEffect(() => {
        if (!flameRef.current) {
            return;
        }

        const fg = flamegraph()
            .width(flameRef.current.offsetWidth)
            .sort(true);

        d3.select(flameRef.current)
            .datum(fudged)
            .call(fg);
        return () => {
            fg.destroy();
        }
    })


    return <section className="section">
        <div className="container">
            <div ref={flameRef} className="flamegraph" />
        </div>
    </section>;
};
