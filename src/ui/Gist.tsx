import React from 'react';
import fetchJSONP from 'fetch-jsonp';

const cacheDuration = 180 * 1000;

// debugDelay can be increased e.g. 5000 to simulate 5s loading time, it's only
// meant for debugging.
const debugDelay = 0;

type gistHookState = null | 'loading' | Result;

export const useGist = (id: string | null): gistHookState => {
  const [gist, setGist] = React.useState<gistHookState>((id === null)
    ? null
    : 'loading'
  );

  React.useEffect(() => {
    if (id === null) {
      setGist(null);
      return;
    }

    const p = loadFromCacheOrGithub(id);
    p
      .then(async (cacheEntry) => {
        await new Promise(resolve => setTimeout(resolve, debugDelay));
        return cacheEntry;
      })
      .then(cacheEntry => {
        let result: Result = {
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
      .then(setGist)
      .catch((e: Error) => {
        setGist({error: e})
      });

  }, [id]);
  return gist;
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

export function Gist(id: string | null): [string | undefined, JSX.Element[]] {
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
    planText = '[]';
  } else if (gist) {
    let cacheNotice = '';
    if (gist.expires) {
      const remain = ((gist.expires - Date.now()) / 1000).toFixed(0);
      cacheNotice = ` To avoid API rate limiting, this response will remain ` +
        `cached for ${remain} second(s).`;
    }

    if (gist.error) {
      planText = '[]';
      notices.push(<div key="gist-error" className="notification is-danger">
        Failed to load Gist {gistLink} from GitHub: {gist.error.message + '.'}
        {cacheNotice}
      </div>);
    } else if (!hideNotice) {
      notices.push(<div key="gist-info" className="notification is-success">
        Showing Gist {gistLink} from GitHub.{cacheNotice}
        <button onClick={() => setHideNotice(true)} className="delete"></button>
      </div>);
    }
  }
  return [planText, notices];
}
