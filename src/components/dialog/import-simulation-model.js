/**
 * File: import-simulation-model.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 03.09.2017
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
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

import Table from '../table';
import TableColumn from '../table-column';
import Dialog from './dialog';

class ImportSimulationModelDialog extends React.Component {
  valid = false;
  imported = false;

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      simulator: { node: '', simulator: '' },
      length: '1',
      mapping: [ { name: 'Signal', type: 'Type' } ]
    };
  }

  onClose(canceled) {
    if (canceled === false) {
      this.props.onClose(this.state);
    } else {
      this.props.onClose();
    }
  }

  resetState() {
    this.setState({
      name: '',
      simulator: { node: this.props.nodes[0] ? this.props.nodes[0]._id : '', simulator: this.props.nodes[0].simulators[0] ? 0 : '' },
      length: '1',
      mapping: [ { name: 'Signal', type: 'Type' } ]
    });

    this.imported = false;
  }

  handleChange(e) {
    if (e.target.id === 'length') {
      // change mapping size
      if (e.target.value > this.state.mapping.length) {
        // add missing signals
        while (this.state.mapping.length < e.target.value) {
          this.state.mapping.push({ name: 'Signal', type: 'Type' });
        }
      } else {
        // remove signals
        this.state.mapping.splice(e.target.value, this.state.mapping.length - e.target.value);
      }
    }

    if (e.target.id === 'simulator') {
      this.setState({ simulator: JSON.parse(e.target.value) });
    } else {
      this.setState({ [e.target.id]: e.target.value });
    }
  }

  handleMappingChange(event, row, column) {
    var mapping = this.state.mapping;

    if (column === 1) {
      mapping[row].name = event.target.value;
    } else if (column === 2) {
      mapping[row].type = event.target.value;
    }

    this.setState({ mapping: mapping });
  }

  loadFile(fileList) {
    // get file
    const file = fileList[0];
    if (!file.type.match('application/json')) {
      return;
    }

    // create file reader
    var reader = new FileReader();
    var self = this;

    reader.onload = function(event) {
      // read simulator
      const model = JSON.parse(event.target.result);

      self.imported = true;
      self.valid = true;
      self.setState({ name: model.name, mapping: model.mapping, length: model.length, simulator: { node: self.props.nodes[0]._id, simulator: 0 } });
    };

    reader.readAsText(file);
  }

  validateForm(target) {
    // check all controls
    var name = true;
    var length = true;
    var simulator = true;

    if (this.state.name === '') {
      name = false;
    }

    if (this.state.simulator === '') {
      simulator = false;
    }

    // test if simulatorid is a number (in a string, not type of number)
    if (!/^\d+$/.test(this.state.length)) {
      length = false;
    }

    this.valid = name && length && simulator;

    // return state to control
    if (target === 'name') return name ? "success" : "error";
    else if (target === 'length') return length ? "success" : "error";
    else if (target === 'simulator') return simulator ? "success" : "error";
  }

  render() {
    return (
      <Dialog show={this.props.show} title="Import Simulation Model" buttonTitle="Import" onClose={(c) => this.onClose(c)} onReset={() => this.resetState()} valid={this.valid}>
        <form>
          <FormGroup controlId="file">
            <ControlLabel>Simulation Model File</ControlLabel>
            <FormControl type="file" onChange={(e) => this.loadFile(e.target.files)} />
          </FormGroup>

          <FormGroup controlId="name" validationState={this.validateForm('name')}>
            <ControlLabel>Name</ControlLabel>
            <FormControl readOnly={!this.imported} type="text" placeholder="Enter name" value={this.state.name} onChange={(e) => this.handleChange(e)} />
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup controlId="simulator">
            <ControlLabel>Simulator</ControlLabel>
            <FormControl readOnly={!this.imported} componentClass="select" placeholder="Select simulator" value={JSON.stringify({ node: this.state.simulator.node, simulator: this.state.simulator.simulator})} onChange={(e) => this.handleChange(e)}>
              {this.props.nodes.map(node => (
                node.simulators.map((simulator, index) => (
                  <option key={node._id + index} value={JSON.stringify({ node: node.name, simulator: simulator.name })}>{node.name}/{simulator.name}</option>
                ))
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup controlId="length" validationState={this.validateForm('length')}>
            <ControlLabel>Length</ControlLabel>
            <FormControl readOnly={!this.imported} type="number" placeholder="Enter length" min="1" value={this.state.length} onChange={(e) => this.handleChange(e)} />
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup controlId="mapping">
            <ControlLabel>Mapping</ControlLabel>
            <Table data={this.state.mapping}>
              <TableColumn title='ID' width='60' dataIndex />
              <TableColumn title='Name' dataKey='name' inlineEditable onInlineChange={(event, row, column) => this.handleMappingChange(event, row, column)} />
              <TableColumn title='Type' dataKey='type' inlineEditable onInlineChange={(event, row, column) => this.handleMappingChange(event, row, column)} />
            </Table>
          </FormGroup>
        </form>
      </Dialog>
    );
  }
}

export default ImportSimulationModelDialog;