import { ExamplePlan } from "./"

const Sample: ExamplePlan = {
  sql: `
/** A trivial nested loop plan. FlameExplain correctly accounts for the
"Actual Total Time" in the looped node to be the average time per loop. It
also highlights the high cost of query planning relative to the execution of
this plan. */
EXPLAIN (ANALYZE, FORMAT JSON)
SELECT *
FROM generate_series(1, 10) a
JOIN generate_series(5, 15) b ON a > b;
`,
  queries: [
    {
      "Plan": {
        "Node Type": "Nested Loop",
        "Parallel Aware": false,
        "Join Type": "Inner",
        "Startup Cost": 0.01,
        "Total Cost": 2.58,
        "Plan Rows": 37,
        "Plan Width": 8,
        "Actual Startup Time": 0.037,
        "Actual Total Time": 0.059,
        "Actual Rows": 15,
        "Actual Loops": 1,
        "Inner Unique": false,
        "Join Filter": "(a.a > b.b)",
        "Rows Removed by Join Filter": 95,
        "Plans": [
          {
            "Node Type": "Function Scan",
            "Parent Relationship": "Outer",
            "Parallel Aware": false,
            "Function Name": "generate_series",
            "Alias": "a",
            "Startup Cost": 0.0,
            "Total Cost": 0.1,
            "Plan Rows": 10,
            "Plan Width": 4,
            "Actual Startup Time": 0.008,
            "Actual Total Time": 0.009,
            "Actual Rows": 10,
            "Actual Loops": 1,
          },
          {
            "Node Type": "Function Scan",
            "Parent Relationship": "Inner",
            "Parallel Aware": false,
            "Function Name": "generate_series",
            "Alias": "b",
            "Startup Cost": 0.0,
            "Total Cost": 0.11,
            "Plan Rows": 11,
            "Plan Width": 4,
            "Actual Startup Time": 0.001,
            "Actual Total Time": 0.002,
            "Actual Rows": 11,
            "Actual Loops": 10,
          },
        ],
      },
      "Planning Time": 0.067,
      "Triggers": [],
      "Execution Time": 0.087,
    },
  ],
}
export default Sample
