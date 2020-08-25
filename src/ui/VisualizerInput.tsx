import React from 'react'
import { useHistory } from 'react-router-dom'
import { HashLink as Link } from 'react-router-hash-link'
import examplePlans from '../lib/example_plans'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
//import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/plugins/custom-class/prism-custom-class'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import { useKeyboardShortcuts } from './KeyboardShortcuts'
import { faLock, faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Clipboard from 'react-clipboard.js'

// Can't import the theme from prismjs module directly because we need to hack
// it with prefixes, see below.
import './prism.css'

// https://github.com/jgthms/bulma/issues/1708#issuecomment-499677204
Prism.plugins.customClass.prefix('prism-')
// @ts-ignore https://github.com/PrismJS/prism/pull/1087
Prism.manual = true

const plans: { [key: string]: string } = {}
for (let name in examplePlans) {
  plans[name] = JSON.stringify(examplePlans[name].queries, null, 2)
}

export type InputState = {
  plan: string
  sql: string
}

interface Props {
  errorText: string | null
  input: InputState
  onChange: (output: InputState) => void
  onReset: () => void
}

export const explainPrefix = 'EXPLAIN (ANALYZE, FORMAT JSON, VERBOSE, BUFFERS)'

export default function VisualizerInput(p: Props) {
  const history = useHistory()
  let errorDiv: JSX.Element | null = null
  if (p.input.plan && p.errorText !== null) {
    errorDiv = <div className="notification is-danger">{p.errorText}</div>
  }

  let selectedPlan = ''
  for (const key in plans) {
    if (p.input.plan === plans[key] && p.input.sql === examplePlans[key].sql) {
      selectedPlan = key
      break
    }
  }

  useKeyboardShortcuts((key: string) => {
    switch (key) {
      case 'c':
        p.onChange({ sql: '', plan: '' })
        break
      case 'r':
        p.onReset()
        break
    }
  })

  return (
    <div>
      {errorDiv}
      <div className="field content">
        <p>
          Prefix your PostgreSQL query with{' '}
          <Clipboard component="a" data-clipboard-text={explainPrefix}>
            <strong className="is-family-monospace has-text-danger">
              <code>
                {explainPrefix} <FontAwesomeIcon icon={faCopy} />
              </code>
            </strong>
          </Clipboard>
          , execute it, paste the resulting JSON below.
        </p>
        <p>
          <FontAwesomeIcon icon={faLock} /> FlameExplain runs in your browser and never sends your data to another
          computer, see <Link to="/about#Security-and-Privacy">Security & Privacy</Link>.
        </p>
      </div>
      <div className="field is-grouped">
        <div className="control">
          <div className="select">
            <select
              value={selectedPlan}
              onChange={e => {
                let input: InputState = { plan: '', sql: '' }
                const plan = examplePlans[e.target.value]
                if (plan) {
                  input = {
                    plan: JSON.stringify(plan.queries, null, 2),
                    sql: plan.sql || '',
                  }
                }
                p.onChange({ ...p.input, ...input })
              }}
            >
              <option value="">Paste your own Plan</option>
              {Object.keys(plans).map(plan => {
                return (
                  <option value={plan} key={plan}>
                    {plan}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
        <div className="control buttons">
          <button
            className="button is-warning"
            disabled={!p.input.plan && !p.input.sql}
            onClick={() => {
              p.onChange({ sql: '', plan: '' })
            }}
          >
            <span>
              <u>C</u>lear Data
            </span>
          </button>

          <button className="button is-danger" onClick={p.onReset}>
            <span>
              <u>R</u>eset Settings & Data
            </span>
          </button>
        </div>
      </div>
      <div className="field is-pulled-right"></div>
      <div className="columns">
        <div className="column">
          <Editor
            value={p.input.plan}
            onPaste={e => {
              const data = e.clipboardData.getData('text')
              p.onChange({ ...p.input, ...{ plan: data } })
              history.push('/visualize/flamegraph' + history.location.search)
            }}
            onValueChange={code => p.onChange({ ...p.input, ...{ plan: code } })}
            highlight={code => Prism.highlight(code, Prism.languages.js, 'js')}
            padding={10}
            placeholder={`Paste your JSON Plan or Share JSON here, e.g.:

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
            onPaste={e => {
              // The code below detects if the user accidentally pasted his
              // JSON plan into the SQL textbox and corrects their mistake for
              // them.
              const data = e.clipboardData.getData('text')
              let isJSON = false
              try {
                JSON.parse(data)
                isJSON = true
              } catch (e) {
                // intentionally blank
              }

              if (isJSON) {
                // prevent onValueChange from firing
                p.onChange({ ...p.input, ...{ sql: '', plan: data } })
              } else {
                p.onChange({ ...p.input, ...{ sql: data } })
              }
              e.preventDefault()
              e.stopPropagation()
            }}
            onValueChange={code => p.onChange({ ...p.input, ...{ sql: code } })}
            highlight={code => Prism.highlight(code, Prism.languages.sql, 'sql')}
            padding={10}
            preClassName="language-sql"
            placeholder={`
(Optional) Paste your SQL Query here, e.g.:

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
  )
}
