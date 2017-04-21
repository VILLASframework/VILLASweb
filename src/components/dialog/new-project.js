/**
 * File: new-project.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 07.03.2017
 * Copyright: 2017, Institute for Automation of Complex Power Systems, EONERC
 *   This file is part of VILLASweb. All Rights Reserved. Proprietary and confidential.
 *   Unauthorized copying of this file, via any medium is strictly prohibited.
 **********************************************************************************/

import React, { Component, PropTypes } from 'react';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

import Dialog from './dialog';

class NewProjectDialog extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    simulations: PropTypes.array.isRequired
  };

  valid: false;

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      simulation: ''
    };
  }

  onClose(canceled) {
    if (canceled === false) {
      this.props.onClose(this.state);
    } else {
      this.props.onClose();
    }
  }

  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value });
  }

  resetState() {
    this.setState({
      name: '',
      simulation: this.props.simulations[0] != null ? this.props.simulations[0]._id : ''
    });
  }

  validateForm(target) {
    // check all controls
    var name = true;
    var simulation = true;

    if (this.state.name === '') {
      name = false;
    }

    if (this.state.simulation === '') {
      simulation = false;
    }

    this.valid =  name && simulation;

    // return state to control
    if (target === 'name') return name ? "success" : "error";
    else if (target === 'simulation') return simulation ? "success" : "error";
  }

  render() {
    return (
      <Dialog show={this.props.show} title="New Simulation" buttonTitle="Add" onClose={(c) => this.onClose(c)} onReset={() => this.resetState()} valid={this.valid}>
        <form>
          <FormGroup controlId="name" validationState={this.validateForm('name')}>
            <ControlLabel>Name</ControlLabel>
            <FormControl type="text" placeholder="Enter name" value={this.state.name} onChange={(e) => this.handleChange(e)} />
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup controlId="simulation" validationState={this.validateForm('simulation')}>
            <ControlLabel>Simulation</ControlLabel>
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

export default NewProjectDialog;
