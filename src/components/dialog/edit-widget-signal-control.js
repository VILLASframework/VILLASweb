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
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

class EditWidgetSignalControl extends Component {
  constructor(props) {
    super(props);

    this.state = {
      widget: {
        simulator: {}
      }
    };
  }

  componentWillReceiveProps(nextProps) {
      // Update state's widget with props
    this.setState({ widget: nextProps.widget });
  }

  render() {
    let signalsToRender = [];

    if (this.props.simulation) {
      // get selected simulation model
      const simulationModel = this.props.simulation.models.find( model => model.simulator.node === this.state.widget.simulator.node && model.simulator.simulator === this.state.widget.simulator.simulator );

      // If simulation model update the signals to render
      signalsToRender = simulationModel ? simulationModel.mapping : [];
    }

    return (
        <FormGroup controlId="signal">
          <ControlLabel>Signal</ControlLabel>
          <FormControl componentClass="select" placeholder="Select signal" value={this.state.widget.signal} onChange={(e) => this.props.handleChange(e)}>
            {
              signalsToRender.length === 0 ? (
                <option disabled value style={{ display: 'none' }}>No signals available.</option>
              ) : (
                signalsToRender.map((signal, index) => (
                  <option key={index} value={index}>{signal.name}</option>
                ))
              )
            }
          </FormControl>
        </FormGroup>
    );
  }
}

export default EditWidgetSignalControl;
