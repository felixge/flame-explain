import {Plan} from '../ExplainJSON'

/*
In PG < 12, the query below does two scans on the CTE foo. The first is
triggered by the EXIST predicate and implicitly limits itself to reading the
first row and pays the pg_sleep(0.1) cost. The second scan comes from the main
query, which also reads row one, but doesn't pay the sleep cost again, since the
tuple has already been stored in memory. However, the second scan has to pay the
cost of pg_sleep(0.2). pg_sleep(0.3) is never executed because the main query
has a limit of 2.

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
    "Actual Startup Time": 102.165,
    "Actual Total Time": 304.393,
    "Actual Rows": 2,
    "Actual Loops": 1,
    "Plans": [
      {
        "Node Type": "Append",
        "Parent Relationship": "InitPlan",
        "Subplan Name": "CTE foo",
        "Parallel Aware": false,
        "Actual Startup Time": 102.134,
        "Actual Total Time": 304.335,
        "Actual Rows": 2,
        "Actual Loops": 1,
        "Plans": [
          {
            "Node Type": "Result",
            "Parent Relationship": "Member",
            "Parallel Aware": false,
            "Actual Startup Time": 102.133,
            "Actual Total Time": 102.133,
            "Actual Rows": 1,
            "Actual Loops": 1
          },
          {
            "Node Type": "Result",
            "Parent Relationship": "Member",
            "Parallel Aware": false,
            "Actual Startup Time": 202.198,
            "Actual Total Time": 202.198,
            "Actual Rows": 1,
            "Actual Loops": 1
          },
          {
            "Node Type": "Result",
            "Parent Relationship": "Member",
            "Parallel Aware": false,
            "Actual Startup Time": 0.000,
            "Actual Total Time": 0.000,
            "Actual Rows": 0,
            "Actual Loops": 0
          },
          {
            "Node Type": "Result",
            "Parent Relationship": "Member",
            "Parallel Aware": false,
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
        "Actual Startup Time": 102.154,
        "Actual Total Time": 102.154,
        "Actual Rows": 1,
        "Actual Loops": 1
      },
      {
        "Node Type": "Result",
        "Parent Relationship": "Outer",
        "Parallel Aware": false,
        "Actual Startup Time": 102.163,
        "Actual Total Time": 304.388,
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
            "Actual Startup Time": 0.002,
            "Actual Total Time": 202.210,
            "Actual Rows": 2,
            "Actual Loops": 1
          }
        ]
      }
    ]
  },
  "Planning Time": 0.326,
  "Triggers": [
  ],
  "Execution Time": 304.499
}];
export default plan;
