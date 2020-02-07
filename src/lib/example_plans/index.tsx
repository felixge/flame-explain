// TODO(fg) it'd be nice to export all our plans without so much boilerplate,
// but I haven't been able to make it work with the build system for now : /.
import {RawQueries} from '../RawExplain';

import CTESimple from './CTESimple';
import CTESleepUnion from './CTESleepUnion';
import NestedLoop from './NestedLoop';
import PGIndexes from './PGIndexes';
import ParallelAppend from './ParallelAppend';
import ParallelAppendCount from './ParallelAppendCount';
import ParallelCount from './ParallelCount';
import ParallelCountAppend from './ParallelCountAppend';
import RewriteTwoQueries from './RewriteTwoQueries';

export type ExamplePlan = {
  queries: RawQueries,
  sql: string,
};

const Plans: {[key: string]: ExamplePlan} = {
  CTESimple,
  CTESleepUnion,
  NestedLoop,
  PGIndexes,
  ParallelAppend,
  ParallelAppendCount,
  ParallelCount,
  ParallelCountAppend,
  RewriteTwoQueries,
};

for (const plan of Object.values(Plans)) {
  plan.sql = (plan.sql || '').trim();
}

export default Plans;
