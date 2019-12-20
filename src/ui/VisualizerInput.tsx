import React from 'react';
import {Link} from "react-router-dom";
import fixtures from '../lib/test-fixtures';

const plans: {[key: string]: string} = {};
for (let name in fixtures) {
  // @ts-ignore
  plans[name] = JSON.stringify(fixtures[name], null, 2);
}

interface Props {
  errorText: string | null,
  planText: string,
  onChange: (planText: string) => void;
}

export default function VisualizerInput(p: Props) {
  let errorDiv: JSX.Element | null = null;
  if (p.planText && p.errorText !== null) {
    errorDiv = <div className="notification is-danger">{p.errorText}</div>;
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    if (p.errorText !== null) {
      e.preventDefault();
    }
  };

  let selectedPlan = '';
  for (const key in plans) {
    if (p.planText === plans[key]) {
      selectedPlan = key;
      break;
    }
  }

  return (
    <div>
      {errorDiv}
      <div className="field">
        <p>
          Or prefix your SQL query with <strong className="is-family-monospace has-text-danger">EXPLAIN (ANALYZE, FORMAT JSON)</strong>
          , execute it, paste the resulting JSON below and then hit <strong><span role="img" aria-label="flame">🔥</span>&nbsp;Explain</strong>.
        </p>
      </div>
      <div className="field">
        <div className="select">
          <select value={selectedPlan} onChange={e => {
            p.onChange(plans[e.target.value] || '');
          }}>
            <option value="">Paste your own Plan</option>
            {
              Object.keys(plans).map(plan => {
                return <option value={plan} key={plan}>{plan}</option>
              })
            }
          </select>
        </div>
      </div>
      <div className="field">
        <p className="control">
          <textarea onChange={e => p.onChange(e.target.value)} value={p.planText} className="textarea is-family-monospace" placeholder="Paste your JSON Query Plan here." rows={15}></textarea>
        </p>
      </div>
      <div className="field is-pulled-right">
        <p className="control">
          <Link
            onClick={handleSubmit}
            className="button is-success"
            to="/visualize/table"
            //@ts-ignore TODO: figure out why I'm getting a type error here
            disabled={p.errorText !== null}
          >
            <span role="img" aria-label="flame">🔥</span>&nbsp;Explain
      </Link>
        </p>
      </div>
    </div>
  );
};
