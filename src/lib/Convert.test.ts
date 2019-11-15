import { fromNode, fromPlan, textNodeName, extractCTEs } from './Convert'
// import { tests, TestName } from './tests'
import {
    Plan as ExplainPlan,
    Node as ExplainNode,
    PlanAnalyzedFragment as ExplainPlanAnalyzed,
    NodeTimingFragment as ExplainNodeTiming,
} from './ExplainJSON';
import { query, Node as FlameNode, Timing as FlameTiming } from './FlameJSON';
import { AssertionError } from 'assert';
import { Certificate } from 'crypto';

import cteSleepUnion from './test-fixtures/CTESleepUnion';

// test('toFlameJSON', async () => {
//     let name: TestName;
//     for (name in tests) {
//         const test = tests[name];
//         const fold = toFolded(test.explainJSON);
//         expect(fold).toMatchSnapshot(name);
//     }
// });

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
            "Join Type": "Left",
        })).toEqual('Hash Left Join');
        expect(textNodeName({
            "Node Type": 'Merge Join',
            "Join Type": "Left",
        })).toEqual('Merge Left Join');
        expect(textNodeName({
            "Node Type": 'Hash Join',
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

// describe('toFlameTextNodeName', () => {
//     test('Subplan Name', () => {
//         expect(toFlameTextNodeName({
//             "Node Type": "Nested Loop",
//             "Parent Relationship": "InitPlan",
//             "Subplan Name": "CTE sleep",
//             "Parallel Aware": false,
//             "Join Type": "Inner",
//             "Inner Unique": false,
//         })).toEqual('CTE sleep: Nested Loop')
//     })
// });

test('extractCTEs', () => {
    let ctes = extractCTEs(cteSleepUnion[0].Plan);
    expect(ctes["foo"].query["Node Type"]).toEqual('Append');
    const s1 = ctes["foo"].scans[0] as ExplainNodeTiming;
    const s2 = ctes["foo"].scans[1] as ExplainNodeTiming;
    expect(s1["Actual Total Time"]).toEqual(102.154);
    expect(s2["Actual Total Time"]).toEqual(202.210);
});

describe('flameNode', () => {
    const loopedSeqScan: ExplainNode = {
        "Node Type": "Seq Scan",
        'Actual Total Time': 3,
        'Actual Loops': 5,
        'Relation Name': 'foo',
        "Alias": 'bar',
        "Schema": "baz",
    };

    test('multiply time by loop count', () => {
        const n = fromNode(loopedSeqScan, {}) as FlameTiming;
        expect(n["Exclusive Time"]).toEqual(15);
        expect(n["Inclusive Time"]).toEqual(15);
    });

    test('insert virtual nodes for planning/execution', () => {
        const plan: ExplainPlan = [{
            "Execution Time": 19,
            "Planning Time": 3,
            "Plan": loopedSeqScan,
        }];

        const n = fromPlan(plan) as FlameNode&FlameTiming;
        expect(n.Label).toEqual('Query');
        expect(n.Source).toEqual(plan[0]);
        expect(n["Exclusive Time"]).toEqual(0);
        expect(n["Inclusive Time"]).toEqual(19+3);
        const c1 = (n.Children || [])[0] as FlameNode&FlameTiming;
        expect(c1.Label).toEqual('Planning');
        expect(c1.Source).toEqual(plan[0]);
        expect(c1["Exclusive Time"]).toEqual(3);
        expect(c1["Inclusive Time"]).toEqual(3);
        const c2 = (n.Children || [])[1] as FlameNode&FlameTiming;
        expect(c2.Label).toEqual('Execution');
        expect(c2.Source).toEqual(plan[0]);
        // Usually the Execution's Exclusive Time will be 0, but we're testing
        // the edge case here were the inclusive time of the child node is
        // smaller than the 'Execution Time' of the child node. This can happen
        // in the real world, see: https://postgrespro.com/list/thread-id/2454729
        expect(c2["Exclusive Time"]).toEqual(19-3*5);
        expect(c2["Inclusive Time"]).toEqual(19);
    });

    test('insert virtual nodes for planning/execution', () => {
        const root = fromPlan(cteSleepUnion);

        const exec = query(root, ['Execution']) as FlameNode&FlameTiming;
        const limit = query(exec, ['Limit']) as FlameNode&FlameTiming
        const append = query(limit, ['Append']) as FlameNode&FlameTiming
        const cteScan1 = query(limit, ['CTE Scan on foo foo_1']) as FlameNode&FlameTiming
        const cteScan2 = query(limit, ['Result', 'CTE Scan on foo']) as FlameNode&FlameTiming

        const execTime = (cteSleepUnion[0] as ExplainPlanAnalyzed)['Execution Time'];
        expect(exec["Inclusive Time"]).toEqual(execTime);
        expect(exec["Exclusive Time"]).toBeCloseTo(execTime- limit["Inclusive Time"], 3);

        const nodeSourceTime = (n: FlameNode):number => {
            if ('Actual Startup Time' in n.Source) {
                return n.Source["Actual Total Time"];
            }
            throw new Error('bad node: '+JSON.stringify(n));
        }

        const csQuery = append["Inclusive Time"];
        const cs1 = nodeSourceTime(cteScan1);
        const cs2 = nodeSourceTime(cteScan2);
        const csSum = cs1+cs2; 

        expect(cteScan1["Exclusive Time"]).toBeCloseTo(cs1 - cs1/csSum*csQuery, 3)
        expect(cteScan1["Inclusive Time"]).toBeCloseTo(cs1 - cs1/csSum*csQuery, 3)
        expect(cteScan2["Exclusive Time"]).toBeCloseTo(cs2 - cs2/csSum*csQuery, 3)
        expect(cteScan2["Inclusive Time"]).toBeCloseTo(cs2 - cs2/csSum*csQuery, 3)

        

        // expect(n1_1["Inclusive Time"]).toEqual(1000.651);
        const cteScanSum = 0.015 + 1000.613 + 0.004;
        // expect(n1_1["Exclusive Time"]).toBeCloseTo(1000.651-1000.617-0.023-(1000.617-1000.613)-0.004, 3);
        // console.log([n1_1.Children || {}].map((child) => {
        //     return child;
        // }));
    });
})
