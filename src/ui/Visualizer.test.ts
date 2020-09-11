import {normalizePlan} from './Util';

describe('normalizePlan', () => {
  test('remove header, footer and trailing plus symbol from psql plan', () => {
    expect(
      normalizePlan(
        '$ psql psql (11.6)Type"help"for help.postgres=# EXPLAIN(ANALYZE,FORMAT JSON,VERBOSE,BUFFERS)SELECT1;QUERY PLAN-------------------------------------[+{+"Plan":{+"Node Type": "Result",+"Parallel Aware": false,+"Startup Cost": 0.00,+"Total Cost": 0.01,+"Plan Rows": 1,+"Plan Width":4,+"Actual Startup Time": 0.004,+"Actual Total Time": 0.005,+"Actual Rows": 1,+"Actual Loops": 1,+"Output": ["1"],+"Shared Hit Blocks": 0,+"Shared Read Blocks": 0,+"Shared Dirtied Blocks": 0,+"Shared Written Blocks": 0,+"Local Hit Blocks": 0,+"Local Read Blocks": 0,+"Local Dirtied Blocks": 0,+"Local Written Blocks": 0,+"Temp Read Blocks": 0,+"Temp Written Blocks": 0+},+"Planning Time": 0.168,+"Triggers":[+],+"Execution Time": 0.082+}+](1 row)'
      )
    ).toEqual(
      '[{"Plan":{"Node Type": "Result","Parallel Aware": false,"Startup Cost": 0.00,"Total Cost": 0.01,"Plan Rows": 1,"Plan Width":4,"Actual Startup Time": 0.004,"Actual Total Time": 0.005,"Actual Rows": 1,"Actual Loops": 1,"Output": ["1"],"Shared Hit Blocks": 0,"Shared Read Blocks": 0,"Shared Dirtied Blocks": 0,"Shared Written Blocks": 0,"Local Hit Blocks": 0,"Local Read Blocks": 0,"Local Dirtied Blocks": 0,"Local Written Blocks": 0,"Temp Read Blocks": 0,"Temp Written Blocks": 0},"Planning Time": 0.168,"Triggers":[],"Execution Time": 0.082}]'
    );
  });
  test('incomplete psql plan', () => {
    expect(
      normalizePlan(
        '[+{+"Plan":{+"Node Type": "Result",+"Parallel Aware": false,+"Startup Cost": 0.00,+"Total Cost": 0.01,+"Plan Rows": 1,+"Plan Width":4,+"Actual Startup Time": 0.004,+"Actual Total Time": 0.005,+"Actual Rows": 1,+"Actual Loops": 1,+"Output": ["1"],+"Shared Hit Blocks":'
      )
    ).toEqual(
      '[{"Plan":{"Node Type": "Result","Parallel Aware": false,"Startup Cost": 0.00,"Total Cost": 0.01,"Plan Rows": 1,"Plan Width":4,"Actual Startup Time": 0.004,"Actual Total Time": 0.005,"Actual Rows": 1,"Actual Loops": 1,"Output": ["1"]'
    );
  });
  test('remove all plus symbols', () => {
    expect(normalizePlan('+++')).toEqual('');
  });
  test('crop symbols between the first opening bracket [ and the last closing bracket ]', () => {
    expect(normalizePlan('x[[x]]]x')).toEqual('[[x]]]');
  });
});
