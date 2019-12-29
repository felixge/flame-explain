import {ExamplePlan} from './';

const Sample: ExamplePlan = {
  description: `
TODO

CREATE TABLE foo AS
SELECT g
FROM generate_series(1, 1000000) g;

SET min_parallel_table_scan_size='1GB';

EXPLAIN (ANALYZE, VERBOSE, FORMAT JSON)
SELECT count(*) FROM foo
UNION ALL
SELECT count(*) FROM foo
UNION ALL
SELECT count(*) FROM foo
UNION ALL
SELECT count(*) FROM foo
UNION ALL
SELECT count(*) FROM foo;
`,
  queries: [
    {
      "Plan": {
        "Node Type": "Gather",
        "Parallel Aware": false,
        "Startup Cost": 17925.00,
        "Total Cost": 51775.56,
        "Plan Rows": 5,
        "Plan Width": 8,
        "Actual Startup Time": 206.552,
        "Actual Total Time": 430.132,
        "Actual Rows": 5,
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
            "Total Cost": 50775.06,
            "Plan Rows": 1,
            "Plan Width": 8,
            "Actual Startup Time": 215.877,
            "Actual Total Time": 349.287,
            "Actual Rows": 2,
            "Actual Loops": 3,
            "Workers": [
              {
                "Worker Number": 0,
                "Actual Startup Time": 221.251,
                "Actual Total Time": 221.252,
                "Actual Rows": 1,
                "Actual Loops": 1
              },
              {
                "Worker Number": 1,
                "Actual Startup Time": 220.080,
                "Actual Total Time": 420.464,
                "Actual Rows": 2,
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
                "Actual Startup Time": 221.248,
                "Actual Total Time": 221.248,
                "Actual Rows": 1,
                "Actual Loops": 1,
                "Output": ["count(*)"],
                "Workers": [
                  {
                    "Worker Number": 0,
                    "Actual Startup Time": 221.248,
                    "Actual Total Time": 221.248,
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
                    "Actual Startup Time": 0.056,
                    "Actual Total Time": 125.214,
                    "Actual Rows": 1000000,
                    "Actual Loops": 1,
                    "Output": ["foo.g"],
                    "Workers": [
                      {
                        "Worker Number": 0,
                        "Actual Startup Time": 0.056,
                        "Actual Total Time": 125.214,
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
                "Actual Startup Time": 220.076,
                "Actual Total Time": 220.076,
                "Actual Rows": 1,
                "Actual Loops": 1,
                "Output": ["count(*)"],
                "Workers": [
                  {
                    "Worker Number": 1,
                    "Actual Startup Time": 220.076,
                    "Actual Total Time": 220.076,
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
                    "Alias": "foo_1",
                    "Startup Cost": 0.00,
                    "Total Cost": 14425.00,
                    "Plan Rows": 1000000,
                    "Plan Width": 0,
                    "Actual Startup Time": 0.057,
                    "Actual Total Time": 125.870,
                    "Actual Rows": 1000000,
                    "Actual Loops": 1,
                    "Output": ["foo_1.g"],
                    "Workers": [
                      {
                        "Worker Number": 1,
                        "Actual Startup Time": 0.057,
                        "Actual Total Time": 125.870,
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
                "Actual Startup Time": 200.381,
                "Actual Total Time": 200.381,
                "Actual Rows": 1,
                "Actual Loops": 1,
                "Output": ["count(*)"],
                "Workers": [
                  {
                    "Worker Number": 1,
                    "Actual Startup Time": 200.381,
                    "Actual Total Time": 200.381,
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
                    "Actual Startup Time": 0.014,
                    "Actual Total Time": 107.764,
                    "Actual Rows": 1000000,
                    "Actual Loops": 1,
                    "Output": ["foo_2.g"],
                    "Workers": [
                      {
                        "Worker Number": 1,
                        "Actual Startup Time": 0.014,
                        "Actual Total Time": 107.764,
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
                "Actual Startup Time": 199.843,
                "Actual Total Time": 199.843,
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
                    "Alias": "foo_3",
                    "Startup Cost": 0.00,
                    "Total Cost": 14425.00,
                    "Plan Rows": 1000000,
                    "Plan Width": 0,
                    "Actual Startup Time": 0.015,
                    "Actual Total Time": 107.734,
                    "Actual Rows": 1000000,
                    "Actual Loops": 1,
                    "Output": ["foo_3.g"]
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
                "Actual Startup Time": 206.298,
                "Actual Total Time": 206.298,
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
                    "Alias": "foo_4",
                    "Startup Cost": 0.00,
                    "Total Cost": 14425.00,
                    "Plan Rows": 1000000,
                    "Plan Width": 0,
                    "Actual Startup Time": 0.013,
                    "Actual Total Time": 111.056,
                    "Actual Rows": 1000000,
                    "Actual Loops": 1,
                    "Output": ["foo_4.g"]
                  }
                ]
              }
            ]
          }
        ]
      },
      "Planning Time": 0.149,
      "Triggers": [
      ],
      "Execution Time": 430.247
    }
  ]
};
export default Sample;
