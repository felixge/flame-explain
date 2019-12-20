import React from 'react';
import ReactDOM from 'react-dom';
import App from './ui/App';
import * as serviceWorker from './ui/serviceWorker';
import plan from './lib/test-fixtures/CTESleepUnion';

ReactDOM.render(<App
  planText={JSON.stringify(plan, null, 2)}
/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
