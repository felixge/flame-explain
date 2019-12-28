// TODO(fg) it'd be nice to export all our plans without so much boilerplate,
// but I haven't been able to make it work with the build system for now : /.
import {Queries} from '../RawExplain';

import CTESimple from './CTESimple';
import CTESleepUnion from './CTESleepUnion';
import NestedLoop from './NestedLoop';
import PGIndexes from './PGIndexes';
import ParallelCount from './ParallelCount';
import ParallelCountAppend from './ParallelCountAppend';
import RewriteTwoQueries from './RewriteTwoQueries';

export type ExamplePlan = {
  description: string,
  queries: Queries,
};

const Plans: {[key: string]: ExamplePlan} = {
  CTESimple,
  CTESleepUnion,
  NestedLoop,
  PGIndexes,
  ParallelCount,
  ParallelCountAppend,
  RewriteTwoQueries,
}

export default Plans;
