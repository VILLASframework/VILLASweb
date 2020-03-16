/**
 * File: edit-widget-signal-control.js
 * Author: Ricardo Hernandez-Montoya <rhernandez@gridhound.de>
 * Date: 03.04.2017
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
 **********************************************************************************/

import React, { Component } from 'react';
import { FormGroup, FormControl, FormLabel } from 'react-bootstrap';

class EditWidgetSignalControl extends Component {
  constructor(props) {
    super(props);

    this.state = {
      widget: {}
    };
  }

  static getDerivedStateFromProps(props, state){
    return {
      widget: props.widget
    };
  }

  handleSignalChange(e){

    let newSignal = [];
    newSignal.push(e.target.value);

    this.props.handleChange({ target: { id: this.props.controlId, value: newSignal } });

  }

  render() {

    return (
        <FormGroup controlId="signal">
          <FormLabel>Signal</FormLabel>
          <FormControl as="select" placeholder="Select signal" value={this.props.widget.signalIDs[0]} onChange={(e) => this.handleSignalChange(e)}>
            {
              this.props.signals.length === 0 ? (
                <option disabled value style={{ display: 'none' }}>No signals available.</option>
              ) : (
                this.props.signals.map((signal, index) => (
                  <option key={index} value={signal.id}>{signal.name}</option>
                ))
              )
            }
          </FormControl>
        </FormGroup>
    );
  }
}

export default EditWidgetSignalControl;
