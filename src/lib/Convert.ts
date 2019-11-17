import {Plan as ExplainPlan, Node as ExplainNode} from './ExplainJSON';
import {Node as FlameNode, Timing as FlameTiming} from './FlameJSON';

export function fromPlan(plan: ExplainPlan): FlameNode {
  const root = plan[0];
  let ctes = extractCTEs(root.Plan);

  if (!('Execution Time' in root)) {
    return fromNode(root.Plan, ctes);
  }

  const child = fromNode(root.Plan, ctes) as FlameNode & FlameTiming;
  return {
    "Label": 'Query',
    'Exclusive Time': 0,
    "Inclusive Time": root["Execution Time"] + root["Planning Time"],
    "Virtual": true,
    "Source": root,
    "Children": [
      {
        "Label": 'Planning',
        "Exclusive Time": root["Planning Time"],
        "Inclusive Time": root["Planning Time"],
        "Virtual": true,
        "Source": root,
      } as FlameNode & FlameTiming,
      {
        "Label": 'Execution',
        "Exclusive Time": root["Execution Time"] - child["Inclusive Time"],
        "Inclusive Time": root["Execution Time"],
        "Virtual": true,
        "Source": root,
        'Children': [child],
      } as FlameNode & FlameTiming,
    ],
  } as FlameNode & FlameTiming;
}

export function fromNode(n: ExplainNode, ctes: CTEs): FlameNode {
  let r: FlameNode = {
    "Label": textNodeName(n),
    "Virtual": false,
    "Source": n,
  };

  // TODO: Is there a better way to tell typescript that we can assign
  // timing info to r despite the assignment above not including it?
  let rt = r as FlameNode & FlameTiming;
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
      inclTime *= (1 - 1 / cte.scanTime * cte.queryTime);
    }

    rt['Inclusive Time'] = rt['Exclusive Time'] = inclTime;

  }

  let childInclusiveTime = 0;
  if (n.Plans) {
    r.Children = n.Plans
      .map((child) => {
        const childNode = fromNode(child, ctes);
        if ('Inclusive Time' in childNode) {
          childInclusiveTime += childNode['Inclusive Time'];
        }
        return childNode;
      });
  }

  // Rounding errors on looped nodes can lead to parent nodes with less
  // Inclusive Time than their children, which is non-sense. So we correct for
  // this here. This also prevents our Exclusive Time calculation below from
  // going negative in these cases.
  if (rt['Inclusive Time'] < childInclusiveTime) {
    rt['Inclusive Time'] = childInclusiveTime;
  }

  rt['Exclusive Time'] = rt['Inclusive Time'] - childInclusiveTime;

  return r;
}

type CTEs = {
  [key: string]: {
    query: ExplainNode,
    scans: ExplainNode[],
    scanTime: number,
    queryTime: number,
  }
};

export function extractCTEs(n: ExplainNode, ctes?: CTEs): CTEs {
  ctes = ctes || {};
  let cteName: string = "";
  if (n["Node Type"] === 'CTE Scan') {
    cteName = n["CTE Name"];
  } else if (n["Subplan Name"] && n["Subplan Name"].startsWith('CTE ')) {
    cteName = n["Subplan Name"].substr(4);
  }

  if (cteName) {
    let cte = ctes[cteName] = ctes[cteName] || {
      query: null,
      scans: [],
      scanTime: 0,
      queryTime: 0,
    };
    let time = nodeTimeLooped(n) || 0;

    if (n["Node Type"] === 'CTE Scan') {
      cte.scans.push(n);
      cte.scanTime += time;
    } else {
      cte.query = n;
      cte.queryTime = time;
    }
  }

  (n.Plans || []).forEach((plan) => extractCTEs(plan, ctes));

  return ctes;
};

function nodeTimeLooped(n: ExplainNode): number | void {
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
export function textNodeName(n: ExplainNode): string {
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
