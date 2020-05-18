import React from 'react';
import {FlameNode, FlameKey, flameKeyMeta} from '../lib/FlameExplain';
import {Category, categories, categoryKeys} from '../lib/FlameDocs';
import {columnText} from '../lib/TextTable';

export type InspectorCategory = Category | 'All';

type Props = {
  visible: boolean;
  node?: FlameNode;
  onClose: () => void;
  onClickCategory: (c: InspectorCategory) => void;
  onClickNode: (fn: FlameNode) => void;
  category: InspectorCategory,
};

export default function Inspector(p: Props) {
  if (!p.visible || !p.node) {
    return null;
  }

  const fn = p.node;
  const sections = nodeSections(p.node).map(section => {
    if (p.category !== 'All' && section.Category !== p.category) {
      return null;
    }

    const rows = section.Keys.map(key => {
      const meta = flameKeyMeta[key];
      const source = (meta?.Source === 'FlameExplain')
        ? '🔥'
        : '🐘';

      return <tr key={key}>
        <td>{source} {key}</td>
        <td>{inspectorValue(fn, key, p.onClickNode)}</td>
      </tr>;
    });

    return <React.Fragment key={section.Category}>
      <tr>
        <th colSpan={2}>{section.Category}</th>
      </tr>
      {rows}
    </React.Fragment>
  });

  return <nav className="panel inspector">
    <div className="panel-heading">
      <span>#{fn.ID} {fn.Label}</span>
      <button className="delete" aria-label="close" onClick={p.onClose}></button>
    </div>
    <div className="panel-tabs">
      {
        ['All'].concat(categories).map(category => {
          return <a
            key={category}
            href="# "
            className={p.category === category ? 'is-active' : ''}
            onClick={() => p.onClickCategory(category as InspectorCategory)}
          >
            {category}
          </a>
        })
      }
    </div>
    <div className="panel-block">
      <div>
        <table className="table is-narrow">
          <tbody>
            {sections}
          </tbody>
        </table>
      </div>
    </div>
  </nav>;
};

type Sections = Section[];

type Section = {
  Category: Category,
  Keys: FlameKey[],
};

function nodeSections(fn: FlameNode): Sections {
  const assigned: {[K in FlameKey]?: boolean} = {};
  let misc: Section | undefined;
  const sections: Sections = categories.map(category => {
    let section: Section = {Category: category, Keys: []};
    if (category === 'Misc') {
      return misc = section;
    }

    categoryKeys[category].forEach(key => {
      if (key in fn) {
        section.Keys.push(key);
        assigned[key] = true;
      }
    });
    return section;
  });

  let key: FlameKey;
  for (key in fn) {
    if (!assigned[key] && misc && key !== 'Colors') {
      misc.Keys.push(key);
    }
  }

  return sections;
}

function inspectorValue(fn: FlameNode, key: keyof FlameNode, onClick: (fn: FlameNode) => void): JSX.Element {
  const val = fn[key];
  if (isFlameNode(val)) {
    if (val.Kind === 'Root') {
      return <React.Fragment>-</React.Fragment>;
    } else {
      return nodeLink(val, onClick);
    }
  } else if (isFlameNodes(val) && val.length > 0) {
    var elements: JSX.Element[] = [];
    val.forEach((child, i) => {
      elements.push(<React.Fragment key={child.ID} >
        {nodeLink(child, onClick)}{i + 1 === val.length ? '' : ', '}
      </React.Fragment>);
    });
    return <React.Fragment>{elements}</React.Fragment>;
  }

  const textVal = columnText(fn, key, {longBool: true});
  return <React.Fragment>{textVal}</React.Fragment>;
}

function isFlameNodes(val: FlameNode[keyof FlameNode]): val is FlameNode[] {
  return Array.isArray(val) && val.length > 0 && isFlameNode(val[0]);
}

function isFlameNode(val: FlameNode[keyof FlameNode]): val is FlameNode {
  return typeof val === 'object' && 'Kind' in val;
}

function nodeLink(fn: FlameNode, onClick: (fn: FlameNode) => void) {
  return <a href={'#' + fn.ID} onClick={(e) => {e.preventDefault(); onClick(fn)}}>#{fn.ID}</a>;
}
