import React from 'react';
import {Link} from "react-router-dom";
import examplePlans from '../lib/example_plans';

const plans: {[key: string]: string} = {};
for (let name in examplePlans) {
  plans[name] = JSON.stringify(examplePlans[name].queries, null, 2);
}

export type InputState = {
  plan: string;
  sql: string;
};

interface Props {
  errorText: string | null,
  input: InputState,
  onChange: (output: InputState) => void;
}

export default function VisualizerInput(p: Props) {
  let errorDiv: JSX.Element | null = null;
  if (p.input.plan && p.errorText !== null) {
    errorDiv = <div className="notification is-danger">{p.errorText}</div>;
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    if (p.errorText !== null) {
      e.preventDefault();
    }
  };

  let selectedPlan = '';
  let description = '';
  for (const key in plans) {
    if (p.input.plan === plans[key]) {
      selectedPlan = key;
      description = examplePlans[key].description;
      break;
    }
  }

  return (
    <div>
      {errorDiv}
      <div className="field content">
        <p>
          Prefix your SQL query with <strong className="is-family-monospace has-text-danger">EXPLAIN (ANALYZE, FORMAT JSON)</strong>
          , execute it, paste the resulting JSON below and then hit <strong><span role="img" aria-label="flame">🔥</span>&nbsp;Explain</strong>.
        </p>
        <p>Or pick a sample plan from the drop down:</p>
      </div>
      <div className="field">
        <div className="select">
          <select value={selectedPlan} onChange={e => {
            p.onChange({...p.input, ...{plan: plans[e.target.value] || ''}});
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
      {description !== '' ? <div className="content"><pre>{description.trim()}</pre></div> : null}
      <div className="field">
        <p className="control">
          <textarea onChange={e => p.onChange({...p.input, ...{plan: e.target.value}})} value={p.input.plan} className="textarea is-family-monospace" placeholder="Paste your JSON Query Plan here." rows={15}></textarea>
        </p>
      </div>
      <div className="field">
        <p className="control">
          <textarea onChange={e => p.onChange({...p.input, ...{sql: e.target.value}})} value={p.input.sql} className="textarea is-family-monospace" placeholder="(Optional) Paste the SQL for Your Plan" rows={15}></textarea>
        </p>
      </div>
      <div className="field is-pulled-right">
        <p className="control">
          <Link
            onClick={handleSubmit}
            className="button is-success"
            to="/visualize/treetable"
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
