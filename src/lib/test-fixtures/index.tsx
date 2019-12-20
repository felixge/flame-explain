import {readdirSync} from 'fs';
import {basename} from 'path';
import {Queries} from '../RawExplain';

const fixtures: {[k: string]: Queries} = {};
const ext = '.tsx';

readdirSync(__dirname)
  .filter(path => path.endsWith(ext) && path !== basename(__filename))
  .forEach(path => {
    const data = require('./' + path);
    const name = basename(path, ext);
    fixtures[name] = data.default;
  });

export default fixtures;
