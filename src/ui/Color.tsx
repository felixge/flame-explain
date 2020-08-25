import React from 'react';
import { schemeReds, schemeBlues } from 'd3-scale-chromatic';
import { scaleLinear } from 'd3-scale';
import { ticks } from 'd3-array';
import { default as invert, RgbArray } from 'invert-color';

type Props = {
  n?: number;
};

export function ColorScale(p: Props) {
  const colors = ticks(-1, 1, p.n || 1000);
  const children = colors.map((color, i) => {
    const flex = '1 1';
    const { backgroundColor } = colorPair(color);
    return <div key={i} style={{ flex, backgroundColor }} />;
  });
  return <div style={{ display: 'flex', flexWrap: 'nowrap', height: '20px', clear: 'both' }}>{children}</div>;
}

// colorPair returns a high contrast foreground and background color pair for
// the given t in the range [-1, 1].
export function colorPair(t: number) {
  const blues = new Array(...schemeBlues[9]).reverse();
  const reds = new Array(...schemeReds[9]);
  const colors = blues.concat(reds);
  const domain = Array(...Array(colors.length)).map((_, i) => (i / (colors.length - 1)) * 2 - 1);

  // @ts-expect-error (bug in d3-scale ts definitions)
  const conv = scaleLinear().domain(domain).range(colors);
  const backgroundColor = String(conv(t));

  const bgArray = backgroundColor
    .split('(')[1]
    .split(')')[0]
    .split(/ *, */)
    .map(s => parseInt(s, 10)) as RgbArray;
  const color = invert(bgArray, true);
  return { color, backgroundColor };
}
