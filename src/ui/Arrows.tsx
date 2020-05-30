import React from 'react';
import {faCaretSquareLeft, faCaretSquareRight, faCaretSquareUp, faCaretSquareDown} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

export type Direction = 'left' | 'right' | 'up' | 'down';

type Props = {
  arrows: Direction[];
  onClick: (a: Direction) => void;
}

const icons: {[K in Direction]: typeof faCaretSquareUp} = {
  left: faCaretSquareLeft,
  right: faCaretSquareRight,
  up: faCaretSquareUp,
  down: faCaretSquareDown,
};

export function Arrows(p: Props) {
  return <span className="arrows">
    {p.arrows.map(direction =>
      <FontAwesomeIcon
        key={direction}
        onClick={() => p.onClick(direction)}
        icon={icons[direction]}
      />
    )}
  </span>
}

export function move<T>(list: T[], i: number, d: Direction): T[] {
  let delta = 0;
  switch (d) {
    case 'up':
    case 'left':
      delta = -1;
      break;
    case 'down':
    case 'right':
      delta = 1
      break;
  }

  let j = i + delta;
  j = Math.min(Math.max(j, 0), list.length - 1);
  let newList = [...list];
  [newList[i], newList[j]] = [newList[j], newList[i]];
  return newList;
}
