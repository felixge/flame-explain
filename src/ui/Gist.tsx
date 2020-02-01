import React from 'react';
import fetchJSONP from 'fetch-jsonp';

const cacheDuration = 180 * 1000;

export const loadGist = (id: string | null) => {
  const p = new Promise<Gist>((resolve, reject) => {
    React.useEffect(() => {
      if (!id) {
        return resolve(null);
      }

      const p = loadFromCacheOrGithub(id);
      p
        .then(res => {
          let cacheEntry: cacheEntry | null = null;
          if ('cached' in res) {
            cacheEntry = res;
            res = res.cached;
          }

          if (res.meta?.status === 404) {
            throw new Error(`gist ${id} does not exist on github.com`)
          }

          const files = Object.values(res.data?.files || {});
          for (const val of files) {
            const text = (val as any).content as string;
            const gist: Gist = {
              planText: text,
              expires: cacheEntry?.expires,
            };
            return gist;
          }
          throw new Error('bad gist, could not find JSON plan in it');
        })
        .then(resolve)
        .catch(reject);
    }, [id]);
  });
  return p;
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
    cached: ghRes,
  }
  localStorage.setItem(cacheKey, JSON.stringify(entry));
  return ghRes;
}

type Gist = {
  planText: string;
  expires?: number;
} | null;


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
  cached: githubResponse;
};
