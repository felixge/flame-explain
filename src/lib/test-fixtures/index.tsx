// TODO(fg) it'd be nice to export all our plans without so much boilerplate,
// but I haven't been able to make it work with the build system for now : /.

import CTESimple from './CTESimple';
import CTESleepUnion from './CTESleepUnion';
import PGIndexes from './PGIndexes';
import RewriteTwoQueries from './RewriteTwoQueries';

export default {
  CTESimple,
  CTESleepUnion,
  PGIndexes,
  RewriteTwoQueries
};
