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
        "Actual Startup Time": 404.636,
        "Actual Total Time": 649.306,
        "Actual Rows": 12,
        "Actual Loops": 1,
        "Output": ["a.a", "(count(*))", "(count(*))"],
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
            "Actual Startup Time": 404.615,
            "Actual Total Time": 649.267,
            "Actual Rows": 4,
            "Actual Loops": 1,
            "Output": ["(count(*))", "(count(*))"],
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
                "Actual Startup Time": 202.400,
                "Actual Total Time": 202.431,
                "Actual Rows": 2,
                "Actual Loops": 1,
                "Output": ["(count(*))"],
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
                    "Actual Startup Time": 139.203,
                    "Actual Total Time": 139.204,
                    "Actual Rows": 1,
                    "Actual Loops": 3,
                    "Workers": [
                      {
                        "Worker Number": 0,
                        "Actual Startup Time": 0.001,
                        "Actual Total Time": 0.001,
                        "Actual Rows": 0,
                        "Actual Loops": 1
                      },
                      {
                        "Worker Number": 1,
                        "Actual Startup Time": 215.364,
                        "Actual Total Time": 215.365,
                        "Actual Rows": 1,
                        "Actual Loops": 1
                      }
                    ],
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
                        "Actual Startup Time": 215.361,
                        "Actual Total Time": 215.362,
                        "Actual Rows": 1,
                        "Actual Loops": 1,
                        "Output": ["count(*)"],
                        "Workers": [
                          {
                            "Worker Number": 1,
                            "Actual Startup Time": 215.361,
                            "Actual Total Time": 215.362,
                            "Actual Rows": 1,
                            "Actual Loops": 1
                          }
                        ],
                        "Plans": [
                          {
                            "Node Type": "Seq Scan",
                            "Parent Relationship": "Outer",
                            "Parallel Aware": false,
                            "Relation Name": "foo",
                            "Schema": "public",
                            "Alias": "foo",
                            "Startup Cost": 0.00,
                            "Total Cost": 14425.00,
                            "Plan Rows": 1000000,
                            "Plan Width": 0,
                            "Actual Startup Time": 0.036,
                            "Actual Total Time": 122.230,
                            "Actual Rows": 1000000,
                            "Actual Loops": 1,
                            "Output": ["foo.g"],
                            "Workers": [
                              {
                                "Worker Number": 1,
                                "Actual Startup Time": 0.036,
                                "Actual Total Time": 122.230,
                                "Actual Rows": 1000000,
                                "Actual Loops": 1
                              }
                            ]
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
                        "Actual Startup Time": 202.244,
                        "Actual Total Time": 202.245,
                        "Actual Rows": 1,
                        "Actual Loops": 1,
                        "Output": ["count(*)"],
                        "Plans": [
                          {
                            "Node Type": "Seq Scan",
                            "Parent Relationship": "Outer",
                            "Parallel Aware": false,
                            "Relation Name": "foo",
                            "Schema": "public",
                            "Alias": "foo_1",
                            "Startup Cost": 0.00,
                            "Total Cost": 14425.00,
                            "Plan Rows": 1000000,
                            "Plan Width": 0,
                            "Actual Startup Time": 0.012,
                            "Actual Total Time": 107.778,
                            "Actual Rows": 1000000,
                            "Actual Loops": 1,
                            "Output": ["foo_1.g"]
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
                "Actual Startup Time": 205.601,
                "Actual Total Time": 224.902,
                "Actual Rows": 2,
                "Actual Loops": 2,
                "Output": ["(count(*))"],
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
                    "Actual Startup Time": 140.440,
                    "Actual Total Time": 140.441,
                    "Actual Rows": 1,
                    "Actual Loops": 6,
                    "Workers": [
                      {
                        "Worker Number": 0,
                        "Actual Startup Time": 107.874,
                        "Actual Total Time": 107.874,
                        "Actual Rows": 0,
                        "Actual Loops": 2
                      },
                      {
                        "Worker Number": 1,
                        "Actual Startup Time": 109.564,
                        "Actual Total Time": 109.565,
                        "Actual Rows": 0,
                        "Actual Loops": 2
                      }
                    ],
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
                        "Actual Startup Time": 217.429,
                        "Actual Total Time": 217.430,
                        "Actual Rows": 1,
                        "Actual Loops": 2,
                        "Output": ["count(*)"],
                        "Workers": [
                          {
                            "Worker Number": 0,
                            "Actual Startup Time": 215.736,
                            "Actual Total Time": 215.736,
                            "Actual Rows": 1,
                            "Actual Loops": 1
                          },
                          {
                            "Worker Number": 1,
                            "Actual Startup Time": 219.123,
                            "Actual Total Time": 219.123,
                            "Actual Rows": 1,
                            "Actual Loops": 1
                          }
                        ],
                        "Plans": [
                          {
                            "Node Type": "Seq Scan",
                            "Parent Relationship": "Outer",
                            "Parallel Aware": false,
                            "Relation Name": "foo",
                            "Schema": "public",
                            "Alias": "foo_2",
                            "Startup Cost": 0.00,
                            "Total Cost": 14425.00,
                            "Plan Rows": 1000000,
                            "Plan Width": 0,
                            "Actual Startup Time": 0.035,
                            "Actual Total Time": 123.626,
                            "Actual Rows": 1000000,
                            "Actual Loops": 2,
                            "Output": ["foo_2.g"],
                            "Workers": [
                              {
                                "Worker Number": 0,
                                "Actual Startup Time": 0.036,
                                "Actual Total Time": 122.066,
                                "Actual Rows": 1000000,
                                "Actual Loops": 1
                              },
                              {
                                "Worker Number": 1,
                                "Actual Startup Time": 0.034,
                                "Actual Total Time": 125.187,
                                "Actual Rows": 1000000,
                                "Actual Loops": 1
                              }
                            ]
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
                        "Actual Startup Time": 203.880,
                        "Actual Total Time": 203.881,
                        "Actual Rows": 1,
                        "Actual Loops": 2,
                        "Output": ["count(*)"],
                        "Plans": [
                          {
                            "Node Type": "Seq Scan",
                            "Parent Relationship": "Outer",
                            "Parallel Aware": false,
                            "Relation Name": "foo",
                            "Schema": "public",
                            "Alias": "foo_3",
                            "Startup Cost": 0.00,
                            "Total Cost": 14425.00,
                            "Plan Rows": 1000000,
                            "Plan Width": 0,
                            "Actual Startup Time": 0.010,
                            "Actual Total Time": 108.583,
                            "Actual Rows": 1000000,
                            "Actual Loops": 2,
                            "Output": ["foo_3.g"]
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
            "Schema": "pg_catalog",
            "Alias": "a",
            "Startup Cost": 0.00,
            "Total Cost": 10.00,
            "Plan Rows": 1000,
            "Plan Width": 4,
            "Actual Startup Time": 0.005,
            "Actual Total Time": 0.006,
            "Actual Rows": 3,
            "Actual Loops": 4,
            "Output": ["a.a"],
            "Function Call": "generate_series(1, 3)"
          }
        ]
      },
      "Planning Time": 0.201,
      "Triggers": [
      ],
      "Execution Time": 652.388
    }
  ]
};
export default Sample;
