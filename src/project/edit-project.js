/**
 * File: edit-project.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 07.03.2017
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
import { FormGroup, FormControl, FormLabel } from 'react-bootstrap';

import Dialog from '../common/dialogs/dialog';

class EditProjectDialog extends React.Component {
  valid: true;

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      simulation: '',
      _id: ''
    }
  }

  onClose(canceled) {
    if (canceled === false) {
      if (this.valid) {
        this.props.onClose(this.state);
      }
    } else {
      this.props.onClose();
    }
  }

  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value });
  }

  resetState() {
    this.setState({
      name: this.props.project.name,
      simulation: this.props.project.simulation,
      _id: this.props.project._id
    });
  }

  validateForm(target) {
    // check all controls
    var name = true;

    if (this.state.name === '') {
      name = false;
    }

    this.valid = name;

    // return state to control
    if (target === 'name') return name ? "success" : "error";

    return "success";
  }

  render() {
    return (
      <Dialog show={this.props.show} title="Edit Simulation" buttonTitle="Save" onClose={(c) => this.onClose(c)} onReset={() => this.resetState()} valid={this.valid}>
        <form>
          <FormGroup controlId="name" validationState={this.validateForm('name')}>
            <FormLabel>Name</FormLabel>
            <FormControl type="text" placeholder="Enter name" value={this.state.name} onChange={(e) => this.handleChange(e)} />
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup controlId="simulation">
            <FormLabel>Simulation</FormLabel>
            <FormControl componentClass="select" placeholder="Select simulation" value={this.state.simulation} onChange={(e) => this.handleChange(e)}>
              {this.props.simulations.map(simulation => (
                <option key={simulation._id} value={simulation._id}>{simulation.name}</option>
              ))}
            </FormControl>
          </FormGroup>
        </form>
      </Dialog>
    );
  }
}

export default EditProjectDialog;