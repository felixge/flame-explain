import {FlameNode} from './FlameExplain';
import {formatDuration} from './Util';
// @ts-ignore no type definitions
import AsciiTable from 'ascii-table';

export type Column = keyof FlameNode;

export function textTable(
  fn: FlameNode,
  {columns = [], title = ''}: {
    columns: Column[],
    title?: string
  }
): string {
  let table = new AsciiTable(title);
  let warnTable = new AsciiTable();
  table.setHeading(...columns.map(c => {
    return c;
  }));
  warnTable.setHeading('#', 'Warning');

  columns.forEach((col, i) => {
    if (col !== 'Label') {
      table.setAlignRight(i);
    }
  });

  let warnCount = 0;
  const visit = (fn: FlameNode, depth = 0) => {
    if (fn.Kind !== 'Root') {
      const vals = columns.map(c => columnText(fn, c, {depth}));
      table.addRow(...vals);
      fn.Warnings?.forEach(warning => {
        warnTable.addRow(fn.ID, warning);
        warnCount += 1;
      });
    }

    fn.Children?.forEach(child => visit(child, depth + 1));
  }
  visit(fn);

  let out = table.toString();
  if (warnCount > 0) {
    out += '\n\n' + warnTable.toString();
  }
  return out;
}

type flameStringOptions = {
  depth?: number;
};

export function columnText(fn: FlameNode, col: Column, opt: flameStringOptions = {}): string {
  if (fn[col] === undefined) {
    return '';
  }

  let val = '';
  switch (col) {
    case 'Actual Total Time':
    case 'Actual Startup Time':
    case 'Total Time':
    case 'Self Time':
    case 'Execution Time':
    case 'Planning Time':
      val = formatDuration(fn[col] as number);
      break;
    default:
      let colVal = fn[col];
      if (typeof colVal === 'boolean') {
        val = colVal ? 'x' : '';
      } else if (typeof colVal === 'string' || typeof colVal === 'number') {
        val = colVal.toString();
      } else {
        val = 'flameString: ' + typeof colVal + ' not supported yet';
      }
      break;
  }

  if (col === 'Label' && opt.depth !== undefined) {
    val = '  '.repeat(opt.depth - 1) + val;
  }

  return val;
}
