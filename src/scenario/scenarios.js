/**
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
import { Button } from 'react-bootstrap';
import FileSaver from 'file-saver';

import AppDispatcher from '../common/app-dispatcher';
import ScenarioStore from './scenario-store';
import LoginStore from '../user/login-store';
import DashboardStore from '../dashboard/dashboard-store';
import WidgetStore from "../widget/widget-store";
import ConfigStore from '../componentconfig/config-store';

import Icon from '../common/icon';
import Table from '../common/table';
import TableColumn from '../common/table-column';
import NewScenarioDialog from './new-scenario';
import EditScenarioDialog from './edit-scenario';
import ImportScenarioDialog from './import-scenario';

import DeleteDialog from '../common/dialogs/delete-dialog';


class Scenarios extends Component {

  static getStores() {
    return [ScenarioStore, LoginStore, DashboardStore, WidgetStore, ConfigStore];
  }

  static calculateState() {
    const scenarios = ScenarioStore.getState();
    const sessionToken = LoginStore.getState().token;

    let dashboards = DashboardStore.getState();
    let configs = ConfigStore.getState();

    return {
      scenarios,
      dashboards,
      configs,
      sessionToken,

      newModal: false,
      deleteModal: false,
      editModal: false,
      importModal: false,
      modalScenario: {},

      selectedScenarios: []
    };
  }

  componentDidMount() {
    AppDispatcher.dispatch({
      type: 'scenarios/start-load',
      token: this.state.sessionToken
    });
  }

  componentDidUpdate(prevProps, prevState) {

    for (let i = prevState.scenarios.length; i < this.state.scenarios.length; i++) {
      AppDispatcher.dispatch({
        type: 'dashboards/start-load',
        token: this.state.sessionToken,
        param: '?scenarioID=' + this.state.scenarios[i].id
      });
      AppDispatcher.dispatch({
        type: 'configs/start-load',
        token: this.state.sessionToken,
        param: '?scenarioID=' + this.state.scenarios[i].id
      });
    }

    // when length of scenarios array has increased, either add data (after import)
    // or load data (after export)
    /*
    if (this.state.scenarios.length > prevState.scenarios.length) {
      if (this.addDashboards || this.addConfigs) {
        let scenarioID = this.state.scenarios[this.state.scenarios.length - 1].id;

        if (this.addDashboards) {
          this.dashboardsToAdd.forEach((dashboard) => {
            if (dashboard.widgets) {
              this.addWidgets = true;
            }
            dashboard.scenarioID = scenarioID;
            AppDispatcher.dispatch({
              type: 'dashboards/start-add',
              token: this.state.sessionToken,
              data: dashboard
            });
          })
          this.addDashboards = false;
        }

        if (this.addConfigs) {
          this.configsToAdd.forEach((config) => {
            config.scenarioID = scenarioID;
            AppDispatcher.dispatch({
              type: 'configs/start-add',
              token: this.state.sessionToken,
              data: config
            })
          })
          delete this.configsToAdd;
          this.addConfigs = false;
        }

      }
      else {
        let scenarios = Object.assign([], this.state.scenarios); // copying neccessary?
        for (var i = prevState.scenarios.length; i < scenarios.length; i++) {
          AppDispatcher.dispatch({
            type: 'dashboards/start-load',
            token: this.state.sessionToken,
            param: '?scenarioID=' + scenarios[i].id
          });
          AppDispatcher.dispatch({
            type: 'configs/start-load',
            token: this.state.sessionToken,
            param: '?scenarioID=' + scenarios[i].id
          });
        }
      }


    }


    // when length of dashboards array has increased, either add widgets (after import)
    // or load widgets (after export)
    if (this.state.dashboards.length > prevState.dashboards.length) {
      if (this.addWidgets && !this.addDashboards) { // add widget data
        let dashboards = Object.assign([], this.state.dashboards);
        for (var j = prevState.dashboards.length; j < dashboards.length; j++) {
          let dboard = dashboards[j];
          let dboardID = dboard.id;
          let dashboard = this.dashboardsToAdd.shift();
          if (dashboard.name !== dboard.name) {
            console.log("Cannot add widgets, dashboard was not added as expected!");
            this.addWidgets = false;
            return;
          }
          dashboard.widgets.forEach((widget) => {
            widget.dashboardID = dboardID;
            AppDispatcher.dispatch({
              type: 'widgets/start-add',
              token: this.state.sessionToken,
              data: widget
            });
          });
        }

        if (this.dashboardsToAdd.length === 0) {
          delete this.dashboardsToAdd;
          this.addWidgets = false;
        }
      }
      else { // load widget data
        let dashboards = Object.assign([], this.state.dashboards);
        for (var j = prevState.dashboards.length; j < dashboards.length; j++) {
          AppDispatcher.dispatch({
            type: 'widgets/start-load',
            token: this.state.sessionToken,
            param: '?dashboardID=' + dashboards[j].id
          })
        }
      }

    }


     */
  }


  closeNewModal(data) {
    this.setState({ newModal: false });

    // TODO create dispatch here to add scenario to Backend database!
  }

  showDeleteModal(id) {
    // get scenario by id
    var deleteScenario;

    this.state.scenarios.forEach((scenario) => {
      if (scenario.id === id) {
        deleteScenario = scenario;
      }
    });

    this.setState({ deleteModal: true, modalScenario: deleteScenario });
  }

  closeDeleteModal(confirmDelete) {
    this.setState({ deleteModal: false });

    if (confirmDelete === false) {
      return;
    }

    this.state.dashboards.forEach((dashboard) => {
      if (dashboard.id === this.state.modalScenario.id) {
        AppDispatcher.dispatch({
          type: 'dashboards/start-remove',
          data: dashboard,
          token: this.state.sessionToken
        })
      }
    });

    AppDispatcher.dispatch({
      type: 'scenarios/start-remove',
      data: this.state.modalScenario,
      token: this.state.sessionToken
    });
  };

  showEditModal(id) {
    // get scenario by id
    var editScenario;

    this.state.scenarios.forEach((scenario) => {
      if (scenario.id === id) {
        editScenario = scenario;
      }
    });

    this.setState({ editModal: true, modalScenario: editScenario });
  }

  closeEditModal(data) {
    this.setState({ editModal: false });

    if (data != null) {
      AppDispatcher.dispatch({
        type: 'scenarios/start-edit',
        data,
        token: this.state.sessionToken
      });
    }
  }

  closeImportModal(data) {
    this.setState({ importModal: false });

    if (data) {
      //let newScenario = JSON.parse(JSON.stringify(data));
      // temporarily store dashboard data until scenario is created
      /*if (data.dashboards) {
        this.addDashboards = true;
        this.dashboardsToAdd = data.dashboards;
      }
      if (data.configs) {
        this.addConfigs = true;
        this.configsToAdd = data.configs;
      }
      delete newScenario.dashboards;
      */

      AppDispatcher.dispatch({
        type: 'scenarios/start-add',
        data: data,
        token: this.state.sessionToken,
      });
    }
  }

  onModalKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      this.confirmDeleteModal();
    }
  };

  exportScenario(index) {
    // copy by value by converting to JSON and back
    // otherwise, IDs of state objects will be deleted
    let scenario = JSON.parse(JSON.stringify(this.state.scenarios[index]));
    let configs = JSON.parse(JSON.stringify(this.state.configs.filter(config => config.scenarioID === scenario.id)));
    let dashboards = JSON.parse(JSON.stringify(this.state.dashboards.filter(dashb => dashb.scenarioID === scenario.id)));

    // create JSON object and add component configs
    delete scenario.id;
    let jsonObj = scenario;

    configs.forEach((config) => {
      delete config.id;
      delete config.scenarioID;
    })
    jsonObj["configs"] = configs;

    // add Dashboards and Widgets to JSON object
    dashboards.forEach((dboard) => {
      let widgets = JSON.parse(JSON.stringify(WidgetStore.getState().filter(w => w.dashboardID === parseInt(dboard.id, 10))));
      widgets.forEach((widget) => {
        delete widget.dashboardID;
        delete widget.id;
      })
      dboard["widgets"] = widgets;
      delete dboard.scenarioID;
      delete dboard.id;
    });
    jsonObj["dashboards"] = dashboards;


    // create JSON string and show save dialog
    const blob = new Blob([JSON.stringify(jsonObj, null, 2)], { type: 'application/json' });
    FileSaver.saveAs(blob, 'scenario - ' + scenario.name + '.json');
  }


  render() {
    const buttonStyle = {
      marginLeft: '10px'
    };

    return (
      <div className='section'>
        <h1>Scenarios</h1>

        <Table data={this.state.scenarios}>
          <TableColumn title='Name' dataKey='name' link='/scenarios/' linkKey='id' />
          <TableColumn title='ID' dataKey='id' />
          <TableColumn title='Running' dataKey='running' />
          <TableColumn
            width='200'
            editButton
            deleteButton
            exportButton
            onEdit={index => this.setState({ editModal: true, modalScenario: this.state.scenarios[index] })}
            onDelete={index => this.setState({ deleteModal: true, modalScenario: this.state.scenarios[index] })}
            onExport={index => this.exportScenario(index)}
          />
        </Table>

        <div style={{ float: 'right' }}>
          <Button onClick={() => this.setState({ newModal: true })} style={buttonStyle}><Icon icon="plus" /> Scenario</Button>
          <Button onClick={() => this.setState({ importModal: true })} style={buttonStyle}><Icon icon="upload" /> Import</Button>
        </div>

        <div style={{ clear: 'both' }} />

        <NewScenarioDialog show={this.state.newModal} onClose={(data) => this.closeNewModal(data)} />
        <EditScenarioDialog show={this.state.editModal} onClose={(data) => this.closeEditModal(data)} scenario={this.state.modalScenario} />
        <ImportScenarioDialog show={this.state.importModal} onClose={data => this.closeImportModal(data)} nodes={this.state.nodes} />

        <DeleteDialog title="scenario" name={this.state.modalScenario.name} show={this.state.deleteModal} onClose={(e) => this.closeDeleteModal(e)} />
      </div>
    );
  }
}

let fluxContainerConverter = require('../common/FluxContainerConverter');
export default Container.create(fluxContainerConverter.convert(Scenarios));
