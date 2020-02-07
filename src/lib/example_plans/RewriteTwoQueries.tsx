import {ExamplePlan} from './';

const Sample: ExamplePlan = {
  sql: `
/** Perhaps a bit exotic, but EXPLAIN ANALYZE may return multiple query plans when
a rewrite ALSO rule is involved as shown below.

FlameExplain seems to be the only tool that can handle plans having multiple
queries. */
CREATE TABLE foo(id int);
CREATE TABLE bar(id int);

CREATE RULE foo_insert AS ON INSERT TO foo
DO ALSO INSERT INTO bar VALUES (NEW.id);

EXPLAIN (ANALYZE, FORMAT JSON)
INSERT INTO foo SELECT * FROM generate_series(1, 100000);
`,
  queries: [
    {
      "Plan": {
        "Node Type": "ModifyTable",
        "Operation": "Insert",
        "Parallel Aware": false,
        "Relation Name": "foo",
        "Alias": "foo",
        "Startup Cost": 0.00,
        "Total Cost": 10.00,
        "Plan Rows": 1000,
        "Plan Width": 4,
        "Actual Startup Time": 128.774,
        "Actual Total Time": 128.774,
        "Actual Rows": 0,
        "Actual Loops": 1,
        "Plans": [
          {
            "Node Type": "Function Scan",
            "Parent Relationship": "Member",
            "Parallel Aware": false,
            "Function Name": "generate_series",
            "Alias": "generate_series",
            "Startup Cost": 0.00,
            "Total Cost": 10.00,
            "Plan Rows": 1000,
            "Plan Width": 4,
            "Actual Startup Time": 11.803,
            "Actual Total Time": 23.499,
            "Actual Rows": 100000,
            "Actual Loops": 1
          }
        ]
      },
      "Planning Time": 0.042,
      "Triggers": [
      ],
      "Execution Time": 130.114
    },
    {
      "Plan": {
        "Node Type": "ModifyTable",
        "Operation": "Insert",
        "Parallel Aware": false,
        "Relation Name": "bar",
        "Alias": "bar",
        "Startup Cost": 0.00,
        "Total Cost": 10.00,
        "Plan Rows": 1000,
        "Plan Width": 4,
        "Actual Startup Time": 127.366,
        "Actual Total Time": 127.366,
        "Actual Rows": 0,
        "Actual Loops": 1,
        "Plans": [
          {
            "Node Type": "Function Scan",
            "Parent Relationship": "Member",
            "Parallel Aware": false,
            "Function Name": "generate_series",
            "Alias": "generate_series",
            "Startup Cost": 0.00,
            "Total Cost": 10.00,
            "Plan Rows": 1000,
            "Plan Width": 4,
            "Actual Startup Time": 10.297,
            "Actual Total Time": 22.034,
            "Actual Rows": 100000,
            "Actual Loops": 1
          }
        ]
      },
      "Planning Time": 0.041,
      "Triggers": [
      ],
      "Execution Time": 128.802
    }
  ],
};
export default Sample;
