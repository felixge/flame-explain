import {
  fromRawQueries,
  label,
  FlameNode,
  parseSubplanName,
  parseFilter,
} from './FlameExplain';
import NestedLoop from './example_plans/NestedLoop';
import RewriteTwoQueries from './example_plans/RewriteTwoQueries';
import OneInitFilter from './example_plans/OneInitFilter';
import OneInitOneTimeFilter from './example_plans/OneInitOneTimeFilter';
import examples from './example_plans';

describe('label', () => {
  test('Result', () => {
    expect(label({"Node Type": 'Result'})).toEqual('Result');
  });

  test('ModifyTable', () => {
    expect(label({
      "Node Type": 'ModifyTable',
      "Operation": "Insert",
    })).toEqual('Insert');
    expect(label({
      "Node Type": 'ModifyTable',
      "Operation": "Update",
    })).toEqual('Update');
    expect(label({
      "Node Type": 'ModifyTable',
      "Operation": "Delete",
    })).toEqual('Delete');

    expect(label({
      "Node Type": 'ModifyTable',
      "Operation": "Insert",
      'Relation Name': 'foo',
    })).toEqual('Insert on foo');
    expect(label({
      "Node Type": 'ModifyTable',
      "Operation": "Insert",
      'Relation Name': 'foo',
      'Alias': 'bar',
    })).toEqual('Insert on foo bar');
    expect(label({
      "Node Type": 'ModifyTable',
      "Operation": "Insert",
      'Relation Name': 'foo',
      'Alias': 'bar',
      'Schema': 'baz',
    })).toEqual('Insert on baz.foo bar');
  });

  test('Foreign Scan', () => {
    expect(label({
      "Node Type": 'Foreign Scan',
      "Operation": "Select",
    })).toEqual('Foreign Scan');
    expect(label({
      "Node Type": 'Foreign Scan',
      "Operation": "Insert",
    })).toEqual('Foreign Insert');
    expect(label({
      "Node Type": 'Foreign Scan',
      "Operation": "Update",
    })).toEqual('Foreign Update');
    expect(label({
      "Node Type": 'Foreign Scan',
      "Operation": "Delete",
    })).toEqual('Foreign Delete');
  });

  test('Join Type', () => {
    expect(label({
      "Node Type": 'Hash Join',
      "Join Type": "Left",
    })).toEqual('Hash Left Join');
    expect(label({
      "Node Type": 'Merge Join',
      "Join Type": "Left",
    })).toEqual('Merge Left Join');
    expect(label({
      "Node Type": 'Hash Join',
      "Join Type": "Inner",
    })).toEqual('Hash Join');
    expect(label({
      "Node Type": 'Nested Loop',
      "Join Type": "Inner",
    })).toEqual('Nested Loop');
    expect(label({
      "Node Type": 'Nested Loop',
      "Join Type": "Left",
    })).toEqual('Nested Loop Left Join');
  });

  test('Aggregate', () => {
    expect(label({
      "Node Type": 'Aggregate',
      "Strategy": "Plain",
    })).toEqual('Aggregate');
    expect(label({
      "Node Type": 'Aggregate',
      "Strategy": "Sorted",
    })).toEqual('GroupAggregate');
    expect(label({
      "Node Type": 'Aggregate',
      "Strategy": "Hashed",
    })).toEqual('HashAggregate');
    expect(label({
      "Node Type": 'Aggregate',
      "Strategy": "Mixed",
    })).toEqual('MixedAggregate');
    expect(label({
      "Node Type": 'Aggregate',
      "Strategy": "???",
    })).toEqual('Aggregate ???');

    expect(label({
      "Node Type": 'Aggregate',
      "Strategy": "Sorted",
      "Partial Mode": "Simple",
    })).toEqual('GroupAggregate');
    expect(label({
      "Node Type": 'Aggregate',
      "Strategy": "Sorted",
      "Partial Mode": "Partial",
    })).toEqual('Partial GroupAggregate');
    expect(label({
      "Node Type": 'Aggregate',
      "Strategy": "Sorted",
      "Partial Mode": "Finalize",
    })).toEqual('Finalize GroupAggregate');
  });

  test('SetOp', () => {
    expect(label({
      "Node Type": 'SetOp',
      "Strategy": "Sorted",
      "Command": "Intersect",
    })).toEqual('SetOp Intersect');
    expect(label({
      "Node Type": 'SetOp',
      "Strategy": "Hashed",
      "Command": "Intersect All",
    })).toEqual('HashedSetOp Intersect All');
    expect(label({
      "Node Type": 'SetOp',
      "Strategy": "???",
      "Command": "Except",
    })).toEqual('SetOp ??? Except');
  });

  test('Parallel Aware', () => {
    expect(label({
      "Node Type": 'Seq Scan',
      "Parallel Aware": true,
    })).toEqual('Parallel Seq Scan');
  });

  test('PlanNodeTargetRel', () => {
    expect(label({
      "Node Type": 'Seq Scan',
      "Relation Name": 'foo',
    })).toEqual('Seq Scan on foo');
    expect(label({
      "Node Type": 'Seq Scan',
      "Relation Name": 'foo',
      "Schema": 'myschema',
    })).toEqual('Seq Scan on myschema.foo');
    expect(label({
      "Node Type": 'Seq Scan',
      "Relation Name": 'foo',
      "Alias": 'bar',
      "Schema": 'myschema',
    })).toEqual('Seq Scan on myschema.foo bar');

    expect(label({
      "Node Type": 'Function Scan',
      "Function Name": 'foo',
      "Schema": 'myschema',
      "Alias": 'bar',
    })).toEqual('Function Scan on myschema.foo bar');

    expect(label({
      "Node Type": 'Table Function Scan',
      "Table Function Name": 'xmltable',
      "Schema": 'myschema',
      "Alias": 'bar',
    })).toEqual('Table Function Scan on myschema.xmltable bar');

    expect(label({
      "Node Type": 'CTE Scan',
      "CTE Name": 'foo',
      "Schema": 'myschema',
      "Alias": 'bar',
    })).toEqual('CTE Scan on myschema.foo bar');
    expect(label({
      "Node Type": 'WorkTable Scan',
      "CTE Name": 'foo',
      "Schema": 'myschema',
      "Alias": 'bar',
    })).toEqual('WorkTable Scan on myschema.foo bar');

    expect(label({
      "Node Type": 'Named Tuplestore Scan',
      "Tuplestore Name": 'foo',
      "Schema": 'myschema',
      "Alias": 'bar',
    })).toEqual('Named Tuplestore Scan on myschema.foo bar');

    expect(label({
      "Node Type": 'Bitmap Index Scan',
      "Index Name": 'my_idx',
    })).toEqual('Bitmap Index Scan on my_idx');

    expect(label({
      "Node Type": 'Index Scan',
      "Index Name": 'my_idx',
      "Scan Direction": 'Forward',
      "Rows Removed by Index Recheck": 0,
      "Relation Name": 'foo',
      "Alias": 'bar',
      "Schema": 'myschema',
    })).toEqual('Index Scan using my_idx on myschema.foo bar');
    expect(label({
      "Node Type": 'Index Scan',
      "Index Name": 'my_idx',
      "Scan Direction": 'Backward',
      "Rows Removed by Index Recheck": 0,
      "Relation Name": 'foo',
      "Alias": 'bar',
      "Schema": 'myschema',
    })).toEqual('Index Scan Backward using my_idx on myschema.foo bar');
  });
});

describe('fromRawQueries', () => {
  describe('opt = {}', () => {
    test('NestedLoop', () => {
      const {queries} = NestedLoop;
      const root = fromRawQueries(queries, {});
      expect(Object.keys(root).sort()).toEqual(['Children', 'Kind']);

      expect(root.Children?.length).toEqual(1);
      const child = (root.Children || [])[0];
      expect(child.Kind).toEqual("Node");
      expect(child.Label).toEqual('Nested Loop');
      expect(Object.keys(child).sort())
        .toEqual(Object
          .keys(queries[0].Plan || {})
          .filter(key => key !== 'Plans')
          .concat(['Children', 'Parent', 'Kind', 'Label', 'ID'])
          .sort());
      expect(child).not.toBe(queries[0].Plan);

      expect(child.Children?.length).toEqual(2);
      const childInner = (child.Children || [])[0];
      expect(childInner.Kind).toEqual("Node");
      expect(childInner.Label).toEqual('Function Scan on generate_series a');
      expect(childInner.Alias).toEqual('a');
      expect(childInner).not.toBe(queries[0].Plan?.Plans?.[0]);

      const childOuter = (child.Children || [])[1];
      expect(childOuter.Kind).toEqual("Node");
      expect(childOuter.Label).toEqual('Function Scan on generate_series b');
      expect(childOuter.Alias).toEqual('b');
      expect(childOuter).not.toBe(queries[0].Plan?.Plans?.[1]);
    });

    // The two cases below probably don't exist in the real world, but it's
    // nice to know that we won't crash if somebody gives us bad data. It
    // might be nice to add a warning for these kind of plans to the root
    // node.
    test('no children', () => {
      const root2 = fromRawQueries([], {});
      expect(Object.keys(root2).sort()).toEqual(['Kind']);
    });

    test('empty children', () => {
      const root3 = fromRawQueries([{}, {}], {});
      expect(Object.keys(root3).sort()).toEqual(['Kind']);
    });
  });

  describe('opt = {VirtualQueryNodes: true}', () => {
    test('NestedLoop', () => {
      const {queries} = NestedLoop;
      const root = fromRawQueries(queries, {VirtualQueryNodes: true});
      expect(root.Children?.length).toEqual(1);
      const [c1] = root.Children;
      expect(c1.Kind).toEqual('Query');
      expect(c1.Label).toEqual('Query');

      expect(c1.Children?.length).toEqual(2);
      const [cc1, cc2] = c1?.Children;
      expect(cc1.Kind).toEqual("Planning");
      expect(cc1.Label).toEqual("Planning");
      expect(cc2.Kind).toEqual("Execution");
      expect(cc2.Label).toEqual("Execution");
    });

    test('RewriteTwoQueries', () => {
      const {queries} = RewriteTwoQueries;
      const root = fromRawQueries(queries, {VirtualQueryNodes: true});

      expect(root.Children?.length).toEqual(2);

      const child1 = (root.Children || [])[0];
      expect(child1.Kind).toEqual('Query');
      expect(child1.Label).toEqual('Query 1');

      const child2 = (root.Children || [])[1];
      expect(child2.Kind).toEqual('Query');
      expect(child2.Label).toEqual('Query 2');
    });
  });

  describe('setFilterRefs', () => {
    test('OneInitFilter', () => {
      const {queries} = OneInitFilter;
      const root = fromRawQueries(queries, {});
      const filter = root.Children?.[0];
      const init = filter?.Children?.[0];

      expect(filter?.["Filter"]).toEqual("(g > $0)");
      expect(init?.["Subplan Name"]).toEqual("InitPlan 1 (returns $0)");
      expect(filter?.["Filter Parent"]).toBe(init);
      expect(init?.["Filter Children"]?.[0]).toBe(filter);
    });

    test('OneInitOneTimeFilter', () => {
      const {queries} = OneInitOneTimeFilter;
      const root = fromRawQueries(queries, {});
      const filter = root.Children?.[0];
      const init = filter?.Children?.[0];

      expect(filter?.["One-Time Filter"]).toEqual("$0");
      expect(init?.["Subplan Name"]).toEqual("InitPlan 1 (returns $0)");
      expect(filter?.["Filter Parent"]).toBe(init);
      expect(init?.["Filter Children"]?.[0]).toBe(filter);
    });
  });

  // TODO: It'd be nice to make sure that these properties hold for all
  // combination of flameOptions.
  describe('property tests', () => {
    describe('IDs are incrementing', () => {
      for (let key in examples) {
        test(key, () => {
          let id = 0;
          const verify = (fn: FlameNode) => {
            if (fn.Kind != 'Root') {
              expect(fn.ID).toEqual(id);
            }
            id++;
            fn.Children?.map(verify);
          }
          verify(fromRawQueries(examples[key].queries));
        });
      }
    });

    describe('Kind is set and only one Root node exists', () => {
      for (let key in examples) {
        test(key, () => {
          const verify = (fn: FlameNode, root: boolean) => {
            expect(fn.Kind.length).toBeGreaterThan(0);
            if (root) {
              expect(fn.Kind).toEqual('Root');
            } else {
              expect(fn.Kind).not.toEqual('Root');
            }
            fn.Children?.map(c => verify(c, false));
          }
          verify(fromRawQueries(examples[key].queries), true);
        });
      }
    });

    describe('Label is set', () => {
      for (let key in examples) {
        test(key, () => {
          const verify = (fn: FlameNode, root: boolean) => {
            expect(fn.Kind.length).toBeGreaterThan(0);
            if (!root) {
              expect(fn.Label?.length).toBeGreaterThan(0);
            }
            fn.Children?.map(c => verify(c, false));
          }
          verify(fromRawQueries(examples[key].queries), true);
        });
      }
    });

    describe('Parent is set', () => {
      for (let key in examples) {
        test(key, () => {
          const verify = (fn: FlameNode, parent?: FlameNode) => {
            if (parent) {
              expect(fn.Parent).toBe(parent);
            }
            fn.Children?.map(c => verify(c, fn));
          }
          verify(fromRawQueries(examples[key].queries));
        });
      }
    });
  });
});

test('parseSubplanName', () => {
  expect(parseSubplanName("InitPlan 1 (returns $0)")).toEqual({
    ID: 1,
    Type: "InitPlan",
    Returns: [0],
  });
  expect(parseSubplanName("SubPlan 2 (returns $1,$2,$3)")).toEqual({
    ID: 2,
    Type: "SubPlan",
    Returns: [1, 2, 3],
  });
});

test('parseFilter', () => {
  expect(parseFilter('')).toEqual([]);
  expect(parseFilter('g = $0')).toEqual([0]);
  expect(parseFilter('g < $2 AND g > $4')).toEqual([2, 4]);
  expect(parseFilter('a < $2 AND b > $2 OR $5 = 1')).toEqual([2, 2, 5]);
});
