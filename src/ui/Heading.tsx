import React from 'react';
import {faAnchor} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

type Props = {
  level: number;
  anchor?: string;
  children: React.ReactNode;
};

export default function Heading(p: Props) {
  const Tag = `h${p.level}` as keyof JSX.IntrinsicElements;
  let classes = ['title heading-anchor'];
  const anchor = p.anchor || (p.children + '');
  classes.push('is-' + (p.level + 2))
  return <Tag id={anchor} className={classes.join(' ')}>
    <a href={"#" + anchor} aria-hidden={true}>
      <FontAwesomeIcon icon={faAnchor} />
    </a>
    {p.children}
  </Tag>;
};
