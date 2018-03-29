/**
 * File: simulators.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 02.03.2017
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

import React, { Component } from 'react';
import { Container } from 'flux/utils';
import { Button, Modal, Glyphicon, DropdownButton, MenuItem } from 'react-bootstrap';
import FileSaver from 'file-saver';
import _ from 'lodash';

import AppDispatcher from '../app-dispatcher';
import SimulatorStore from '../stores/simulator-store';
import UserStore from '../stores/user-store';

import Table from '../components/table';
import TableColumn from '../components/table-column';
import NewSimulatorDialog from '../components/dialog/new-simulator';
import EditSimulatorDialog from '../components/dialog/edit-simulator';
import ImportSimulatorDialog from '../components/dialog/import-simulator';

class Simulators extends Component {
  static getStores() {
    return [ UserStore, SimulatorStore ];
  }

  static calculateState() {
    return {
      sessionToken: UserStore.getState().token,
      simulators: SimulatorStore.getState(),

      modalSimulator: {},
      deleteModal: false,

      runAction: 0,
      runTitle: 'Reset',
      selectedSimulators: []
    };
  }

  componentWillMount() {
    AppDispatcher.dispatch({
      type: 'simulators/start-load',
      token: this.state.sessionToken
    });
  }

  closeNewModal(data) {
    this.setState({ newModal : false });

    if (data) {
      AppDispatcher.dispatch({
        type: 'simulators/start-add',
        data,
        token: this.state.sessionToken
      });
    }
  }

  closeEditModal(data) {
    this.setState({ editModal : false });

    if (data) {
      let simulator = this.state.simulators[this.state.modalIndex];
      simulator.properties = data;
      this.setState({ simulator });

      AppDispatcher.dispatch({
        type: 'simulators/start-edit',
        data: simulator,
        token: this.state.sessionToken
      });
    }
  }

  confirmDeleteModal() {
    this.setState({ deleteModal: false });

    AppDispatcher.dispatch({
      type: 'simulators/start-remove',
      data: this.state.modalSimulator,
      token: this.state.sessionToken
    });
  }

  exportSimulator(index) {
    // filter properties
    let simulator = Object.assign({}, this.state.simulators[index]);
    delete simulator._id;

    // show save dialog
    const blob = new Blob([JSON.stringify(simulator, null, 2)], { type: 'application/json' });
    FileSaver.saveAs(blob, 'simulator - ' + (simulator.properties.name || simulator.rawProperties.name || 'undefined') + '.json');
  }

  closeImportModal(data) {
    this.setState({ importModal: false });

    if (data) {
      AppDispatcher.dispatch({
        type: 'simulators/start-add',
        data,
        token: this.state.sessionToken
      });
    }
  }

  onSimulatorChecked(index, event) {
    const selectedSimulators = this.state.selectedSimulators;
    for (let key in selectedSimulators) {
      if (selectedSimulators[key] === index) {
        // update existing entry
        if (event.target.checked) {
          return;
        }

        selectedSimulators.splice(key, 1);

        this.setState({ selectedSimulators });
        return;
      }
    }

    // add new entry
    if (event.target.checked === false) {
      return;
    }

    selectedSimulators.push(index);
    this.setState({ selectedSimulators });
  }

  setRunAction(index) {
    let runTitle = '';
    switch (index) {
      case '0':
        runTitle = 'Reset';
        break;

      case '1':
        runTitle = 'Shutdown';
        break;

      default:
        console.log('Unknown index ' + index);
        break;
    }

    this.setState({ runAction: index, runTitle });
  }

  runAction() {
    for (let index of this.state.selectedSimulators) {
      let data;
      switch (this.state.runAction) {
        case '0':
          data = { action: 'reset' };
          break;

        case '1':
          data = { action: 'shutdown' };
          break;
      }
  
      AppDispatcher.dispatch({
        type: 'simulators/start-action',
        simulator: this.state.simulators[index],
        data,
        token: this.state.sessionToken
      });
    }
  }

  render() {
    return (
      <div className='section'>
        <h1>Simulators</h1>

        <Table data={this.state.simulators}>
          <TableColumn checkbox onChecked={(index, event) => this.onSimulatorChecked(index, event)} width='30' />
          <TableColumn title='Name' dataKeys={['properties.name', 'rawProperties.name']} />
          <TableColumn title='State' dataKey='state' />
          <TableColumn title='Model' dataKey='model' />
          <TableColumn title='Endpoint' dataKeys={['properties.endpoint', 'rawProperties.endpoint']} />
          <TableColumn title='Host' dataKey='host' />
          <TableColumn title='UUID' dataKey='uuid' />
          <TableColumn 
            width='100' 
            editButton
            exportButton
            deleteButton
            onEdit={index => this.setState({ editModal: true, modalSimulator: this.state.simulators[index], modalIndex: index })} 
            onExport={index => this.exportSimulator(index)}
            onDelete={index => this.setState({ deleteModal: true, modalSimulator: this.state.simulators[index], modalIndex: index })}
          />
        </Table>

        <div style={{ float: 'left' }}>
          <DropdownButton title={this.state.runTitle} id="simulator-action-dropdown" onSelect={(index) => this.setRunAction(index)}>
            <MenuItem eventKey="0" active={this.state.runAction === '0'}>Reset</MenuItem>
            <MenuItem eventKey="1" active={this.state.runAction === '1'}>Shutdown</MenuItem>
          </DropdownButton>

          <Button disabled={this.state.selectedSimulators.length <= 0} onClick={() => this.runAction()}>Run</Button>
        </div>

        <div style={{ float: 'right' }}>
          <Button onClick={() => this.setState({ newModal: true })}><Glyphicon glyph="plus" /> Simulator</Button>
          <Button onClick={() => this.setState({ importModal: true })}><Glyphicon glyph="import" /> Import</Button>
        </div>

        <NewSimulatorDialog show={this.state.newModal} onClose={(data) => this.closeNewModal(data)} />
        <EditSimulatorDialog show={this.state.editModal} onClose={(data) => this.closeEditModal(data)} simulator={this.state.modalSimulator} />
        <ImportSimulatorDialog show={this.state.importModal} onClose={data => this.closeImportModal(data)} />

        <Modal keyboard show={this.state.deleteModal} onHide={() => this.setState({ deleteModal: false })} onKeyPress={this.onModalKeyPress}>
          <Modal.Header>
            <Modal.Title>Delete Simulator</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            Are you sure you want to delete the simulator<strong>'{_.get(this.state.modalSimulator, 'properties.name') || _.get(this.state.modalSimulator, 'rawProperties.name') || 'Unknown'}'</strong>?
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={() => this.setState({ deleteModal: false })}>Cancel</Button>
            <Button bsStyle="danger" onClick={() => this.confirmDeleteModal()}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default Container.create(Simulators);
