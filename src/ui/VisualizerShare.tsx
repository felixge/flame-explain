import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCopy, faPaste} from '@fortawesome/free-solid-svg-icons';
import Clipboard from 'react-clipboard.js';
import * as clipboard from 'clipboard-polyfill';

type Props = {
  visible: boolean;
  planText?: string;
};

export default function VisualizerShare(p: Props) {
  const [url, setUrl] = React.useState('https://gist.github.com/felixge/0f1e4ad31c47fe38662c50fb7e7f11d5');
  const gistUrlInput = React.useRef<HTMLInputElement>(null);

  let flameURL = '';
  const m = url.match(/[^/]+$/);
  if (m) {
    flameURL = window.location.origin + '/visualize/treetable?gist=' + m[0];
  }

  function pasteGistURL() {
    if (gistUrlInput.current) {
      clipboard.readText().then((text) => {
        setUrl(text);
      }, console.error);
      //console.log('paste');
      gistUrlInput.current.focus();
      //document.execCommand("paste");
    }
  }

  if (!p.visible) {
    return null;
  }

  return <div className="modal is-active">
    <div className="modal-background"></div>
    <div className="modal-card">
      <header className="modal-card-head">
        <p className="modal-card-title">Share</p>
        <button className="delete" aria-label="close"></button>
      </header>
      <section className="modal-card-body">
        <div className="content">
          <p>
            FlameExplain runs exclusively in your browser and never sends your plan
            information to another server.
    </p>
          <p>
            However, you can share your plans as URL via GitHub Gists by following
            the steps below:
    </p>

          <p>
            <Clipboard className="button is-info" data-clipboard-text={p.planText}>
              <span>1. Copy JSON Plan</span>
              <span className="icon is-small">
                <FontAwesomeIcon icon={faCopy} />
              </span>
            </Clipboard>
          </p>
          <p>
            <a href="https://gist.github.com/" target="_new" className="button is-info">
              <span>2. Create Gist and Copy URL</span>
              <span className="icon is-small">
                <FontAwesomeIcon icon={faPaste} />
              </span>
            </a>
          </p>

          <div className="field has-addons">
            <div className="control">
              <button onClick={pasteGistURL} className="button is-info">
                <span>3. Paste Gist URL</span>
                <span className="icon is-small">
                  <FontAwesomeIcon icon={faCopy} />
                </span>
              </button>
            </div>
            <div className="control is-expanded">
              <input
                ref={gistUrlInput}
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="input"
                type="text"
              />
            </div>
          </div>

          <div className="field has-addons">
            <div className="control">
              <Clipboard className="button is-info" data-clipboard-text={flameURL}>
                <span>4. Copy FlameExplain URL</span>
                <span className="icon is-small">
                  <FontAwesomeIcon icon={faCopy} />
                </span>
              </Clipboard>
            </div>
            <div className="control is-expanded">
              <input className="input" type="text" readOnly value={flameURL} />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>;
};
