import {textNodeName, transformQueries} from './Transform'
import {textTable, Column, queryFirst} from './TextTable';
import examplePlans from './example_plans';
import NestedLoop from './example_plans/NestedLoop';
import ParallelCount from './example_plans/ParallelCount';

describe('textNodeName', () => {
  test('Result', () => {
    expect(textNodeName({"Node Type": 'Result'})).toEqual('Result');
  });

  test('ModifyTable', () => {
    expect(textNodeName({
      "Node Type": 'ModifyTable',
      "Operation": "Insert",
      'Relation Name': '',
      'Alias': '',
    })).toEqual('Insert');
    expect(textNodeName({
      "Node Type": 'ModifyTable',
      "Operation": "Update",
      'Relation Name': '',
      'Alias': '',
    })).toEqual('Update');
    expect(textNodeName({
      "Node Type": 'ModifyTable',
      "Operation": "Delete",
      'Relation Name': '',
      'Alias': '',
    })).toEqual('Delete');

    expect(textNodeName({
      "Node Type": 'ModifyTable',
      "Operation": "Insert",
      'Relation Name': 'foo',
      'Alias': '',
    })).toEqual('Insert on foo');
    expect(textNodeName({
      "Node Type": 'ModifyTable',
      "Operation": "Insert",
      'Relation Name': 'foo',
      'Alias': 'bar',
    })).toEqual('Insert on foo bar');
    expect(textNodeName({
      "Node Type": 'ModifyTable',
      "Operation": "Insert",
      'Relation Name': 'foo',
      'Alias': 'bar',
      'Schema': 'baz',
    })).toEqual('Insert on baz.foo bar');
  });

  test('Foreign Scan', () => {
    expect(textNodeName({
      "Node Type": 'Foreign Scan',
      "Operation": "Select",
      'Relation Name': '',
      'Alias': '',
    })).toEqual('Foreign Scan');
    expect(textNodeName({
      "Node Type": 'Foreign Scan',
      "Operation": "Insert",
      'Relation Name': '',
      'Alias': '',
    })).toEqual('Foreign Insert');
    expect(textNodeName({
      "Node Type": 'Foreign Scan',
      "Operation": "Update",
      'Relation Name': '',
      'Alias': '',
    })).toEqual('Foreign Update');
    expect(textNodeName({
      "Node Type": 'Foreign Scan',
      "Operation": "Delete",
      'Relation Name': '',
      'Alias': '',
    })).toEqual('Foreign Delete');
  });

  test('Join Type', () => {
    expect(textNodeName({
      "Node Type": 'Hash Join',
      "Hash Cond": '',
      "Join Type": "Left",
    })).toEqual('Hash Left Join');
    expect(textNodeName({
      "Node Type": 'Merge Join',
      "Join Type": "Left",
    })).toEqual('Merge Left Join');
    expect(textNodeName({
      "Node Type": 'Hash Join',
      "Hash Cond": '',
      "Join Type": "Inner",
    })).toEqual('Hash Join');
    expect(textNodeName({
      "Node Type": 'Nested Loop',
      "Join Type": "Inner",
    })).toEqual('Nested Loop');
    expect(textNodeName({
      "Node Type": 'Nested Loop',
      "Join Type": "Left",
    })).toEqual('Nested Loop Left Join');
  });

  test('Aggregate', () => {
    expect(textNodeName({
      "Node Type": 'Aggregate',
      "Strategy": "Plain",
    })).toEqual('Aggregate');
    expect(textNodeName({
      "Node Type": 'Aggregate',
      "Strategy": "Sorted",
    })).toEqual('GroupAggregate');
    expect(textNodeName({
      "Node Type": 'Aggregate',
      "Strategy": "Hashed",
    })).toEqual('HashAggregate');
    expect(textNodeName({
      "Node Type": 'Aggregate',
      "Strategy": "Mixed",
    })).toEqual('MixedAggregate');
    expect(textNodeName({
      "Node Type": 'Aggregate',
      "Strategy": "???",
    })).toEqual('Aggregate ???');

    expect(textNodeName({
      "Node Type": 'Aggregate',
      "Strategy": "Sorted",
      "Partial Mode": "Simple",
    })).toEqual('GroupAggregate');
    expect(textNodeName({
      "Node Type": 'Aggregate',
      "Strategy": "Sorted",
      "Partial Mode": "Partial",
    })).toEqual('Partial GroupAggregate');
    expect(textNodeName({
      "Node Type": 'Aggregate',
      "Strategy": "Sorted",
      "Partial Mode": "Finalize",
    })).toEqual('Finalize GroupAggregate');
  });

  test('SetOp', () => {
    expect(textNodeName({
      "Node Type": 'SetOp',
      "Strategy": "Sorted",
      "Command": "Intersect",
    })).toEqual('SetOp Intersect');
    expect(textNodeName({
      "Node Type": 'SetOp',
      "Strategy": "Hashed",
      "Command": "Intersect All",
    })).toEqual('HashedSetOp Intersect All');
    expect(textNodeName({
      "Node Type": 'SetOp',
      "Strategy": "???",
      "Command": "Except",
    })).toEqual('SetOp ??? Except');
  });

  test('Parallel Aware', () => {
    expect(textNodeName({
      "Node Type": 'Seq Scan',
      "Parallel Aware": true,
      "Relation Name": '',
      "Alias": '',
    })).toEqual('Parallel Seq Scan');
  });

  test('PlanNodeTargetRel', () => {
    expect(textNodeName({
      "Node Type": 'Seq Scan',
      "Relation Name": 'foo',
      "Alias": '',
    })).toEqual('Seq Scan on foo');
    expect(textNodeName({
      "Node Type": 'Seq Scan',
      "Relation Name": 'foo',
      "Schema": 'myschema',
      "Alias": '',
    })).toEqual('Seq Scan on myschema.foo');
    expect(textNodeName({
      "Node Type": 'Seq Scan',
      "Relation Name": 'foo',
      "Alias": 'bar',
      "Schema": 'myschema',
    })).toEqual('Seq Scan on myschema.foo bar');

    expect(textNodeName({
      "Node Type": 'Function Scan',
      "Function Name": 'foo',
      "Schema": 'myschema',
      "Alias": 'bar',
    })).toEqual('Function Scan on myschema.foo bar');

    expect(textNodeName({
      "Node Type": 'Table Function Scan',
      "Table Function Name": 'xmltable',
      "Schema": 'myschema',
      "Alias": 'bar',
    })).toEqual('Table Function Scan on myschema.xmltable bar');

    expect(textNodeName({
      "Node Type": 'CTE Scan',
      "CTE Name": 'foo',
      "Schema": 'myschema',
      "Alias": 'bar',
    })).toEqual('CTE Scan on myschema.foo bar');
    expect(textNodeName({
      "Node Type": 'WorkTable Scan',
      "CTE Name": 'foo',
      "Schema": 'myschema',
      "Alias": 'bar',
    })).toEqual('WorkTable Scan on myschema.foo bar');

    expect(textNodeName({
      "Node Type": 'Named Tuplestore Scan',
      "Tuplestore Name": 'foo',
      "Schema": 'myschema',
      "Alias": 'bar',
    })).toEqual('Named Tuplestore Scan on myschema.foo bar');

    expect(textNodeName({
      "Node Type": 'Bitmap Index Scan',
      "Index Name": 'my_idx',
      "Index Cond": '',
    })).toEqual('Bitmap Index Scan on my_idx');

    expect(textNodeName({
      "Node Type": 'Index Scan',
      "Index Name": 'my_idx',
      "Index Cond": '',
      "Scan Direction": 'Forward',
      "Rows Removed by Index Recheck": 0,
      "Relation Name": 'foo',
      "Alias": 'bar',
      "Schema": 'myschema',
    })).toEqual('Index Scan using my_idx on myschema.foo bar');
    expect(textNodeName({
      "Node Type": 'Index Scan',
      "Index Name": 'my_idx',
      "Index Cond": '',
      "Scan Direction": 'Backward',
      "Rows Removed by Index Recheck": 0,
      "Relation Name": 'foo',
      "Alias": 'bar',
      "Schema": 'myschema',
    })).toEqual('Index Scan Backward using my_idx on myschema.foo bar');
  });
});

describe('transformQueries', () => {
  describe('time accounting snapshots are matching', () => {
    for (let name in examplePlans) {
      test(name, () => {
        const root = transformQueries(examplePlans[name].queries);
        const columns: Column[] = [
          '#',
          'Label',
          'Actual Total Time',
          'Actual Loops',
          'Total Time',
          'Self Time',
          'Virtual',
        ];
        const table = textTable(root, {title: name, columns: columns});
        expect(table).toMatchSnapshot();
      });
    }
  });

  describe('account for "Actual Loops"', () => {
    test('enabled', () => {
      const root = transformQueries(NestedLoop.queries);
      const nl = queryFirst(root, '**', 'Nested Loop');
      expect(nl).toMatchObject({
        'Actual Total Time': '59 μs',
        'Self Time': '30 μs',
        'Total Time': '59 μs',
      });
      const gsB = queryFirst(nl.Source, 'Function Scan on generate_series b');
      expect(gsB).toMatchObject({
        'Actual Loops': '10',
        'Actual Total Time': '2 μs',
        'Self Time': '20 μs',
        'Total Time': '20 μs',
      });
    });

    test('disabled', () => {
      const root = transformQueries(NestedLoop.queries, {Loops: false});
      const nl = queryFirst(root, '**', 'Nested Loop');
      expect(nl).toMatchObject({
        'Actual Total Time': '59 μs',
        'Self Time': '48 μs',
        'Total Time': '59 μs',
      });
      const gsB = queryFirst(nl.Source, 'Function Scan on generate_series b');
      expect(gsB).toMatchObject({
        'Actual Loops': '10',
        'Actual Total Time': '2 μs',
        'Self Time': '2 μs',
        'Total Time': '2 μs',
      });
    });
  });

  describe('account for parallel "Actual Loops"', () => {
    //test('enabled', () => {
    //const root = transformQueries(ParallelCount.queries, {Loops: true});
    //const fa = queryFirst(root, '**', 'Finalize Aggregate');
    //expect(fa).toMatchObject({
    //'Actual Total Time': '834.7 ms',
    //'Self Time': '0 μs',
    //'Total Time': '850.9 ms',
    //});
    //const ga = queryFirst(fa.Source, 'Gather');
    //expect(ga).toMatchObject({
    //'Actual Total Time': '850.9 ms',
    //'Self Time': '20.3 ms',
    //'Total Time': '850.9 ms',
    //});
    //const pa = queryFirst(ga.Source, 'Partial Aggregate');
    //expect(pa).toMatchObject({
    //'Actual Total Time': '830.6 ms',
    //'Self Time': '357.2 ms',
    //'Total Time': '830.6 ms',
    //});
    //const ps = queryFirst(pa.Source, 'Parallel Seq Scan on foo');
    //expect(ps).toMatchObject({
    //'Actual Total Time': '473.4 ms',
    //'Self Time': '473.4 ms',
    //'Total Time': '473.4 ms',
    //});
    //});

    //test('disabled', () => {
    //const root = transformQueries(ParallelCount.queries, {Loops: false});
    //const fa = queryFirst(root, '**', 'Finalize Aggregate');
    //expect(fa).toMatchObject({
    //'Actual Total Time': '834.7 ms',
    //'Self Time': '-16.2 ms',
    //'Total Time': '834.7 ms',
    //});
    //const ga = queryFirst(fa.Source, 'Gather');
    //expect(ga).toMatchObject({
    //'Actual Total Time': '850.9 ms',
    //'Self Time': '20.3 ms',
    //'Total Time': '850.9 ms',
    //});
    //const pa = queryFirst(ga.Source, 'Partial Aggregate');
    //expect(pa).toMatchObject({
    //'Actual Total Time': '830.6 ms',
    //'Self Time': '357.2 ms',
    //'Total Time': '830.6 ms',
    //});
    //const ps = queryFirst(pa.Source, 'Parallel Seq Scan on foo');
    //expect(ps).toMatchObject({
    //'Actual Total Time': '473.4 ms',
    //'Self Time': '473.4 ms',
    //'Total Time': '473.4 ms',
    //});
    //});
  });
});
