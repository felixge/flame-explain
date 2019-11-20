import {Plan} from '../ExplainJSON'

/*
In PG < 12, the query below does two scans on the CTE foo. The first is
triggered by the EXIST predicate and implicitly limits itself to reading the
first row and pays the pg_sleep(0.1) cost. The second scan comes from the main
query, which also reads row one, but doesn't pay the sleep cost again, since the
tuple has already been stored in memory. However, the second scan has to pay the
cost of pg_sleep(0.2). pg_sleep(0.3) is never executed because the main query
has a limit of 2.

EXPLAIN (ANALYZE, FORMAT JSON)
WITH foo AS (
    SELECT 1 as i, pg_sleep(0.1)
    UNION ALL
    SELECT 2 as i, pg_sleep(0.2)
    UNION ALL
    SELECT 3 as i, pg_sleep(0.3)
)
SELECT * FROM foo WHERE EXISTS (SELECT * FROM foo) LIMIT 2

*/
const plan: Plan = [{
  "Plan": {
    "Node Type": "Limit",
    "Parallel Aware": false,
    "Startup Cost": 0.10,
    "Total Cost": 0.14,
    "Plan Rows": 2,
    "Plan Width": 8,
    "Actual Startup Time": 101.186,
    "Actual Total Time": 302.680,
    "Actual Rows": 2,
    "Actual Loops": 1,
    "Plans": [
      {
        "Node Type": "Append",
        "Parent Relationship": "InitPlan",
        "Subplan Name": "CTE foo",
        "Parallel Aware": false,
        "Startup Cost": 0.00,
        "Total Cost": 0.08,
        "Plan Rows": 3,
        "Plan Width": 8,
        "Actual Startup Time": 101.128,
        "Actual Total Time": 302.608,
        "Actual Rows": 2,
        "Actual Loops": 1,
        "Plans": [
          {
            "Node Type": "Result",
            "Parent Relationship": "Member",
            "Parallel Aware": false,
            "Startup Cost": 0.00,
            "Total Cost": 0.01,
            "Plan Rows": 1,
            "Plan Width": 8,
            "Actual Startup Time": 101.126,
            "Actual Total Time": 101.127,
            "Actual Rows": 1,
            "Actual Loops": 1
          },
          {
            "Node Type": "Result",
            "Parent Relationship": "Member",
            "Parallel Aware": false,
            "Startup Cost": 0.00,
            "Total Cost": 0.01,
            "Plan Rows": 1,
            "Plan Width": 8,
            "Actual Startup Time": 201.477,
            "Actual Total Time": 201.477,
            "Actual Rows": 1,
            "Actual Loops": 1
          },
          {
            "Node Type": "Result",
            "Parent Relationship": "Member",
            "Parallel Aware": false,
            "Startup Cost": 0.00,
            "Total Cost": 0.01,
            "Plan Rows": 1,
            "Plan Width": 8,
            "Actual Startup Time": 0.000,
            "Actual Total Time": 0.000,
            "Actual Rows": 0,
            "Actual Loops": 0
          }
        ]
      },
      {
        "Node Type": "CTE Scan",
        "Parent Relationship": "InitPlan",
        "Subplan Name": "InitPlan 2 (returns $1)",
        "Parallel Aware": false,
        "CTE Name": "foo",
        "Alias": "foo_1",
        "Startup Cost": 0.00,
        "Total Cost": 0.06,
        "Plan Rows": 3,
        "Plan Width": 0,
        "Actual Startup Time": 101.136,
        "Actual Total Time": 101.136,
        "Actual Rows": 1,
        "Actual Loops": 1
      },
      {
        "Node Type": "Result",
        "Parent Relationship": "Outer",
        "Parallel Aware": false,
        "Startup Cost": 0.00,
        "Total Cost": 0.06,
        "Plan Rows": 3,
        "Plan Width": 8,
        "Actual Startup Time": 101.184,
        "Actual Total Time": 302.675,
        "Actual Rows": 2,
        "Actual Loops": 1,
        "One-Time Filter": "$1",
        "Plans": [
          {
            "Node Type": "CTE Scan",
            "Parent Relationship": "Outer",
            "Parallel Aware": false,
            "CTE Name": "foo",
            "Alias": "foo",
            "Startup Cost": 0.00,
            "Total Cost": 0.06,
            "Plan Rows": 3,
            "Plan Width": 8,
            "Actual Startup Time": 0.004,
            "Actual Total Time": 201.492,
            "Actual Rows": 2,
            "Actual Loops": 1
          }
        ]
      }
    ]
  },
  "Planning Time": 0.307,
  "Triggers": [
  ],
  "Execution Time": 302.832
}];
export default plan;
