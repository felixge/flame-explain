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
SET enable_parallel_append=false;

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
          "Startup Cost": 21267.10,
          "Total Cost": 63881.49,
          "Plan Rows": 4000,
          "Plan Width": 20,
          "Actual Startup Time": 167.869,
          "Actual Total Time": 497.476,
          "Actual Rows": 12,
          "Actual Loops": 1,
          "Inner Unique": false,
          "Plans": [
            {
              "Node Type": "Nested Loop",
              "Parent Relationship": "Outer",
              "Parallel Aware": false,
              "Join Type": "Inner",
              "Startup Cost": 21267.10,
              "Total Cost": 63801.49,
              "Plan Rows": 4,
              "Plan Width": 16,
              "Actual Startup Time": 167.857,
              "Actual Total Time": 497.452,
              "Actual Rows": 4,
              "Actual Loops": 1,
              "Inner Unique": false,
              "Plans": [
                {
                  "Node Type": "Append",
                  "Parent Relationship": "Outer",
                  "Parallel Aware": false,
                  "Startup Cost": 10633.55,
                  "Total Cost": 21267.15,
                  "Plan Rows": 2,
                  "Plan Width": 8,
                  "Actual Startup Time": 89.911,
                  "Actual Total Time": 170.569,
                  "Actual Rows": 2,
                  "Actual Loops": 1,
                  "Plans": [
                    {
                      "Node Type": "Aggregate",
                      "Strategy": "Plain",
                      "Partial Mode": "Finalize",
                      "Parent Relationship": "Member",
                      "Parallel Aware": false,
                      "Startup Cost": 10633.55,
                      "Total Cost": 10633.56,
                      "Plan Rows": 1,
                      "Plan Width": 8,
                      "Actual Startup Time": 89.910,
                      "Actual Total Time": 89.910,
                      "Actual Rows": 1,
                      "Actual Loops": 1,
                      "Plans": [
                        {
                          "Node Type": "Gather",
                          "Parent Relationship": "Outer",
                          "Parallel Aware": false,
                          "Startup Cost": 10633.33,
                          "Total Cost": 10633.54,
                          "Plan Rows": 2,
                          "Plan Width": 8,
                          "Actual Startup Time": 89.817,
                          "Actual Total Time": 89.933,
                          "Actual Rows": 3,
                          "Actual Loops": 1,
                          "Workers Planned": 2,
                          "Workers Launched": 2,
                          "Single Copy": false,
                          "Plans": [
                            {
                              "Node Type": "Aggregate",
                              "Strategy": "Plain",
                              "Partial Mode": "Partial",
                              "Parent Relationship": "Outer",
                              "Parallel Aware": false,
                              "Startup Cost": 9633.33,
                              "Total Cost": 9633.34,
                              "Plan Rows": 1,
                              "Plan Width": 8,
                              "Actual Startup Time": 85.865,
                              "Actual Total Time": 85.865,
                              "Actual Rows": 1,
                              "Actual Loops": 3,
                              "Plans": [
                                {
                                  "Node Type": "Seq Scan",
                                  "Parent Relationship": "Outer",
                                  "Parallel Aware": true,
                                  "Relation Name": "foo",
                                  "Alias": "foo",
                                  "Startup Cost": 0.00,
                                  "Total Cost": 8591.67,
                                  "Plan Rows": 416667,
                                  "Plan Width": 0,
                                  "Actual Startup Time": 0.019,
                                  "Actual Total Time": 49.270,
                                  "Actual Rows": 333333,
                                  "Actual Loops": 3
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "Node Type": "Aggregate",
                      "Strategy": "Plain",
                      "Partial Mode": "Finalize",
                      "Parent Relationship": "Member",
                      "Parallel Aware": false,
                      "Startup Cost": 10633.55,
                      "Total Cost": 10633.56,
                      "Plan Rows": 1,
                      "Plan Width": 8,
                      "Actual Startup Time": 80.656,
                      "Actual Total Time": 80.656,
                      "Actual Rows": 1,
                      "Actual Loops": 1,
                      "Plans": [
                        {
                          "Node Type": "Gather",
                          "Parent Relationship": "Outer",
                          "Parallel Aware": false,
                          "Startup Cost": 10633.33,
                          "Total Cost": 10633.54,
                          "Plan Rows": 2,
                          "Plan Width": 8,
                          "Actual Startup Time": 80.527,
                          "Actual Total Time": 80.665,
                          "Actual Rows": 3,
                          "Actual Loops": 1,
                          "Workers Planned": 2,
                          "Workers Launched": 2,
                          "Single Copy": false,
                          "Plans": [
                            {
                              "Node Type": "Aggregate",
                              "Strategy": "Plain",
                              "Partial Mode": "Partial",
                              "Parent Relationship": "Outer",
                              "Parallel Aware": false,
                              "Startup Cost": 9633.33,
                              "Total Cost": 9633.34,
                              "Plan Rows": 1,
                              "Plan Width": 8,
                              "Actual Startup Time": 77.167,
                              "Actual Total Time": 77.168,
                              "Actual Rows": 1,
                              "Actual Loops": 3,
                              "Plans": [
                                {
                                  "Node Type": "Seq Scan",
                                  "Parent Relationship": "Outer",
                                  "Parallel Aware": true,
                                  "Relation Name": "foo",
                                  "Alias": "foo_1",
                                  "Startup Cost": 0.00,
                                  "Total Cost": 8591.67,
                                  "Plan Rows": 416667,
                                  "Plan Width": 0,
                                  "Actual Startup Time": 0.015,
                                  "Actual Total Time": 43.945,
                                  "Actual Rows": 333333,
                                  "Actual Loops": 3
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
                  "Node Type": "Append",
                  "Parent Relationship": "Inner",
                  "Parallel Aware": false,
                  "Startup Cost": 10633.55,
                  "Total Cost": 21267.15,
                  "Plan Rows": 2,
                  "Plan Width": 8,
                  "Actual Startup Time": 80.428,
                  "Actual Total Time": 163.435,
                  "Actual Rows": 2,
                  "Actual Loops": 2,
                  "Plans": [
                    {
                      "Node Type": "Aggregate",
                      "Strategy": "Plain",
                      "Partial Mode": "Finalize",
                      "Parent Relationship": "Member",
                      "Parallel Aware": false,
                      "Startup Cost": 10633.55,
                      "Total Cost": 10633.56,
                      "Plan Rows": 1,
                      "Plan Width": 8,
                      "Actual Startup Time": 80.427,
                      "Actual Total Time": 80.427,
                      "Actual Rows": 1,
                      "Actual Loops": 2,
                      "Plans": [
                        {
                          "Node Type": "Gather",
                          "Parent Relationship": "Outer",
                          "Parallel Aware": false,
                          "Startup Cost": 10633.33,
                          "Total Cost": 10633.54,
                          "Plan Rows": 2,
                          "Plan Width": 8,
                          "Actual Startup Time": 80.321,
                          "Actual Total Time": 80.429,
                          "Actual Rows": 3,
                          "Actual Loops": 2,
                          "Workers Planned": 2,
                          "Workers Launched": 2,
                          "Single Copy": false,
                          "Plans": [
                            {
                              "Node Type": "Aggregate",
                              "Strategy": "Plain",
                              "Partial Mode": "Partial",
                              "Parent Relationship": "Outer",
                              "Parallel Aware": false,
                              "Startup Cost": 9633.33,
                              "Total Cost": 9633.34,
                              "Plan Rows": 1,
                              "Plan Width": 8,
                              "Actual Startup Time": 76.779,
                              "Actual Total Time": 76.780,
                              "Actual Rows": 1,
                              "Actual Loops": 6,
                              "Plans": [
                                {
                                  "Node Type": "Seq Scan",
                                  "Parent Relationship": "Outer",
                                  "Parallel Aware": true,
                                  "Relation Name": "foo",
                                  "Alias": "foo_2",
                                  "Startup Cost": 0.00,
                                  "Total Cost": 8591.67,
                                  "Plan Rows": 416667,
                                  "Plan Width": 0,
                                  "Actual Startup Time": 0.016,
                                  "Actual Total Time": 43.692,
                                  "Actual Rows": 333333,
                                  "Actual Loops": 6
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "Node Type": "Aggregate",
                      "Strategy": "Plain",
                      "Partial Mode": "Finalize",
                      "Parent Relationship": "Member",
                      "Parallel Aware": false,
                      "Startup Cost": 10633.55,
                      "Total Cost": 10633.56,
                      "Plan Rows": 1,
                      "Plan Width": 8,
                      "Actual Startup Time": 83.006,
                      "Actual Total Time": 83.006,
                      "Actual Rows": 1,
                      "Actual Loops": 2,
                      "Plans": [
                        {
                          "Node Type": "Gather",
                          "Parent Relationship": "Outer",
                          "Parallel Aware": false,
                          "Startup Cost": 10633.33,
                          "Total Cost": 10633.54,
                          "Plan Rows": 2,
                          "Plan Width": 8,
                          "Actual Startup Time": 82.895,
                          "Actual Total Time": 84.437,
                          "Actual Rows": 3,
                          "Actual Loops": 2,
                          "Workers Planned": 2,
                          "Workers Launched": 2,
                          "Single Copy": false,
                          "Plans": [
                            {
                              "Node Type": "Aggregate",
                              "Strategy": "Plain",
                              "Partial Mode": "Partial",
                              "Parent Relationship": "Outer",
                              "Parallel Aware": false,
                              "Startup Cost": 9633.33,
                              "Total Cost": 9633.34,
                              "Plan Rows": 1,
                              "Plan Width": 8,
                              "Actual Startup Time": 79.440,
                              "Actual Total Time": 79.440,
                              "Actual Rows": 1,
                              "Actual Loops": 6,
                              "Plans": [
                                {
                                  "Node Type": "Seq Scan",
                                  "Parent Relationship": "Outer",
                                  "Parallel Aware": true,
                                  "Relation Name": "foo",
                                  "Alias": "foo_3",
                                  "Startup Cost": 0.00,
                                  "Total Cost": 8591.67,
                                  "Plan Rows": 416667,
                                  "Plan Width": 0,
                                  "Actual Startup Time": 0.015,
                                  "Actual Total Time": 45.325,
                                  "Actual Rows": 333333,
                                  "Actual Loops": 6
                                }
                              ]
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
              "Actual Total Time": 0.003,
              "Actual Rows": 3,
              "Actual Loops": 4
            }
          ]
        },
        "Planning Time": 0.265,
        "Triggers": [
        ],
        "Execution Time": 500.535
      }
    ]
};
export default Sample;