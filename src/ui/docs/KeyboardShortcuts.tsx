import React from 'react';
import {Page, PageLink} from '../Docs';
import Input from './Input';
import Inspector from './Inspector';
import Flamegraph from './Flamegraph';
import Treetable from './Treetable';
import Share from './Share';

const page: Page = {
  name: 'Keyboard Shortcuts',
  slug: 'keyboard-shortcuts',
  page: () => (
    <React.Fragment>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th style={{width: '89%'}}>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>I</td>
            <td>
              Switches to the <PageLink page={Input} /> tab.
            </td>
          </tr>
          <tr>
            <td>F</td>
            <td>
              Switches to the <PageLink page={Flamegraph} /> tab.
            </td>
          </tr>
          <tr>
            <td>T</td>
            <td>
              Switches to the <PageLink page={Treetable} /> tab.
            </td>
          </tr>
          <tr>
            <td>S</td>
            <td>
              Toggles the <PageLink page={Share} /> modal.
            </td>
          </tr>
          <tr>
            <td>C</td>
            <td>
              Clears the current JSON Plan and SQL when on the <PageLink page={Input} /> tab.
            </td>
          </tr>
          <tr>
            <td>R</td>
            <td>
              Resets all local state when on the <PageLink page={Input} /> tab.
            </td>
          </tr>
          <tr>
            <td>Enter or ESC</td>
            <td>Closes the currently open modal window, if any.</td>
          </tr>
          <tr>
            <td>ESC</td>
            <td>
              If the <PageLink page={Inspector} /> is open, closes it and deselects the current node.
            </td>
          </tr>
        </tbody>
      </table>
    </React.Fragment>
  ),
};

export default page;
