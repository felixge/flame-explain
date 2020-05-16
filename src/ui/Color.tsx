import React from 'react';
import {interpolateReds} from 'd3-scale-chromatic';
import {default as invert, RgbArray} from 'invert-color';

export function ColorScale(p: {n?: number}) {
  const n = p.n || 200;
  const children = Array(...Array(n)).map((_, i) => {
    const flex = '1 1';
    const {backgroundColor} = colorPair(i / n);
    return <div key={i} style={{flex, backgroundColor}} />
  });
  return <div style={{display: 'flex', flexWrap: 'nowrap', height: '20px', clear: 'both'}}>
    {children}
  </div>
}

// colorPair returns a high contrast foreground and background color pair for
// the given t in the range [0, 1].
export function colorPair(t: number) {
  const backgroundColor = interpolateReds(t);
  const bgArray = backgroundColor
    .split("(")[1]
    .split(")")[0]
    .split(/ *, */).map(s => parseInt(s, 10)) as RgbArray;
  const color = invert(bgArray, true);
  return {color, backgroundColor};
}
