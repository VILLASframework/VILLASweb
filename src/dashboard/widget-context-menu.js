/**
 * File: widget-context-menu.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 31.05.2018
 *
 * This file is part of VILLASweb.
 *
 * VILLASweb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * VILLASweb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with VILLASweb. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Item, Separator, MenuProvider } from 'react-contexify';
import Widget from '../widget/widget';

class WidgetContextMenu extends React.Component {
  editWidget = event => {
    if (this.props.onEdit != null) {
      this.props.onEdit(this.props.widget, this.props.index);
    }
  };

  deleteWidget = event => {
    if (this.props.onDelete != null) {
      this.props.onDelete(this.props.widget, this.props.index);
    }
  };

  moveAbove = event => {
    this.props.widget.z++;
    if (this.props.widget.z > 100) {
      this.props.widget.z = 100;
    }

    if (this.props.onChange != null) {
      this.props.onChange(this.props.widget, this.props.index);
    }
  };

  moveToFront = event => {
    this.props.widget.z = 100;

    if (this.props.onChange != null) {
      this.props.onChange(this.props.widget, this.props.index);
    }
  };

  moveUnderneath = event => {
    this.props.widget.z--;
    if (this.props.widget.z < 0) {
      this.props.widget.z = 0;
    }

    if (this.props.onChange != null) {
      this.props.onChange(this.props.widget, this.props.index);
    }
  };

  moveToBack = event => {
    this.props.widget.z = 0;

    if (this.props.onChange != null) {
      this.props.onChange(this.props.widget, this.props.index);
    }
  };

  lockWidget = event => {
    this.props.widget.locked = true;

    if (this.props.onChange != null) {
      this.props.onChange(this.props.widget, this.props.index);
    }
  };

  unlockWidget = event => {
    this.props.widget.locked = false;

    if (this.props.onChange != null) {
      this.props.onChange(this.props.widget, this.props.index);
    }
  };

  render() {
    const isLocked = this.props.widget.locked;
    const ContextMenu = () => (
      <Menu id={'widgetMenu'+ this.props.index}>
      <Item disabled={isLocked} onClick={this.editWidget}>Edit</Item>
      <Item disabled={isLocked} onClick={this.deleteWidget}>Delete</Item>

      <Separator />

      <Item disabled={isLocked} onClick={this.moveAbove}>Move above</Item>
      <Item disabled={isLocked} onClick={this.moveToFront}>Move to front</Item>
      <Item disabled={isLocked} onClick={this.moveUnderneath}>Move underneath</Item>
      <Item disabled={isLocked} onClick={this.moveToBack}>Move to back</Item>

      <Separator />

      <Item disabled={isLocked} onClick={this.lockWidget}>Lock</Item>
      <Item disabled={isLocked === false} onClick={this.unlockWidget}>Unlock</Item>
      </Menu>
  );

    return <div>
    <MenuProvider id={'widgetMenu'+ this.props.index} style={{ border: '1px solid purple', display: 'inline-block' }}>
    <Widget
              data={this.props.widget}
              onWidgetChange={this.props.onWidgetChange}
              onWidgetStatusChange={this.props.onWidgetStatusChange}
              editing={this.props.editing}
              index={this.props.index}
              grid={this.props.grid}
              paused={this.props.paused}
            />
    </MenuProvider>
    <ContextMenu />
    </div>
  }
}

WidgetContextMenu.propTypes = {
  index: PropTypes.number.isRequired,
  widget: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onChange: PropTypes.func
};

export default WidgetContextMenu