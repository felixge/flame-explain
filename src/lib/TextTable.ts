import {Node as FNode} from './FlameExplain';
import {formatDuration} from './Util';
// @ts-ignore no type definitions
import AsciiTable from 'ascii-table';

export type Column =
  '#' |
  'Actual Loops' |
  'Actual Rows' |
  'Actual Total Time' |
  'Label' |
  'Node Type' |
  'Self Time' |
  'Total Time' |
  'Virtual';

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
    if (!(col === '#' || col === 'Label')) {
      table.setAlignRight(i);
    }
  });

  let rowNum = 1;
  const visit = (n: FNode, depth = 0) => {
    if (!n.Root) {
      const colVals = columns.map(c => extractColumn(n, c, rowNum, depth));
      table.addRow(...colVals);
      rowNum++;
      depth++;
    }

    (n.Children || []).forEach(child => visit(child, depth));
  }
  visit(n);

  return table.toString();
}

export function extractColumn(n: FNode, c: Column, rowNum: number, depth: number): any {
  switch (c) {
    case '#':
      return rowNum;
    case 'Actual Loops':
      return ('Actual Loops' in n.Source)
        ? n.Source["Actual Loops"]
        : '';
    case 'Actual Rows':
      return ('Actual Rows' in n.Source)
        ? n.Source["Actual Rows"]
        : '';
    case 'Actual Total Time':
      return ('Actual Total Time' in n.Source)
        ? formatDuration(n.Source["Actual Total Time"])
        : '';
    case 'Label':
      return '  '.repeat(depth) + n.Label;
    case 'Node Type':
      return ('Node Type' in n.Source)
        ? n.Source["Node Type"]
        : '';
    case 'Self Time':
      return ('Self Time' in n)
        ? formatDuration(n["Self Time"])
        : '';
    case 'Total Time':
      return ('Total Time' in n)
        ? formatDuration(n["Total Time"])
        : '';
    case 'Virtual':
      return (n.Virtual)
        ? 'x'
        : '';
  }
}
