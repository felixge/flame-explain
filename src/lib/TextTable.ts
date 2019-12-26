import {Node as FNode} from './FlameExplain';
import {formatDuration} from './Util';
// @ts-ignore no type definitions
import AsciiTable from 'ascii-table';

export type Column = keyof Row;

export type Row = {
  '#': string,
  'Actual Loops': string,
  'Actual Rows': string,
  'Actual Total Time': string,
  'Label': string,
  'Node Type': string,
  'Self Time': string,
  'Total Time': string,
  'Virtual': string,
  'Source': FNode,
};

export function textTable(
  n: FNode,
  {columns = [], title = ''}: {
    columns: Column[],
    title?: string
  }
): string {
  let table = new AsciiTable(title);
  table.setHeading(...columns);

  columns.forEach((col, i) => {
    if (col !== 'Label') {
      table.setAlignRight(i);
    }
  });

  let rowNum = 1;
  const visit = (n: FNode, depth = 0) => {
    if (!n.Root) {
      const row = toRow(n, {depth: depth, rowNum: rowNum});
      const colVals = columns.map(c => row[c]);
      table.addRow(...colVals);
      rowNum++;
      depth++;
    }

    (n.Children || []).forEach(child => visit(child, depth));
  }
  visit(n);

  return table.toString();
}

type extractOptions = {
  rowNum?: number,
  depth?: number,
};

export function toRow(n: FNode, o?: extractOptions): Row {
  return {
    '#': o?.rowNum?.toString() || '',
    'Actual Loops': ('Actual Loops' in n.Source)
      ? n.Source["Actual Loops"].toString()
      : '',
    'Actual Rows': ('Actual Rows' in n.Source)
      ? n.Source["Actual Rows"].toString()
      : '',
    'Actual Total Time': ('Actual Total Time' in n.Source)
      ? formatDuration(n.Source["Actual Total Time"])
      : '',
    'Label': '  '.repeat(o?.depth || 0) + n.Label,
    'Node Type': ('Node Type' in n.Source)
      ? n.Source["Node Type"]
      : '',
    'Self Time': ('Self Time' in n)
      ? formatDuration(n["Self Time"])
      : '',
    'Source': n,
    'Total Time': ('Total Time' in n)
      ? formatDuration(n["Total Time"])
      : '',
    'Virtual': (n.Virtual)
      ? 'x'
      : '',
  };
}

type path = '*' | '**' | string;

export function queryAll(n: FNode, ...path: path[]): Row[] {
  const rows: Row[] = [];
  const visit = (n: FNode, path: string[]) => {
    if (path.length === 0) {
      return;
    }

    if (path[0] === n.Label || path[0] === '*') {
      path = path.slice(1);
    } else if (path[0] === '**' && path[1] === n.Label) {
      path = path.slice(2);
    } else if (path[0] === '**') {
    } else {
      return;
    }

    if (path.length === 0) {
      rows.push(toRow(n));
      return;
    }

    (n.Children || []).forEach(child => visit(child, path));
  };
  (n.Children || []).forEach(child => visit(child, path))

  return rows;
};

export function queryFirst(n: FNode, ...path: string[]): Row {
  return queryAll(n, ...path)[0];
};
