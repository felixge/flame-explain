import {fromRawQueries} from './FlameExplain'
import {textTable, Column} from './TextTable';
import examplePlans from './example_plans';

describe('transformQueries', () => {
  describe('time accounting snapshots are matching', () => {
    for (let name in examplePlans) {
      test(name, () => {
        const root = fromRawQueries(examplePlans[name].queries, {
          VirtualQueryNodes: true,
          VirtualField: true,
        });
        const columns: Column[] = [
          'ID',
          'Label',
          'Actual Total Time',
          'Actual Loops',
          'Total Time',
          'Self Time',
          'Virtual',
        ];
        const table = textTable(root, {title: name, columns: columns});
        expect(table).toMatchSnapshot();
      });
    }
  });
});
