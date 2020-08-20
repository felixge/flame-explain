import { ExamplePlan } from "./"

const Sample: ExamplePlan = {
  sql: `
EXPLAIN (ANALYZE, FORMAT JSON)
SELECT 1 WHERE EXISTS (SELECT 2) AND EXISTS (SELECT 3);
`,
  queries: [
    {
      "Plan": {
        "Node Type": "Result",
        "Parallel Aware": false,
        "Startup Cost": 0.02,
        "Total Cost": 0.03,
        "Plan Rows": 1,
        "Plan Width": 4,
        "Actual Startup Time": 0.004,
        "Actual Total Time": 0.005,
        "Actual Rows": 1,
        "Actual Loops": 1,
        "One-Time Filter": "($0 AND $1)",
        "Plans": [
          {
            "Node Type": "Result",
            "Parent Relationship": "InitPlan",
            "Subplan Name": "InitPlan 1 (returns $0)",
            "Parallel Aware": false,
            "Startup Cost": 0.0,
            "Total Cost": 0.01,
            "Plan Rows": 1,
            "Plan Width": 0,
            "Actual Startup Time": 0.001,
            "Actual Total Time": 0.001,
            "Actual Rows": 1,
            "Actual Loops": 1,
          },
          {
            "Node Type": "Result",
            "Parent Relationship": "InitPlan",
            "Subplan Name": "InitPlan 2 (returns $1)",
            "Parallel Aware": false,
            "Startup Cost": 0.0,
            "Total Cost": 0.01,
            "Plan Rows": 1,
            "Plan Width": 0,
            "Actual Startup Time": 0.0,
            "Actual Total Time": 0.0,
            "Actual Rows": 1,
            "Actual Loops": 1,
          },
        ],
      },
      "Planning Time": 0.043,
      "Triggers": [],
      "Execution Time": 0.022,
    },
  ],
}
export default Sample
