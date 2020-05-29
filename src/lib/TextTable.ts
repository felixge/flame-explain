import {FlameNode} from './FlameExplain';
import {formatDuration, formatPercent} from './Util';
// @ts-ignore no type definitions
import AsciiTable from 'ascii-table';
import format from '../ui/Format';

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
  longBool?: boolean;
};

export function columnText(fn: FlameNode, col: Column, opt: flameStringOptions = {}): string {
  if (fn[col] === undefined) {
    return '';
  }

  let val = '';
  switch (col) {
    case 'Shared Hit Blocks':
    case 'Shared Read Blocks':
    case 'Shared Dirtied Blocks':
    case 'Shared Written Blocks':
    case 'Local Hit Blocks':
    case 'Local Read Blocks':
    case 'Local Dirtied Blocks':
    case 'Local Written Blocks':
    case 'Temp Read Blocks':
    case 'Temp Written Blocks':
    case 'Total Blocks':
    case 'Self Blocks':
      val = format(fn[col] || 0, 'page');
      break;
    case 'Rows X':
      val = (fn[col] as number).toFixed(2);
      break;
    case 'Self Time %':
    case 'Total Time %':
      val = formatPercent(fn[col] || 0);
      break;
    case 'Actual Total Time':
    case 'Actual Startup Time':
    case 'Total Time':
    case 'Self Time':
    case 'Execution Time':
    case 'Planning Time':
    case 'I/O Read Time':
    case 'I/O Write Time':
      val = formatDuration(fn[col] as number);
      break;
    default:
      let colVal = fn[col];
      if (typeof colVal === 'boolean') {
        if (opt.longBool) {
          val = colVal + '';
        } else {
          val = colVal ? 'x' : '';
        }
      } else if (typeof colVal === 'string' || typeof colVal === 'number') {
        val = colVal.toString();
      } else if (Array.isArray(colVal)) {
        val = colVal.join(', ');
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
