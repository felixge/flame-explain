import {ExamplePlan} from './';

const Sample: ExamplePlan = {
  description: `
This query is constructed to produce a looped Gather node which has an
"Actual Loops" value that also applies to all of its child nodes. The child
nodes themselves have their own "Actual Loops" value that always seems to equal
the number of workers + 1, but which seems to have no impact on calculating the
node's total time.

CREATE TABLE foo AS
SELECT g
FROM generate_series(1, 1000000) g;

SET enable_material=false;

EXPLAIN (ANALYZE, FORMAT JSON)
SELECT *
FROM generate_series(1, 3) a
JOIN LATERAL (
	SELECT count(*) FROM foo
	UNION ALL
	SELECT count(*) FROM foo
) b ON TRUE
JOIN LATERAL (
	SELECT count(*) FROM foo
	UNION ALL
	SELECT count(*) FROM foo
) c ON TRUE;
`,
  queries: [
    {
      "Plan": {
        "Node Type": "Nested Loop",
        "Parallel Aware": false,
        "Join Type": "Inner",
        "Startup Cost": 35850.00,
        "Total Cost": 53855.72,
        "Plan Rows": 4000,
        "Plan Width": 20,
        "Actual Startup Time": 421.163,
        "Actual Total Time": 675.076,
        "Actual Rows": 12,
        "Actual Loops": 1,
        "Inner Unique": false,
        "Plans": [
          {
            "Node Type": "Nested Loop",
            "Parent Relationship": "Outer",
            "Parallel Aware": false,
            "Join Type": "Inner",
            "Startup Cost": 35850.00,
            "Total Cost": 53775.71,
            "Plan Rows": 4,
            "Plan Width": 16,
            "Actual Startup Time": 421.148,
            "Actual Total Time": 675.046,
            "Actual Rows": 4,
            "Actual Loops": 1,
            "Inner Unique": false,
            "Plans": [
              {
                "Node Type": "Gather",
                "Parent Relationship": "Outer",
                "Parallel Aware": false,
                "Startup Cost": 17925.00,
                "Total Cost": 17925.22,
                "Plan Rows": 2,
                "Plan Width": 8,
                "Actual Startup Time": 210.757,
                "Actual Total Time": 210.793,
                "Actual Rows": 2,
                "Actual Loops": 1,
                "Workers Planned": 2,
                "Workers Launched": 2,
                "Single Copy": false,
                "Plans": [
                  {
                    "Node Type": "Append",
                    "Parent Relationship": "Outer",
                    "Parallel Aware": true,
                    "Startup Cost": 16925.00,
                    "Total Cost": 16925.02,
                    "Plan Rows": 1,
                    "Plan Width": 8,
                    "Actual Startup Time": 144.824,
                    "Actual Total Time": 144.825,
                    "Actual Rows": 1,
                    "Actual Loops": 3,
                    "Plans": [
                      {
                        "Node Type": "Aggregate",
                        "Strategy": "Plain",
                        "Partial Mode": "Simple",
                        "Parent Relationship": "Member",
                        "Parallel Aware": false,
                        "Startup Cost": 16925.00,
                        "Total Cost": 16925.01,
                        "Plan Rows": 1,
                        "Plan Width": 8,
                        "Actual Startup Time": 223.912,
                        "Actual Total Time": 223.912,
                        "Actual Rows": 1,
                        "Actual Loops": 1,
                        "Plans": [
                          {
                            "Node Type": "Seq Scan",
                            "Parent Relationship": "Outer",
                            "Parallel Aware": false,
                            "Relation Name": "foo",
                            "Alias": "foo",
                            "Startup Cost": 0.00,
                            "Total Cost": 14425.00,
                            "Plan Rows": 1000000,
                            "Plan Width": 0,
                            "Actual Startup Time": 0.058,
                            "Actual Total Time": 127.995,
                            "Actual Rows": 1000000,
                            "Actual Loops": 1
                          }
                        ]
                      },
                      {
                        "Node Type": "Aggregate",
                        "Strategy": "Plain",
                        "Partial Mode": "Simple",
                        "Parent Relationship": "Member",
                        "Parallel Aware": false,
                        "Startup Cost": 16925.00,
                        "Total Cost": 16925.01,
                        "Plan Rows": 1,
                        "Plan Width": 8,
                        "Actual Startup Time": 210.553,
                        "Actual Total Time": 210.553,
                        "Actual Rows": 1,
                        "Actual Loops": 1,
                        "Plans": [
                          {
                            "Node Type": "Seq Scan",
                            "Parent Relationship": "Outer",
                            "Parallel Aware": false,
                            "Relation Name": "foo",
                            "Alias": "foo_1",
                            "Startup Cost": 0.00,
                            "Total Cost": 14425.00,
                            "Plan Rows": 1000000,
                            "Plan Width": 0,
                            "Actual Startup Time": 0.016,
                            "Actual Total Time": 113.874,
                            "Actual Rows": 1000000,
                            "Actual Loops": 1
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "Node Type": "Gather",
                "Parent Relationship": "Inner",
                "Parallel Aware": false,
                "Startup Cost": 17925.00,
                "Total Cost": 17925.22,
                "Plan Rows": 2,
                "Plan Width": 8,
                "Actual Startup Time": 211.835,
                "Actual Total Time": 233.785,
                "Actual Rows": 2,
                "Actual Loops": 2,
                "Workers Planned": 2,
                "Workers Launched": 2,
                "Single Copy": false,
                "Plans": [
                  {
                    "Node Type": "Append",
                    "Parent Relationship": "Outer",
                    "Parallel Aware": true,
                    "Startup Cost": 16925.00,
                    "Total Cost": 16925.02,
                    "Plan Rows": 1,
                    "Plan Width": 8,
                    "Actual Startup Time": 145.262,
                    "Actual Total Time": 145.262,
                    "Actual Rows": 1,
                    "Actual Loops": 6,
                    "Plans": [
                      {
                        "Node Type": "Aggregate",
                        "Strategy": "Plain",
                        "Partial Mode": "Simple",
                        "Parent Relationship": "Member",
                        "Parallel Aware": false,
                        "Startup Cost": 16925.00,
                        "Total Cost": 16925.01,
                        "Plan Rows": 1,
                        "Plan Width": 8,
                        "Actual Startup Time": 225.742,
                        "Actual Total Time": 225.742,
                        "Actual Rows": 1,
                        "Actual Loops": 2,
                        "Plans": [
                          {
                            "Node Type": "Seq Scan",
                            "Parent Relationship": "Outer",
                            "Parallel Aware": false,
                            "Relation Name": "foo",
                            "Alias": "foo_2",
                            "Startup Cost": 0.00,
                            "Total Cost": 14425.00,
                            "Plan Rows": 1000000,
                            "Plan Width": 0,
                            "Actual Startup Time": 0.041,
                            "Actual Total Time": 129.075,
                            "Actual Rows": 1000000,
                            "Actual Loops": 2
                          }
                        ]
                      },
                      {
                        "Node Type": "Aggregate",
                        "Strategy": "Plain",
                        "Partial Mode": "Simple",
                        "Parent Relationship": "Member",
                        "Parallel Aware": false,
                        "Startup Cost": 16925.00,
                        "Total Cost": 16925.01,
                        "Plan Rows": 1,
                        "Plan Width": 8,
                        "Actual Startup Time": 210.038,
                        "Actual Total Time": 210.038,
                        "Actual Rows": 1,
                        "Actual Loops": 2,
                        "Plans": [
                          {
                            "Node Type": "Seq Scan",
                            "Parent Relationship": "Outer",
                            "Parallel Aware": false,
                            "Relation Name": "foo",
                            "Alias": "foo_3",
                            "Startup Cost": 0.00,
                            "Total Cost": 14425.00,
                            "Plan Rows": 1000000,
                            "Plan Width": 0,
                            "Actual Startup Time": 0.011,
                            "Actual Total Time": 113.407,
                            "Actual Rows": 1000000,
                            "Actual Loops": 2
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "Node Type": "Function Scan",
            "Parent Relationship": "Inner",
            "Parallel Aware": false,
            "Function Name": "generate_series",
            "Alias": "a",
            "Startup Cost": 0.00,
            "Total Cost": 10.00,
            "Plan Rows": 1000,
            "Plan Width": 4,
            "Actual Startup Time": 0.003,
            "Actual Total Time": 0.004,
            "Actual Rows": 3,
            "Actual Loops": 4
          }
        ]
      },
      "Planning Time": 0.227,
      "Triggers": [
      ],
      "Execution Time": 678.489
    }
  ]
};
export default Sample;
