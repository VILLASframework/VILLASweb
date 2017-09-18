/**
 * File: projects.js
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

import React from 'react';
import { Container } from 'flux/utils';
import { Button, Modal, Glyphicon } from 'react-bootstrap';

import AppDispatcher from '../app-dispatcher';
import ProjectStore from '../stores/project-store';
import UserStore from '../stores/user-store';
import SimulationStore from '../stores/simulation-store';

import Table from '../components/table';
import TableColumn from '../components/table-column';
import NewProjectDialog from '../components/dialog/new-project';
import EditProjectDialog from '../components/dialog/edit-project';

class Projects extends React.Component {
  static getStores() {
    return [ ProjectStore, SimulationStore, UserStore ];
  }

  static calculateState() {
    return {
      projects: ProjectStore.getState(),
      simulations: SimulationStore.getState(),
      sessionToken: UserStore.getState().token,

      newModal: false,
      editModal: false,
      deleteModal: false,
      modalData: {}
    };
  }

  componentWillMount() {
    AppDispatcher.dispatch({
      type: 'projects/start-load',
      token: this.state.sessionToken
    });

    AppDispatcher.dispatch({
      type: 'simulations/start-load',
      token: this.state.sessionToken
    });
  }

  closeNewModal(data) {
    this.setState({ newModal: false });

    if (data) {
      AppDispatcher.dispatch({
        type: 'projects/start-add',
        data,
        token: this.state.sessionToken
      });
    }
  }

  confirmDeleteModal() {
    this.setState({ deleteModal: false });

    AppDispatcher.dispatch({
      type: 'projects/start-remove',
      data: this.state.modalData,
      token: this.state.sessionToken
    });
  }

  closeEditModal(data) {
    this.setState({ editModal: false });

    if (data) {
      AppDispatcher.dispatch({
        type: 'projects/start-edit',
        data: data,
        token: this.state.sessionToken
      });
    }
  }

  getSimulationName(id) {
    for (var i = 0; i < this.state.simulations.length; i++) {
      if (this.state.simulations[i]._id === id) {
        return this.state.simulations[i].name;
      }
    }

    return id;
  }

  hasValidSimulation() {
    const simulations = this.state.simulations.filter(simulation => {
      return simulation.models.length > 0;
    });
    
    return simulations.length > 0;
  }

  onModalKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    
      this.confirmDeleteModal();
    }
  }

  render() {
    return (
      <div className='section'>
        <h1>Projects</h1>

        <Table data={this.state.projects}>
          <TableColumn title='Name' dataKey='name' link='/projects/' linkKey='_id' />
          <TableColumn title='Simulation' dataKey='simulation' modifier={(id) => this.getSimulationName(id)} />
          <TableColumn width='70' editButton deleteButton onEdit={index => this.setState({ editModal: true, modalData: this.state.projects[index] })} onDelete={index => this.setState({ deleteModal: true, modalData: this.state.projects[index] })} />
        </Table>

        <Button onClick={() => this.setState({ newModal: true })} disabled={!this.hasValidSimulation()}><Glyphicon glyph='plus' /> Project</Button>

        {!this.hasValidSimulation() &&
          <span><i> Simulation with at least one simulation-model required!</i></span>
        }

        <NewProjectDialog show={this.state.newModal} onClose={(data) => this.closeNewModal(data)} simulations={this.state.simulations} />
        <EditProjectDialog show={this.state.editModal} onClose={(data) => this.closeEditModal(data)} project={this.state.modalData} simulations={this.state.simulations} />

        <Modal keyboard show={this.state.deleteModal} onHide={() => this.setState({ deleteModal: false })} onKeyPress={this.onModalKeyPress}>
          <Modal.Header>
            <Modal.Title>Delete Project</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            Are you sure you want to delete the project <strong>'{this.state.modalData.name}'</strong>?
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={() => this.setState({ deleteModal: false})}>Cancel</Button>
            <Button bsStyle='danger' onClick={() => this.confirmDeleteModal()}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default Container.create(Projects);
