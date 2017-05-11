/**
 * File: visualization.js
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
import { Button } from 'react-bootstrap';
import { ContextMenu, MenuItem } from 'react-contextmenu';

import WidgetFactory from '../components/widget-factory';
import ToolboxItem from '../components/toolbox-item';
import Dropzone from '../components/dropzone';
import Widget from './widget';
import EditWidget from '../components/dialog/edit-widget';

import VisualizationStore from '../stores/visualization-store';
import ProjectStore from '../stores/project-store';
import SimulationStore from '../stores/simulation-store';
import FileStore from '../stores/file-store';
import AppDispatcher from '../app-dispatcher';
import NotificationsDataManager from '../data-managers/notifications-data-manager';
import NotificationsFactory from '../data-managers/notifications-factory';

class Visualization extends Component {
  static getStores() {
    return [ VisualizationStore, ProjectStore, SimulationStore, FileStore ];
  }

  static calculateState(prevState) {
    if (prevState == null) {
      prevState = {};
    }

    return {
      visualizations: VisualizationStore.getState(),
      projects: ProjectStore.getState(),
      simulations: SimulationStore.getState(),
      files: FileStore.getState(),

      visualization: prevState.visualization || {},
      project: prevState.project || null,
      simulation: prevState.simulation || null,
      editing: prevState.editing || false,
      grid: prevState.grid || false,

      editModal: prevState.editModal || false,
      modalData: prevState.modalData || null,
      modalIndex: prevState.modalIndex || null,
      
      maxWidgetHeight: prevState.maxWidgetHeight  || 0,
      dropZoneHeight: prevState.dropZoneHeight  || 0,
      last_widget_key: prevState.last_widget_key  || 0
    };
  }
  
  componentWillMount() {
    AppDispatcher.dispatch({
      type: 'visualizations/start-load'
    });
  }

  componentDidUpdate() {
    if (this.state.visualization._id !== this.props.params.visualization) {
      this.reloadVisualization();
    }

    // load depending project
    if (this.state.project == null && this.state.projects) {
      this.state.projects.forEach((project) => {
        if (project._id === this.state.visualization.project) {
          this.setState({ project: project, simulation: null });

          AppDispatcher.dispatch({
            type: 'simulations/start-load',
            data: project.simulation
          });
        }
      });
    }

    // load depending simulation
    if (this.state.simulation == null && this.state.simulations && this.state.project) {
      this.state.simulations.forEach((simulation) => {
        if (simulation._id === this.state.project.simulation) {
          this.setState({ simulation: simulation });
        }
      });
    }
  }

  getNewWidgetKey() {
    // Increase the counter and update the state
    return this.state.last_widget_key++;
  }

  transformToWidgetsDict(widgets) {
    var widgetsDict = {};
    // Create a new key and make a copy of the widget object
    widgets.forEach( (widget) => widgetsDict[this.getNewWidgetKey()] = Object.assign({}, widget) );
    return widgetsDict;
  }

  transformToWidgetsList(widgets) {
    return Object.keys(widgets).map( (key) => widgets[key]);
  }

  reloadVisualization() {
    // select visualization by param id
    this.state.visualizations.forEach((tempVisualization) => {
      if (tempVisualization._id === this.props.params.visualization) {

        // convert widgets list to a dictionary
        var visualization = Object.assign({}, tempVisualization, {
            widgets: tempVisualization.widgets? this.transformToWidgetsDict(tempVisualization.widgets) : {}
        });

        this.computeHeightWithWidgets(visualization.widgets);

        this.setState({ visualization: visualization, project: null });

        AppDispatcher.dispatch({
          type: 'projects/start-load',
          data: visualization.project
        });
      }
    });
  }

  handleDrop(item, position) {

    let widget = null;
    let defaultSimulator = null;

    if (this.state.simulation.models && this.state.simulation.models.length === 0) {
      NotificationsDataManager.addNotification(NotificationsFactory.NO_SIM_MODEL_AVAILABLE);
    } else {
      defaultSimulator = this.state.simulation.models[0].simulator;
    }

    // create new widget
    widget = WidgetFactory.createWidgetOfType(item.name, position, defaultSimulator);

    var new_widgets = this.state.visualization.widgets;

    var widget_key = this.getNewWidgetKey();
    new_widgets[widget_key] = widget;

    var visualization = Object.assign({}, this.state.visualization, {
      widgets: new_widgets
    });
    
    this.increaseHeightWithWidget(widget);
    this.setState({ visualization: visualization });
  }

  widgetStatusChange(updated_widget, key) {
    // Widget changed internally, make changes effective then save them
    this.widgetChange(updated_widget, key, this.saveChanges);
  }

  widgetChange(updated_widget, key, callback = null) {
    var widgets_update = {};
    widgets_update[key] =  updated_widget;
    var new_widgets = Object.assign({}, this.state.visualization.widgets, widgets_update);

    var visualization = Object.assign({}, this.state.visualization, {
      widgets: new_widgets
    });
    
    // Check if the height needs to be increased, the section may have shrunk if not
    if (!this.increaseHeightWithWidget(updated_widget)) {
      this.computeHeightWithWidgets(visualization.widgets);
    }
    this.setState({ visualization: visualization }, callback);
  }

  /*
  * Set the initial height state based on the existing widgets
  */
  computeHeightWithWidgets(widgets) {
    // Compute max height from widgets
    let maxHeight = Object.keys(widgets).reduce( (maxHeightSoFar, widgetKey) => {
      let thisWidget = widgets[widgetKey];
      let thisWidgetHeight = thisWidget.y + thisWidget.height;
      
      return thisWidgetHeight > maxHeightSoFar? thisWidgetHeight : maxHeightSoFar;
    }, 0);

    this.setState({ 
      maxWidgetHeight: maxHeight, 
      dropZoneHeight:  maxHeight + 40
    });
  }
  /*
  * Adapt the area's height with the position of the new widget.
  * Return true if the height increased, otherwise false.
  */
  increaseHeightWithWidget(widget) {
    let increased = false;
    let thisWidgetHeight = widget.y + widget.height;
    if (thisWidgetHeight > this.state.maxWidgetHeight) {
      increased = true;
      this.setState({ 
        maxWidgetHeight: thisWidgetHeight, 
        dropZoneHeight:  thisWidgetHeight + 40
      });
    }
    return increased;
  }

  editWidget(e, data) {
    this.setState({ editModal: true, modalData: this.state.visualization.widgets[data.key], modalIndex: data.key });
  }

  closeEdit(data) {
    if (data) {
      // save changes temporarily
      var widgets_update = {};
      widgets_update[this.state.modalIndex] =  data;

      var new_widgets = Object.assign({}, this.state.visualization.widgets, widgets_update);

      var visualization = Object.assign({}, this.state.visualization, {
        widgets: new_widgets
      });

      this.setState({ editModal: false, visualization: visualization });
    } else {
      this.setState({ editModal: false });
    }
  }

  deleteWidget(e, data) {
    delete this.state.visualization.widgets[data.key];
    var visualization = Object.assign({}, this.state.visualization, {
        widgets: this.state.visualization.widgets
      });
    this.setState({ visualization: visualization });
  }

  stopEditing() {
    // Provide the callback so it can be called when state change is applied
    this.setState({ editing: false }, this.saveChanges );
  }

  saveChanges() {
    // Transform to a list
    var visualization = Object.assign({}, this.state.visualization, {
        widgets: this.transformToWidgetsList(this.state.visualization.widgets)
      });

    AppDispatcher.dispatch({
      type: 'visualizations/start-edit',
      data: visualization
    });
  }

  discardChanges() {
    this.setState({ editing: false, visualization: {} });

    this.reloadVisualization();
  }

  moveWidget(e, data, applyDirection) {
    var widget = this.state.visualization.widgets[data.key];
    var updated_widgets = {};
    updated_widgets[data.key] =  applyDirection(widget);
    var new_widgets = Object.assign({}, this.state.visualization.widgets, updated_widgets);

    var visualization = Object.assign({}, this.state.visualization, {
      widgets: new_widgets
    });
    this.setState({ visualization: visualization });

  }

  moveAbove(widget) {
    // increase z-Order
    widget.z++;
     return widget;
  }

  moveToFront(widget) {
    // increase z-Order
    widget.z = 100;
    return widget;
  }

  moveUnderneath(widget) {
    // decrease z-Order
    widget.z--;
    if (widget.z < 0) {
      widget.z = 0;
    }
    return widget;
  }

  moveToBack(widget) {
    // increase z-Order
    widget.z = 0;
    return widget;
  }

  render() {
    var current_widgets = this.state.visualization.widgets;

    return (
      <div className='section box' >
        <div className='section-header box-header'>
          <div className="section-title">
            <span>
              {this.state.visualization.name}
            </span>
          </div>
          {this.state.editing ? (
            <div className='section-buttons-group'>
              <Button bsStyle="link" onClick={() => this.stopEditing()}>
                <span className="glyphicon glyphicon-floppy-disk"></span> Save
              </Button>
              <Button bsStyle="link" onClick={() => this.discardChanges()}>
                <span className="glyphicon glyphicon-remove"></span> Cancel
              </Button>
            </div>
          ) : (
            <div className='section-buttons-group'>
              <Button bsStyle="link" onClick={() => this.setState({ editing: true })}>
                <span className="glyphicon glyphicon-pencil"></span> Edit
              </Button>
            </div>
          )}
        </div>

        <div className="box box-content" onContextMenu={ (e) => e.preventDefault() }>
          {this.state.editing &&
            <div className="toolbox box-header">
              <ToolboxItem name="Grid" type="grid" />
              <ToolboxItem name="Value" type="widget" />
              <ToolboxItem name="Plot" type="widget" />
              <ToolboxItem name="Table" type="widget" />
              <ToolboxItem name="Label" type="widget" />
              <ToolboxItem name="Image" type="widget" />
              <ToolboxItem name="PlotTable" type="widget" />
              <ToolboxItem name="Button" type="widget" />
              <ToolboxItem name="NumberInput" type="widget" />
              <ToolboxItem name="Slider" type="widget" />
              <ToolboxItem name="Gauge" type="widget" />
              <ToolboxItem name="Box" type="widget" />
            </div>
          }

          <Dropzone height={this.state.dropZoneHeight} onDrop={(item, position) => this.handleDrop(item, position)} editing={this.state.editing}>
            {current_widgets != null &&
              Object.keys(current_widgets).map( (widget_key) => (
              <Widget key={widget_key} data={current_widgets[widget_key]} simulation={this.state.simulation} onWidgetChange={(w, k) => this.widgetChange(w, k)} onWidgetStatusChange={(w, k) => this.widgetStatusChange(w, k)} editing={this.state.editing} index={widget_key} grid={this.state.grid} />
            ))}
          </Dropzone>

          {current_widgets != null &&
            Object.keys(current_widgets).map( (widget_key) => (
              <ContextMenu id={'widgetMenu'+ widget_key} key={widget_key} >
                <MenuItem data={{key: widget_key}} onClick={(e, data) => this.editWidget(e, data)}>Edit</MenuItem>
                <MenuItem data={{key: widget_key}} onClick={(e, data) => this.deleteWidget(e, data)}>Delete</MenuItem>
                <MenuItem divider />
                <MenuItem data={{key: widget_key}} onClick={(e, data) => this.moveWidget(e, data, this.moveAbove)}>Move above</MenuItem>
                <MenuItem data={{key: widget_key}} onClick={(e, data) => this.moveWidget(e, data, this.moveToFront)}>Move to front</MenuItem>
                <MenuItem data={{key: widget_key}} onClick={(e, data) => this.moveWidget(e, data, this.moveUnderneath)}>Move underneath</MenuItem>
                <MenuItem data={{key: widget_key}} onClick={(e, data) => this.moveWidget(e, data, this.moveToBack)}>Move to back</MenuItem>
              </ContextMenu>
          ))}

          <EditWidget show={this.state.editModal} onClose={(data) => this.closeEdit(data)} widget={this.state.modalData} simulation={this.state.simulation} files={this.state.files} />
        </div>
      </div>
    );
  }
}

export default Container.create(Visualization);
