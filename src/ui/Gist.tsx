import React from 'react';
import fetchJSONP from 'fetch-jsonp';
import {setCancelable} from './Util';

const cacheDuration = 180 * 1000;

// debugDelay can be increased e.g. 5000 to simulate 5s loading time, it's only
// meant for debugging.
const debugDelay = 1000;

export const useGist = (id: string): null | 'loading' | Result => {
  const [gist, setGist] = React.useState<{[id: string]: Result}>({});

  React.useEffect(() => {
    if (!id) {
      return;
    }

    const [setGistUnlessCanceled, cancel] = setCancelable((r: Result) => {
      return setGist({[id]: r});
    });

    const p = loadFromCacheOrGithub(id);
    p
      .then(async (cacheEntry) => {
        await new Promise(resolve => setTimeout(resolve, debugDelay));
        return cacheEntry;
      })
      .then(cacheEntry => {
        let result: Result = {
          id: id,
          expires: cacheEntry.expires,
        };
        const res = cacheEntry.response;

        if (res.meta?.status === 404) {
          result.error = new Error(`404 Not Found`);
          return result;
        }

        const files = Object.values(res.data?.files || {});
        for (const val of files) {
          const text = (val as any).content as string;
          result.planText = text;
          return result;
        }
        result.error = new Error('No JSON plan was found in the gist.');
        return result;
      })
      .then(result => setGistUnlessCanceled(result))
      .catch(e => setGistUnlessCanceled({id: id, error: e}));
    return cancel;
  }, [id]);

  return !id
    ? null
    : gist[id] || 'loading';
};

const loadFromCacheOrGithub = async (id: string) => {
  const cacheKey = 'gist:' + id;
  const cacheValue = localStorage.getItem(cacheKey);
  if (cacheValue) {
    let cacheEntry: cacheEntry;
    try {
      cacheEntry = JSON.parse(cacheValue) as cacheEntry;
      if (Date.now() < cacheEntry.expires) {
        return Promise.resolve(cacheEntry);
      }
    } catch (e) {}
  }

  const res = await fetchJSONP('https://api.github.com/gists/' + id);
  const ghRes: githubResponse = await res.json();
  const entry: cacheEntry = {
    expires: Date.now() + cacheDuration,
    response: ghRes,
  }
  localStorage.setItem(cacheKey, JSON.stringify(entry));
  return entry;
}

type Result = {
  id: string;
  planText?: string;
  expires?: number;
  error?: Error;
};


type githubResponse = {
  meta?: {
    status?: number;
  },
  data?: {
    files?: Array<{
      content?: string;
    }>
  }
};

type cacheEntry = {
  expires: number;
  response: githubResponse;
};

export function Gist(id: string): [string | undefined, JSX.Element[]] {
  const gist = useGist(id);
  const [hideNotice, setHideNotice] = React.useState(false);

  let planText: string | undefined = undefined;
  let notices: JSX.Element[] = [];

  const gistLink = <a href={'https://gist.github.com/' + id}>{id}</a>;

  if (gist === 'loading') {
    notices.push(
      <progress key="gist-loading" className="progress is-warning" max="100">
      </progress>
    );
  } else if (gist) {
    let cacheNotice = '';
    if (gist.expires) {
      const remain = ((gist.expires - Date.now()) / 1000).toFixed(0);
      cacheNotice = ` To avoid API rate limiting, this response will remain ` +
        `cached for ${remain} second(s).`;
    }

    if (gist.error) {
      notices.push(<div key="gist-error" className="notification is-danger">
        Failed to load Gist {gistLink} from GitHub: {gist.error.message + '.'}
        {cacheNotice}
      </div>);
    } else if (!hideNotice) {
      planText = gist.planText;
      notices.push(<div key="gist-info" className="notification is-success">
        Showing Gist {gistLink} from GitHub.{cacheNotice}
        <button onClick={() => setHideNotice(true)} className="delete"></button>
      </div>);
    }
  }
  return [planText, notices];
}

type Props = {
  gist: ReturnType<typeof useGist>,
};

export function GistNotice(p: Props) {
  const [hideNotice, setHideNotice] = React.useState(false);

  const {gist} = p;
  if (gist === null) {
    return;
  }

  if (gist === 'loading') {
    return (
      <progress key="gist-loading" className="progress is-warning" max="100">
      </progress>
    );
  }

  const gistLink = <a href={'https://gist.github.com/' + gist.id}>{gist.id}</a>;
  let cacheNotice = '';
  if (gist.expires) {
    const remain = ((gist.expires - Date.now()) / 1000).toFixed(0);
    cacheNotice = ` To avoid API rate limiting, this response will remain ` +
      `cached for ${remain} second(s).`;
  }

  if (gist.error) {
    return <div key="gist-error" className="notification is-danger">
      Failed to load Gist {gistLink} from GitHub: {gist.error.message + '.'}
      {cacheNotice}
    </div>;
  }

  if (!hideNotice) {
    return <div key="gist-info" className="notification is-success">
      Showing Gist {gistLink} from GitHub.{cacheNotice}
      <button onClick={() => setHideNotice(true)} className="delete"></button>
    </div>;
  }
}
