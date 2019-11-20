import {Plan as RPlan, Node as RNode} from './RawPlan';
import {Node as TNode, Timing as TTiming} from './TransformedPlan';

export function transformPlan(plan: RPlan): TNode {
  const root = plan[0];
  let ctes = extractCTEs(root.Plan);

  if (!('Execution Time' in root)) {
    return fromNode(root.Plan, ctes);
  }

  const child = fromNode(root.Plan, ctes) as TNode & TTiming;
  return {
    "Label": 'Query',
    'Self Time': 0,
    "Total Time": root["Execution Time"] + root["Planning Time"],
    "Virtual": true,
    "Source": root,
    "Children": [
      {
        "Label": 'Planning',
        "Self Time": root["Planning Time"],
        "Total Time": root["Planning Time"],
        "Virtual": true,
        "Source": root,
      } as TNode & TTiming,
      {
        "Label": 'Execution',
        "Self Time": root["Execution Time"] - child["Total Time"],
        "Total Time": root["Execution Time"],
        "Virtual": true,
        "Source": root,
        'Children': [child],
      } as TNode & TTiming,
    ],
  } as TNode & TTiming;
}

export function fromNode(n: RNode, ctes: CTEs): TNode {
  let r: TNode = {
    "Label": textNodeName(n),
    "Virtual": false,
    "Source": n,
  };

  // TODO: Is there a better way to tell typescript that we can assign
  // timing info to r despite the assignment above not including it?
  let rt = r as TNode & TTiming;
  if ('Actual Total Time' in n && 'Actual Loops' in n) {
    let inclTime = nodeTimeLooped(n) || 0;
    if (n["Node Type"] === 'CTE Scan') {
      let cte = ctes[n["CTE Name"]];
      // PostgreSQL CTEs consist of one CTE InitPlan query node,
      // plus one or more CTE Scans. The time spent in the
      // CTE InitPlan is also attributed to the CTE Scan nodes. There
      // is no perfect way to tell how much time of a CTE Scan was
      // spent in the InitPlan query, but IMO it's fairly reasonable
      // approach is to take the time of the CTE Scan divided by the
      // time spent on all CTE Scans multiplied by the time spent in
      // the query node.
      inclTime *= (1 - 1 / cte.scanTime * cte.initNodeTime);
    }

    rt['Total Time'] = rt['Self Time'] = inclTime;

  }

  let childInclusiveTime = 0;
  if (n.Plans) {
    r.Children = n.Plans
      .map((child) => {
        const childNode = fromNode(child, ctes);
        if ('Total Time' in childNode) {
          childInclusiveTime += childNode['Total Time'];
        }
        return childNode;
      });
  }

  // Rounding errors on looped nodes can lead to parent nodes with less
  // Total Time than their children, which is non-sense. So we correct for
  // this here. This also prevents our Self Time calculation below from
  // going negative in these cases.
  if (rt['Total Time'] < childInclusiveTime) {
    rt['Total Time'] = childInclusiveTime;
  }

  rt['Self Time'] = rt['Total Time'] - childInclusiveTime;

  return r;
}

/** Named list of all CTEs contained in a query plan. */
type CTEs = {
  [key: string]: CTE
};

/** Useful information about a CTE inside of a query plan. */
type CTE = {
  /** InitPlan node for this CTE, i.e. the actual CTE query plan itself. */
  initNode: RNode,
  /** Total time spent executing the initNode */
  initNodeTime: number,
  /** List of all CTE Scan nodes for this CTE. */
  scans: RNode[],
  /** Total time spent executing the scan nodes for this CTE. */
  scanTime: number,
}

export function extractCTEs(n: RNode, ctes?: CTEs): CTEs {
  ctes = ctes || {};
  const prefix = 'CTE ';
  let cteName: string = "";
  if (n["Node Type"] === 'CTE Scan') {
    cteName = n["CTE Name"];
  } else if (n["Subplan Name"] && n["Subplan Name"].startsWith(prefix)) {
    cteName = n["Subplan Name"].substr(prefix.length);
  }

  if (cteName) {
    let cte = ctes[cteName] = ctes[cteName] || {
      initNode: null,
      scans: [],
      scanTime: 0,
      initNodeTime: 0,
    };
    let time = nodeTimeLooped(n) || 0;

    if (n["Node Type"] === 'CTE Scan') {
      cte.scans.push(n);
      cte.scanTime += time;
    } else {
      cte.initNode = n;
      cte.initNodeTime = time;
    }
  }

  (n.Plans || []).forEach((plan) => extractCTEs(plan, ctes));

  return ctes;
};

function nodeTimeLooped(n: RNode): number | void {
  if ('Actual Total Time' in n && 'Actual Loops' in n) {
    return n["Actual Total Time"] * n["Actual Loops"];
  }
}

/**
 * Attempts to derrive the text node name from a JSON PlanNode. In some cases
 * the text output of EXPLAIN contains information that is not contained in
 * the JSON output (e.g. for Custom Scan), so this function isn't perfect.
 * See https://github.com/postgres/postgres/blob/REL_12_0/src/backend/commands/explain.c#L1044
 * @param n 
 */
export function textNodeName(n: RNode): string {
  let pname: string;
  switch (n["Node Type"]) {
    case 'Aggregate':
      pname = 'Aggregate ???';
      if ('Strategy' in n) {
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
      }
      if ('Partial Mode' in n && n["Partial Mode"] && n["Partial Mode"] !== 'Simple') {
        pname = n["Partial Mode"] + ' ' + pname;
      }
      break;
    case 'Foreign Scan':
      if ('Operation' in n && n.Operation) {
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
      if ('Operation' in n && n.Operation) {
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
      if ('Strategy' in n) {
        switch (n.Strategy) {
          case 'Sorted':
            pname = 'SetOp';
            break;
          case 'Hashed':
            pname = 'HashedSetOp';
            break;
        }
        pname += ' ' + n.Command
      }
      break;
    default:
      pname = n["Node Type"];
      break;
  }

  if ('Join Type' in n) {
    if (n["Join Type"] !== 'Inner') {
      pname += ' ' + n['Join Type'] + ' Join';
    } else if (n["Node Type"] !== 'Nested Loop') {
      pname += ' Join';
    }
  }

  if (n["Parallel Aware"]) {
    pname = 'Parallel ' + pname;
  }

  if ('Scan Direction' in n) {
    if (n["Scan Direction"] === 'Backward') {
      pname += ' ' + n["Scan Direction"];
    }
    pname += ' using ' + n["Index Name"];
  } else if ('Index Name' in n) {
    pname += ' on ' + n["Index Name"];
  }

  let objectname = '';
  if ('Relation Name' in n) {
    objectname = n["Relation Name"];
  } else if ('Function Name' in n) {
    objectname = n["Function Name"];
  } else if ('Table Function Name' in n) {
    objectname = n["Table Function Name"];
  } else if ('CTE Name' in n) {
    objectname = n["CTE Name"];
  } else if ('Tuplestore Name' in n) {
    objectname = n["Tuplestore Name"];
  }

  if (objectname) {
    pname += ' on '
    if ('Schema' in n && n.Schema) {
      pname += quoteIdentifier(n.Schema) + '.' + quoteIdentifier(objectname);
    } else {
      pname += quoteIdentifier(objectname);
    }
    if ('Alias' in n && n.Alias && n.Alias !== objectname) {
      pname += ' ' + n.Alias;
    }
  }

  return pname;
}

/** TODO: Implement this! */
function quoteIdentifier(s: string): string {
  return s;
}
