import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCopy, faPaste} from '@fortawesome/free-solid-svg-icons';
import {VisualizerState} from './Visualizer';
import Clipboard from 'react-clipboard.js';
import * as clipboard from 'clipboard-polyfill';
import {
  faGithub
} from '@fortawesome/free-brands-svg-icons';
import {
  faFileCode,
  //faFileArchive,
  faShareAlt,
} from '@fortawesome/free-solid-svg-icons';

export type SharingState = {
  tab: 'json' | 'gist',
};

type Props = {
  visible: boolean;
  state: VisualizerState;
  onChange: (s: SharingState) => void;
  onClose: () => void;
};

type ShareJSON = {
  flameExplain: string,
} & Pick<VisualizerState, 'favorites' | 'input' | 'collapsed'>;

export default function VisualizerShare(p: Props) {
  const {tab} = p.state.share;
  const [gistUrl, setGistUrl] = React.useState('');
  const gistUrlInput = React.useRef<HTMLInputElement>(null);

  let flameURL = '';
  const m = gistUrl.match(/\/([^/]+)$/);
  if (m) {
    flameURL = window.location.origin + window.location.pathname + '?gist=' + m[1];
  }

  const setTab = (tab: SharingState["tab"]) => {
    p.onChange({...p.state.share, ...{tab}})
  }

  function pasteGistURL() {
    if (gistUrlInput.current) {
      clipboard.readText().then((text) => {
        setGistUrl(text);
      }, () => {});
      gistUrlInput.current.focus();
    }
  }

  if (!p.visible) {
    return null;
  }

  const shareText = stateToShareText(p.state);
  const shareElements = <React.Fragment>
    <code>Query Plan</code>, <code>SQL</code> and <code>Settings</code>
  </React.Fragment>;

  let tabElement: JSX.Element;
  switch (tab) {
    case 'json':
      tabElement = <React.Fragment>
        <p>
          FlameExplain runs in your browser and never sends your data to another computer.
        </p>
        <p>However, you can copy the JSON below and share it via any channel you trust. The JSON contains your
          current {shareElements} and can be pasted into the Input tab as if it was a regular JSON plan.
        </p>
        <p>
        </p>
        <div className="field">
          <Clipboard className="button is-info is-fullwidth" data-clipboard-text={shareText}>
            <span className="icon is-small">
              <FontAwesomeIcon icon={faCopy} />
            </span>
            <span>Click to Copy</span>
          </Clipboard>
        </div>
        <textarea rows={8} className="textarea is-info" value={shareText} readOnly></textarea>
      </React.Fragment>;
      break
    case 'gist':
      tabElement = <React.Fragment>
        <div className="content">
          <p>
            If you want to share your current {shareElements} as a URL link and
            trust GitHub with it, then&nbsp; <Clipboard component="a"
              button-href="#" data-clipboard-text={shareText}>
              <span className="icon is-small">
                <FontAwesomeIcon icon={faCopy} />
              </span>
              <span>&nbsp;Copy the Raw JSON</span>
            </Clipboard>
            &nbsp;paste it into a <a href="https://gist.github.com/" target="_new">GitHub Gist</a>.
          </p>
          <p>You can then paste the Gist URL below to get a Flame Explain URL you can share.</p>
        </div>

        <div className="columns">
          <div className="column is-one-third">
            <button onClick={pasteGistURL} className="button is-info has-text-left" style={{width: '100%'}}>
              <span className="icon is-small">
                <FontAwesomeIcon icon={faPaste} />
              </span>
              <span>Paste Gist URL</span>
            </button>
          </div>
          <div className="column is-expanded">
            <input
              ref={gistUrlInput}
              value={gistUrl}
              onChange={e => setGistUrl(e.target.value)}
              className="input"
              type="text"
            />
          </div>
        </div>

        <div className="columns">
          <div className="column is-one-third">
            <Clipboard
              data-clipboard-text={flameURL}
              className="button is-info has-text-left"
              style={{width: '100%'}}
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon={faCopy} />
              </span>
              <span>Copy FlameExplain URL</span>
            </Clipboard>
          </div>
          <div className="column is-expanded">
            <input
              ref={gistUrlInput}
              value={flameURL}
              readOnly
              className="input"
              type="text"
            />
          </div>
        </div>
      </React.Fragment >;
      break;
  }

  return <div className="modal is-active">
    <div className="modal-background" onClick={p.onClose}></div>
    <div className="modal-card" style={{width: '90%', maxWidth: '870px'}}>
      <header className="modal-card-head">
        <span className="icon">
          <FontAwesomeIcon icon={faShareAlt} />
        </span>
        <p className="modal-card-title">Share</p>
        <button className="delete" aria-label="close" onClick={p.onClose}></button>
      </header>
      <section className="modal-card-body">
        <div className="tabs is-toggle is-fullwidth">
          <ul>
            <li className={tab === 'json' ? 'is-active' : ''}>
              <a href="#json" onClick={e => {e.preventDefault(); setTab('json')}}>
                <span className="icon is-small">
                  <FontAwesomeIcon icon={faFileCode} />
                </span>
                <span>Raw JSON</span>
              </a>
            </li>
            <li className={tab === 'gist' ? 'is-active' : ''}>
              <a href="#gist" onClick={e => {e.preventDefault(); setTab('gist')}}>
                <span className="icon is-small">
                  <FontAwesomeIcon icon={faGithub} />
                </span>
                <span>GitHub Gist</span>
              </a>
            </li>
            {
              // Might be a nice feature to implement ...
              //<li>
              //<a>
              //<span className="icon is-small">
              //<FontAwesomeIcon icon={faFileArchive} />
              //</span>
              //<span>Standalone ZIP</span>
              //</a>
              //</li>
            }
          </ul>
        </div>
        <div className="content">{tabElement}</div>
      </section>
    </div>
  </div>;
};

function stateToShareText(s: VisualizerState): string {
  const flameExplain = 'Go to flame-explain.com and paste this JSON in the Input tab.';
  const {input, favorites, collapsed} = s;
  const shareJSON: ShareJSON = {flameExplain, input, favorites, collapsed};
  return JSON.stringify(shareJSON, null, '  ');
}
