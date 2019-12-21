// TODO(fg) it'd be nice to export all our plans without so much boilerplate,
// but I haven't been able to make it work with the build system for now : /.
import {Queries} from '../RawExplain';
import CTESimple from './CTESimple';
import CTESleepUnion from './CTESleepUnion';
import PGIndexes from './PGIndexes';
import RewriteTwoQueries from './RewriteTwoQueries';

export type ExamplePlan = {
  description: string,
  queries: Queries,
};

const Plans: {[key: string]: ExamplePlan} = {
  CTESimple,
  CTESleepUnion,
  PGIndexes,
  RewriteTwoQueries,
}

export default Plans;
