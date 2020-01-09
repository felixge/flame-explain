import {RawNode, RawQuery, RawQueries} from './RawExplain';
import {Disjoint} from './Util';

type FlameNode = Disjoint<
  Omit<RawQuery, "Plan"> & Omit<RawNode, "Plans">,
  Partial<FlameFragment>
>;

type FlameFragment = {
  /** Kind captures what kind of node this is. Root nodes have only Children
  * and no other properties. */
  "Kind": "Root" | "Query" | "Node";

  /** ID is a unique identifier present on all nodes except the Root node. */
  "ID"?: number;

  "Label"?: string;
  "Virtual"?: boolean;
  "Warnings"?: string[];
  "Self Time"?: number;
  "Total Time"?: number;


  /** Children is an array children. */
  "Children"?: FlameNode[];

  "CTEParent"?: FlameNode;
  "CTEScans"?: FlameNode[];
  "FilterParent"?: FlameNode;
  "FilterChildren"?: FlameNode[];
};

/**
 * fromRawQueries converts the given RawQueries into a FlameNode data structure
 * without modifying its inputs.
 */
export function fromRawQueries(rqs: RawQueries): FlameNode {
  let id = 0;
  const nextID = () => ++id;

  return {
    Kind: "Root",
    Children: rqs.map((rq) => {
      return fromRawNode(rq.Plan || {}, nextID);

      //let n: FlameNode = {
      //ID: i++,
      //Kind: "Query",
      //Label: "Query" + ((rqs.length > 1)
      //? ' ' + (i + 1)
      //: ''),
      //};

      //n = Object.assign({}, rq, n);
      //delete (n as any).Plan;

      //if (rq.Plan) {
      //n.Children = [fromRawNode(rq.Plan)];
      //}
      //return n;
    }),
  };
};

function fromRawNode(rn: RawNode, nextID: () => number): FlameNode {
  let fn: FlameNode = {
    Kind: "Node",
    ID: nextID(),
    Label: label(rn),
    Children: rn.Plans?.map(rnChild => fromRawNode(rnChild, nextID)),
  };

  fn = Object.assign({}, rn, fn);
  delete (fn as RawNode).Plans;

  return fn;
}

/**
 * label attempts to derrive the text node name from a RawNode in the same way
 * EXPLAIN ANALYZE (FORMAT TEXT) would print it. In some cases the text output
 * of EXPLAIN contains information that is not contained in the JSON output
 * (e.g. for Custom Scan), so this function isn't perfect.
 *
 * See https://github.com/postgres/postgres/blob/REL_12_0/src/backend/commands/explain.c#L1044
 */
export function label(n: RawNode): string {
  let pname: string;
  switch (n["Node Type"]) {
    case 'Aggregate':
      pname = 'Aggregate ???';
      switch (n.Strategy) {
        case 'Plain':
          pname = 'Aggregate';
          break;
        case 'Sorted':
          pname = 'GroupAggregate';
          break;
        case 'Hashed':
          pname = 'HashAggregate';
          break;
        case 'Mixed':
          pname = 'MixedAggregate';
          break
      }
      if (n["Partial Mode"] && n["Partial Mode"] !== 'Simple') {
        pname = n["Partial Mode"] + ' ' + pname;
      }
      break;
    case 'Foreign Scan':
      if (n.Operation) {
        if (n.Operation === 'Select') {
          pname = 'Foreign Scan'
        } else {
          pname = 'Foreign ' + n.Operation
        }
      } else {
        pname = '???'
      }
      break;
    case 'ModifyTable':
      if (n.Operation !== undefined) {
        pname = n.Operation
      } else {
        pname = '???'
      }
      break;
    case 'Merge Join':
      pname = 'Merge';
      break;
    case 'Hash Join':
      pname = 'Hash';
      break;
    case 'SetOp':
      pname = 'SetOp ???';
      switch (n.Strategy) {
        case 'Sorted':
          pname = 'SetOp';
          break;
        case 'Hashed':
          pname = 'HashedSetOp';
          break;
      }
      pname += ' ' + n.Command
      break;
    default:
      pname = n["Node Type"] || '???';
      break;
  }

  if (n["Join Type"]) {
    if (n["Join Type"] !== 'Inner') {
      pname += ' ' + n['Join Type'] + ' Join';
    } else if (n["Node Type"] !== 'Nested Loop') {
      pname += ' Join';
    }
  }

  if (n["Parallel Aware"]) {
    pname = 'Parallel ' + pname;
  }

  if (n["Scan Direction"] !== undefined) {
    if (n["Scan Direction"] === 'Backward') {
      pname += ' ' + n["Scan Direction"];
    }
    pname += ' using ' + n["Index Name"];
  } else if (n["Index Name"]) {
    pname += ' on ' + n["Index Name"];
  }

  let objectname = '';
  if (n["Relation Name"] !== undefined) {
    objectname = n["Relation Name"];
  } else if (n["Function Name"] !== undefined) {
    objectname = n["Function Name"];
  } else if (n["Table Function Name"] !== undefined) {
    objectname = n["Table Function Name"];
  } else if (n["CTE Name"] !== undefined) {
    objectname = n["CTE Name"];
  } else if (n["Tuplestore Name"] !== undefined) {
    objectname = n["Tuplestore Name"];
  }

  if (objectname) {
    pname += ' on '
    if (n.Schema !== undefined) {
      pname += quoteIdentifier(n.Schema) + '.' + quoteIdentifier(objectname);
    } else {
      pname += quoteIdentifier(objectname);
    }
    if (n.Alias && n.Alias !== objectname) {
      pname += ' ' + n.Alias;
    }
  }

  return pname;
}

/** TODO: Implement this! */
function quoteIdentifier(s: string): string {
  return s;
}
