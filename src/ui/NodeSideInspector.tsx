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
  category: InspectorCategory,
};

export default function NodeSideInspector(p: Props) {
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

      return <tr>
        <td>{source} {key}</td>
        <td>{columnText(fn, key)}</td>
      </tr>;
    });

    return <React.Fragment>
      <tr>
        <th colSpan={2}>{section.Category}</th>
      </tr>
      {rows}
    </React.Fragment>
  });

  return <nav className="panel inspector">
    <p className="panel-heading">
      <span>#{fn.ID} - {fn.Label}</span>
      <button className="delete" aria-label="close" onClick={p.onClose}></button>
    </p>
    <p className="panel-tabs">
      {
        ['All'].concat(categories).map(category => {
          return <a
            href="# "
            className={p.category === category ? 'is-active' : ''}
            onClick={() => p.onClickCategory(category as InspectorCategory)}
          >
            {category}
          </a>
        })
      }
    </p>
    <p className="panel-block">
      <div>
        <table className="table is-narrow">
          <tbody>
            {sections}
          </tbody>
        </table>
      </div>
    </p>
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
    if (!assigned[key] && misc) {
      misc.Keys.push(key);
    }
  }

  return sections;
}
