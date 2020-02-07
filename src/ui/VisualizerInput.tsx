import React from 'react';
import {Link} from "react-router-dom";
import examplePlans from '../lib/example_plans';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
//import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/plugins/custom-class/prism-custom-class';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

// Can't import the theme from prismjs module directly because we need to hack
// it with prefixes, see below.
import './prism.css'

// https://github.com/jgthms/bulma/issues/1708#issuecomment-499677204
Prism.plugins.customClass.prefix('prism-');
// @ts-ignore https://github.com/PrismJS/prism/pull/1087
Prism.manual = true;

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
  for (const key in plans) {
    if (p.input.plan === plans[key]) {
      selectedPlan = key;
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
      <div className="field is-grouped">
        <p className="control select">
          <select value={selectedPlan} onChange={e => {
            let input: InputState = {plan: '', sql: ''};
            const plan = examplePlans[e.target.value];
            if (plan) {
              input = {
                plan: JSON.stringify(plan.queries, null, 2),
                sql: plan.sql || '',
              };
            }
            p.onChange({...p.input, ...input});
          }}>
            <option value="">Paste your own Plan</option>
            {
              Object.keys(plans).map(plan => {
                return <option value={plan} key={plan}>{plan}</option>
              })
            }
          </select>
        </p>
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
      <div className="field is-pulled-right">
      </div>
      <div className="columns">
        <div className="column">
          <Editor
            value={p.input.plan}
            onValueChange={code => p.onChange({...p.input, ...{plan: code}})}
            highlight={code => Prism.highlight(code, Prism.languages.js, 'js')}
            padding={10}
            placeholder={`Paste your JSON Plan here, e.g.:

[
  {
    "Plan": {
      "Node Type": "Function Scan",
      "Parallel Aware": false,
      "Function Name": "generate_series",
      "Alias": "generate_series",
      "Startup Cost": 0.00,
      "Total Cost": 10.00,
      "Plan Rows": 1000,
      "Plan Width": 4,
      "Actual Startup Time": 1.804,
      "Actual Total Time": 2.933,
      "Actual Rows": 10000,
      "Actual Loops": 1
    },
    "Planning Time": 0.032,
    "Triggers": [
    ],
    "Execution Time": 3.907
  }
]
`.trim()}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              minHeight: '320px',
            }}
          />
        </div>
        <div className="column">
          <Editor
            value={p.input.sql}
            onValueChange={code => p.onChange({...p.input, ...{sql: code}})}
            highlight={code => Prism.highlight(code, Prism.languages.sql, 'sql')}
            padding={10}
            preClassName="language-sql"
            placeholder={`
Paste your SQL Query here, e.g.:

EXPLAIN (ANALYZE, FORMAT JSON)
SELECT *
FROM generate_series(1, 10000);
`.trim()}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              minHeight: '276px',
            }}
          />
        </div>
      </div>
    </div>
  );
};
