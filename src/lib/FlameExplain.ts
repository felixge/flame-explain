import {RawNode, RawQuery, RawQueries} from './RawExplain';
import {Disjoint} from './Util';

export type FlameNode = Disjoint<
  Omit<RawQuery, "Plan"> & Omit<RawNode, "Plans">,
  FlameFragment
>;

type FlameFragment = {
  /** Kind captures what kind of node this is. Root nodes have only Children
  * and no other properties. */
  "Kind": "Root" | "Query" | "Execution" | "Planning" | "Node";

  /** ID is a unique identifier present on all nodes except the Root node. */
  "ID"?: number;

  /** Label is a short human-readable description of the node, present for all
  * nodes except the Root node. */
  "Label"?: string;

  //"Virtual"?: boolean;
  //"Warnings"?: string[];
  //"Self Time"?: number;
  //"Total Time"?: number;


  /** Children is an array children. */
  "Children"?: FlameNode[];

  //"CTEParent"?: FlameNode;
  //"CTEScans"?: FlameNode[];
  //"FilterParent"?: FlameNode;
  //"FilterChildren"?: FlameNode[];
};

export type flameOptions = Partial<{
  VirtualQueryNodes: boolean,
}>;

const defaultOptions: flameOptions = {
  /** VirtualQueryNodes produces a virtual node Query node for each query that
   * contains virtual nodes 'Execution Time' and 'Planning Time'. */
  VirtualQueryNodes: true,
};

/**
 * fromRawQueries converts the given RawQueries into a FlameNode data structure
 * without modifying its inputs.
 */
export function fromRawQueries(
  rqs: RawQueries,
  opt: flameOptions = defaultOptions,
): FlameNode {
  let id = 0;
  const nextNode = (fn: FlameNode): FlameNode => Object.assign(fn, {ID: ++id});

  const root: FlameNode = {Kind: "Root"};
  rqs.forEach((rq, i) => {
    let parent = root;
    if (opt.VirtualQueryNodes) {
      const query = nextNode({
        Kind: 'Query',
        Label: 'Query' + ((rqs.length > 1)
          ? ' ' + (i + 1)
          : ''),
      });

      parent.Children = (parent.Children || []).concat(query);
      parent = query;

      const planning = nextNode({Kind: "Planning", Label: "Planning"});
      const execution = nextNode({Kind: "Execution", Label: "Execution"});
      parent.Children = [planning, execution];

      parent = execution;
    }

    if (rq.Plan) {
      const firstNode = fromRawNode(rq.Plan || {}, nextNode);
      parent.Children = (parent.Children || []).concat(firstNode);
    }
  });

  return root;
};

function fromRawNode(
  rn: RawNode,
  nextNode: (fn: FlameNode) => FlameNode
): FlameNode {
  let fn = nextNode({
    Kind: "Node",
    Label: label(rn),
  });

  fn = Object.assign({}, rn, fn);
  fn.Children = rn.Plans?.map(rnChild => fromRawNode(rnChild, nextNode));
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
