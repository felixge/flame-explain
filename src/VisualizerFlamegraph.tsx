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
            .label((n) => {
                if (!n) {
                    return '';
                }
                return formatDuration(n.value);
            })
            .inverted(true)
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

function formatDuration(ms: number): string {
    const msec = 1,
           sec = 1000 * ms,
           min = 60 * sec,
           usec = msec / 1000;

    if (ms > min) {
        return (ms/min).toFixed(2) + ' m';
    } else if (ms > sec) {
        return (ms/sec).toFixed(2) + ' s';
     } else if (ms > msec) {
        return (ms/msec).toFixed(2) + ' ms';
    } else {
        return (ms / usec).toFixed(0) + ' μs';
    }
}
