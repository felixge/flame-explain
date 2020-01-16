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
      const vals = columns.map(c => flameString(fn, c, {depth}));
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

function flameString(fn: FlameNode, col: Column, opt: flameStringOptions): string {
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

//type extractOptions = {
  //rowNum?: number,
  //depth?: number,
//};

//export function toRow(n: FNode, o?: extractOptions): Row {
  //return {
    //'#': o?.rowNum?.toString() || '',
    //'Actual Loops': ('Actual Loops' in n.Source)
      //? n.Source["Actual Loops"].toString()
      //: '',
    //'Actual Rows': ('Actual Rows' in n.Source)
      //? n.Source["Actual Rows"].toString()
      //: '',
    //'Actual Total Time': ('Actual Total Time' in n.Source)
      //? formatDuration(n.Source["Actual Total Time"])
      //: '',
    //'Label': '  '.repeat(o?.depth || 0) + n.Label,
    //'Node Type': ('Node Type' in n.Source)
      //? n.Source["Node Type"]
      //: '',
    //'Self Time': ('Self Time' in n)
      //? formatDuration(n["Self Time"])
      //: '',
    //'Source': n,
    //'Total Time': ('Total Time' in n)
      //? formatDuration(n["Total Time"])
      //: '',
    //'Virtual': (n.Virtual)
      //? 'x'
      //: '',
  //};
//}

//type path = '*' | '**' | string;

//export function queryAll(n: FNode, ...path: path[]): Row[] {
  //const rows: Row[] = [];
  //const visit = (n: FNode, path: string[]) => {
    //if (path.length === 0) {
      //return;
    //}

    //if (path[0] === n.Label || path[0] === '*') {
      //path = path.slice(1);
    //} else if (path[0] === '**' && path[1] === n.Label) {
      //path = path.slice(2);
    //} else if (path[0] === '**') {
    //} else {
      //return;
    //}

    //if (path.length === 0) {
      //rows.push(toRow(n));
      //return;
    //}

    //(n.Children || []).forEach(child => visit(child, path));
  //};
  //(n.Children || []).forEach(child => visit(child, path))

  //return rows;
//};

//export function queryFirst(n: FNode, ...path: string[]): Row {
  //return queryAll(n, ...path)[0];
//};
