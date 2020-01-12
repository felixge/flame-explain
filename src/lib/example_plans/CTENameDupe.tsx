import {ExamplePlan} from './';

const Sample: ExamplePlan = {
  description: `
EXPLAIN (ANALYZE, FORMAT JSON)
WITH a AS (
	WITH a AS (
		SELECT pg_sleep(0.1)
	)
	SELECT *, pg_sleep(0.3) FROM a, a as a2
),

b AS (
	SELECT 1
)

SELECT * FROM a, b
UNION ALL
SELECT * FROM a, b;
SELECT * FROM a, b;
`,
  queries: [
  {
    "Plan": {
      "Node Type": "Append",
      "Parallel Aware": false,
      "Startup Cost": 0.07,
      "Total Cost": 0.21,
      "Plan Rows": 2,
      "Plan Width": 16,
      "Actual Startup Time": 402.216,
      "Actual Total Time": 402.226,
      "Actual Rows": 2,
      "Actual Loops": 1,
      "Plans": [
        {
          "Node Type": "Nested Loop",
          "Parent Relationship": "InitPlan",
          "Subplan Name": "CTE a",
          "Parallel Aware": false,
          "Join Type": "Inner",
          "Startup Cost": 0.01,
          "Total Cost": 0.07,
          "Plan Rows": 1,
          "Plan Width": 12,
          "Actual Startup Time": 402.182,
          "Actual Total Time": 402.184,
          "Actual Rows": 1,
          "Actual Loops": 1,
          "Inner Unique": false,
          "Plans": [
            {
              "Node Type": "Result",
              "Parent Relationship": "InitPlan",
              "Subplan Name": "CTE a",
              "Parallel Aware": false,
              "Startup Cost": 0.00,
              "Total Cost": 0.01,
              "Plan Rows": 1,
              "Plan Width": 4,
              "Actual Startup Time": 101.872,
              "Actual Total Time": 101.872,
              "Actual Rows": 1,
              "Actual Loops": 1
            },
            {
              "Node Type": "CTE Scan",
              "Parent Relationship": "Outer",
              "Parallel Aware": false,
              "CTE Name": "a",
              "Alias": "a_2",
              "Startup Cost": 0.00,
              "Total Cost": 0.02,
              "Plan Rows": 1,
              "Plan Width": 4,
              "Actual Startup Time": 101.880,
              "Actual Total Time": 101.881,
              "Actual Rows": 1,
              "Actual Loops": 1
            },
            {
              "Node Type": "CTE Scan",
              "Parent Relationship": "Inner",
              "Parallel Aware": false,
              "CTE Name": "a",
              "Alias": "a2",
              "Startup Cost": 0.00,
              "Total Cost": 0.02,
              "Plan Rows": 1,
              "Plan Width": 4,
              "Actual Startup Time": 0.002,
              "Actual Total Time": 0.003,
              "Actual Rows": 1,
              "Actual Loops": 1
            }
          ]
        },
        {
          "Node Type": "Result",
          "Parent Relationship": "InitPlan",
          "Subplan Name": "CTE b",
          "Parallel Aware": false,
          "Startup Cost": 0.00,
          "Total Cost": 0.01,
          "Plan Rows": 1,
          "Plan Width": 4,
          "Actual Startup Time": 0.002,
          "Actual Total Time": 0.002,
          "Actual Rows": 1,
          "Actual Loops": 1
        },
        {
          "Node Type": "Nested Loop",
          "Parent Relationship": "Member",
          "Parallel Aware": false,
          "Join Type": "Inner",
          "Startup Cost": 0.00,
          "Total Cost": 0.05,
          "Plan Rows": 1,
          "Plan Width": 16,
          "Actual Startup Time": 402.215,
          "Actual Total Time": 402.219,
          "Actual Rows": 1,
          "Actual Loops": 1,
          "Inner Unique": false,
          "Plans": [
            {
              "Node Type": "CTE Scan",
              "Parent Relationship": "Outer",
              "Parallel Aware": false,
              "CTE Name": "a",
              "Alias": "a",
              "Startup Cost": 0.00,
              "Total Cost": 0.02,
              "Plan Rows": 1,
              "Plan Width": 12,
              "Actual Startup Time": 402.206,
              "Actual Total Time": 402.209,
              "Actual Rows": 1,
              "Actual Loops": 1
            },
            {
              "Node Type": "CTE Scan",
              "Parent Relationship": "Inner",
              "Parallel Aware": false,
              "CTE Name": "b",
              "Alias": "b",
              "Startup Cost": 0.00,
              "Total Cost": 0.02,
              "Plan Rows": 1,
              "Plan Width": 4,
              "Actual Startup Time": 0.003,
              "Actual Total Time": 0.004,
              "Actual Rows": 1,
              "Actual Loops": 1
            }
          ]
        },
        {
          "Node Type": "Nested Loop",
          "Parent Relationship": "Member",
          "Parallel Aware": false,
          "Join Type": "Inner",
          "Startup Cost": 0.00,
          "Total Cost": 0.05,
          "Plan Rows": 1,
          "Plan Width": 16,
          "Actual Startup Time": 0.003,
          "Actual Total Time": 0.004,
          "Actual Rows": 1,
          "Actual Loops": 1,
          "Inner Unique": false,
          "Plans": [
            {
              "Node Type": "CTE Scan",
              "Parent Relationship": "Outer",
              "Parallel Aware": false,
              "CTE Name": "a",
              "Alias": "a_1",
              "Startup Cost": 0.00,
              "Total Cost": 0.02,
              "Plan Rows": 1,
              "Plan Width": 12,
              "Actual Startup Time": 0.001,
              "Actual Total Time": 0.001,
              "Actual Rows": 1,
              "Actual Loops": 1
            },
            {
              "Node Type": "CTE Scan",
              "Parent Relationship": "Inner",
              "Parallel Aware": false,
              "CTE Name": "b",
              "Alias": "b_1",
              "Startup Cost": 0.00,
              "Total Cost": 0.02,
              "Plan Rows": 1,
              "Plan Width": 4,
              "Actual Startup Time": 0.000,
              "Actual Total Time": 0.001,
              "Actual Rows": 1,
              "Actual Loops": 1
            }
          ]
        }
      ]
    },
    "Planning Time": 0.185,
    "Triggers": [
    ],
    "Execution Time": 402.288
  }
]
};
export default Sample;
