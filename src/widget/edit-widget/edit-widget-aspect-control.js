/**
 * File: edit-widget-aspect-control.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 29.07.2017
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
import { FormGroup, FormCheck } from 'react-bootstrap';

class EditWidgetAspectControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      widget: {
        customProperties:{
        isLocked: true
        }
      }
    };
  }

  static getDerivedStateFromProps(props, state){
    return{
      widget: props.widget
    };
  }

  render() {
    return (
      <FormGroup>
        <FormCheck id="lockAspect" checked={this.state.widget.customProperties.isLocked} onChange={e => this.props.handleChange(e)}>Lock Aspect</FormCheck>
      </FormGroup>
    );
  }
}

export default EditWidgetAspectControl;