import React from 'react';
import {Link} from "react-router-dom";

interface Props {
    planText: string,
    onChange: (planText: string) => void;
    onSubmit: () => void;
}

export default function VisualizerInput(p: Props) {
    return (
        <section className="section">
            <div className="container">
                <div className="field">
                    <p>
                        Prefix your SQL query with <strong className="is-family-monospace has-text-danger">EXPLAIN (ANALYZE, FORMAT JSON)</strong>
                        , execute it, paste the resulting JSON below and then hit <strong><span role="img" aria-label="flame">🔥</span>&nbsp;Explain</strong>.
            </p>
                </div>
                <div className="field">
                    <p className="control">
                        <textarea onChange={e => p.onChange(e.target.value)} value={p.planText} className="textarea is-family-monospace" placeholder="Paste your JSON Query Plan here." rows={15}></textarea>
                    </p>
                </div>
                <div className="field is-pulled-right">
                    <p className="control">
                        <Link onClick={e => p.onSubmit()} className="button is-success" to="/visualize">
                            <span role="img" aria-label="flame">🔥</span>&nbsp;Explain
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
};
