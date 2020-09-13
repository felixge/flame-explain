import React from 'react';
import Heading from './Heading';

// Set this to true to debug this component by simulating bad data in
// localStorage.
const debug = false;

let debugError = (() => {
  if (debug && localStorage.length) {
    return new Error('test');
  }
})();

export default class ErrorBoundary extends React.Component {
  state: {
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
  } = {
    error: debugError || null,
    errorInfo: null,
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  onClearClick() {
    localStorage.clear();
    this.setState({error: null});
  }

  render() {
    if (this.state.error) {
      return (
        <section className="section content">
          <div className="container">
            <div className="notification is-danger">
              <Heading level={1}>Error</Heading>
              <p>An internal error occured. You might be able to fix this issue by pressing the button below.</p>
              <p>
                <button onClick={() => this.onClearClick()} className="button is-warning">
                  Reset Data & Settings
                </button>
              </p>
              <p>
                Please also{' '}
                <a href="https://github.com/felixge/flame-explain/issues/new" target="_new">
                  report a bug
                </a>
                , including the details below:
              </p>
              <pre>
                {this.state.errorInfo
                  ? this.state.error.toString() + this.state.errorInfo.componentStack
                  : this.state.error.stack}
              </pre>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
