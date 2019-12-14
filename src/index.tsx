import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
//import plan from './lib/test-fixtures/PGIndexes';
import plan from './lib/test-fixtures/CTESleepUnion';
//import plan from './lib/test-fixtures/CTESimple';
//import plan from './lib/test-fixtures/PGIndexes';

ReactDOM.render(<App
  planText={JSON.stringify(plan)}
/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
