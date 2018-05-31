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

import React from 'react';
import { Container } from 'flux/utils';
import Fullscreenable from 'react-fullscreenable';
import classNames from 'classnames';

import Widget from './widget';
import EditWidget from '../components/dialog/edit-widget';
import WidgetContextMenu from '../components/widget-context-menu';
import WidgetToolbox from '../components/widget-toolbox';
import WidgetArea from '../components/widget-area';
import VisualizationButtonGroup from '../components/visualization-button-group';

import UserStore from '../stores/user-store';
import VisualizationStore from '../stores/visualization-store';
import ProjectStore from '../stores/project-store';
import SimulationStore from '../stores/simulation-store';
import SimulationModelStore from '../stores/simulation-model-store';
import FileStore from '../stores/file-store';
import AppDispatcher from '../app-dispatcher';

import 'react-contexify/dist/ReactContexify.min.css';

class Visualization extends React.Component {
  static getStores() {
    return [ VisualizationStore, ProjectStore, SimulationStore, SimulationModelStore, FileStore, UserStore ];
  }

  static calculateState(prevState, props) {
    if (prevState == null) {
      prevState = {};
    }

    let simulationModels = [];
    if (prevState.simulation != null) {
      simulationModels = SimulationModelStore.getState().filter(m => prevState.simulation.models.includes(m._id));
    }

    return {
      sessionToken: UserStore.getState().token,
      visualizations: VisualizationStore.getState(),
      projects: ProjectStore.getState(),
      simulations: SimulationStore.getState(),
      files: FileStore.getState(),

      visualization: prevState.visualization || {},
      project: prevState.project || null,
      simulation: prevState.simulation || null,
      simulationModels,
      editing: prevState.editing || false,
      paused: prevState.paused || false,

      editModal: prevState.editModal || false,
      modalData: prevState.modalData || null,
      modalIndex: prevState.modalIndex || null,

      maxWidgetHeight: prevState.maxWidgetHeight  || 0,
      dropZoneHeight: prevState.dropZoneHeight  || 0,
      last_widget_key: prevState.last_widget_key  || 0
    };
  }

  componentWillMount() {
    //document.addEventListener('keydown', this.handleKeydown.bind(this));

    AppDispatcher.dispatch({
      type: 'visualizations/start-load',
      token: this.state.sessionToken
    });
  }

  componentWillUnmount() {
      //document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  componentDidUpdate() {
    if (this.state.visualization._id !== this.props.match.params.visualization) {
      this.reloadVisualization();
    }

    // load depending project
    if (this.state.project == null && this.state.projects) {
      this.state.projects.forEach((project) => {
        if (project._id === this.state.visualization.project) {
          this.setState({ project: project, simulation: null });

          AppDispatcher.dispatch({
            type: 'simulations/start-load',
            data: project.simulation,
            token: this.state.sessionToken
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

  /*handleKeydown(e) {
    switch (e.key) {
      case ' ':
      case 'p':
        this.setState({ paused: !this.state.paused });
        break;
      case 'e':
        this.setState({ editing: !this.state.editing });
        break;
      case 'f':
        this.props.toggleFullscreen();
        break;
      default:
    }
  }*/

  getNewWidgetKey() {
    const widgetKey = this.state.last_widget_key;

    this.setState({ last_widget_key: this.state.last_widget_key + 1 });

    return widgetKey;
  }

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

  transformToWidgetsDict(widgets) {
    var widgetsDict = {};
    // Create a new key and make a copy of the widget object
    widgets.forEach( (widget) => widgetsDict[this.getNewWidgetKey()] = Object.assign({}, widget) );
    return widgetsDict;
  }

  transformToWidgetsList(widgets) {
    if (widgets == null) {
      return [];
    }

    return Object.keys(widgets).map( (key) => widgets[key]);
  }

  reloadVisualization() {
    // select visualization by param id
    this.state.visualizations.forEach((tempVisualization) => {
      if (tempVisualization._id === this.props.match.params.visualization) {

        // convert widgets list to a dictionary
        var visualization = Object.assign({}, tempVisualization, {
            widgets: tempVisualization.widgets? this.transformToWidgetsDict(tempVisualization.widgets) : {}
        });

        this.computeHeightWithWidgets(visualization.widgets);

        this.setState({ visualization: visualization, project: null });

        AppDispatcher.dispatch({
          type: 'projects/start-load',
          data: visualization.project,
          token: this.state.sessionToken
        });
      }
    });
  }

  handleDrop = widget => {
    const widgets = this.state.visualization.widgets || [];

    const widgetKey = this.getNewWidgetKey();
    widgets[widgetKey] = widget;

    const visualization = Object.assign({}, this.state.visualization, { widgets });

    // this.increaseHeightWithWidget(widget);
    
    this.setState({ visualization });
  }

  widgetStatusChange(updated_widget, key) {
    // Widget changed internally, make changes effective then save them
    this.widgetChange(updated_widget, key, this.saveChanges);
  }

  widgetChange = (widget, index, callback = null) => {
    const widgets_update = {};
    widgets_update[index] =  widget;

    const new_widgets = Object.assign({}, this.state.visualization.widgets, widgets_update);

    const visualization = Object.assign({}, this.state.visualization, {
      widgets: new_widgets
    });

    // Check if the height needs to be increased, the section may have shrunk if not
    if (!this.increaseHeightWithWidget(widget)) {
      this.computeHeightWithWidgets(visualization.widgets);
    }

    this.setState({ visualization }, callback);
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
      dropZoneHeight:  maxHeight + 80
    });
  }
  
  editWidget = (widget, index) => {
    this.setState({ editModal: true, modalData: widget, modalIndex: index });
  }

  closeEdit(data) {
    if (data) {
      // save changes temporarily
      var widgets_update = {};
      widgets_update[this.state.modalIndex] = data;

      var new_widgets = Object.assign({}, this.state.visualization.widgets, widgets_update);

      var visualization = Object.assign({}, this.state.visualization, {
        widgets: new_widgets
      });

      this.setState({ editModal: false, visualization: visualization });
    } else {
      this.setState({ editModal: false });
    }
  }

  deleteWidget = (widget, index) => {
    delete this.state.visualization.widgets[index];

    const visualization = Object.assign({}, this.state.visualization, {
      widgets: this.state.visualization.widgets
    });

    this.setState({ visualization });
  }

  startEditing = () => {
    this.setState({ editing: true });
  }

  saveEditing = () => {
    // Provide the callback so it can be called when state change is applied
    // TODO: Check if callback is needed
    this.setState({ editing: false }, this.saveChanges );
  }

  saveChanges() {
    // Transform to a list
    const visualization = Object.assign({}, this.state.visualization, {
      widgets: this.transformToWidgetsList(this.state.visualization.widgets)
    });

    AppDispatcher.dispatch({
      type: 'visualizations/start-edit',
      data: visualization,
      token: this.state.sessionToken
    });
  }

  cancelEditing = () => {
    this.setState({ editing: false, visualization: {} });

    this.reloadVisualization();
  }

  setGrid = value => {
    const visualization = Object.assign({}, this.state.visualization, {
      grid: value
    });

    this.setState({ visualization });
  }

  pauseData = () => {
    this.setState({ paused: true });
  }

  unpauseData = () => {
    this.setState({ paused: false });
  }

  render() {
    const widgets = this.state.visualization.widgets;

    const boxClasses = classNames('section', 'box', { 'fullscreen-padding': this.props.isFullscreen });
    
    return (
      <div className={boxClasses} >
        <div className='section-header box-header'>
          <div className="section-title">
            <span>{this.state.visualization.name}</span>
          </div>

          <VisualizationButtonGroup 
            editing={this.state.editing}
            fullscreen={this.props.isFullscreen}
            paused={this.state.paused}
            onEdit={this.startEditing}
            onSave={this.saveEditing}
            onCancel={this.cancelEditing}
            onFullscreen={this.props.toggleFullscreen}
            onPause={this.pauseData}
            onUnpause={this.unpauseData}
          />
        </div>

        <div className="box box-content" onContextMenu={ (e) => e.preventDefault() }>
          {this.state.editing &&
            <WidgetToolbox grid={this.state.visualization.grid} onGridChange={this.setGrid} widgets={widgets} />
          }

          <WidgetArea widgets={widgets} editing={this.state.editing} grid={this.state.visualization.grid} onWidgetAdded={this.handleDrop}>
            {widgets != null && Object.keys(widgets).map(widgetKey => (
              <Widget
                key={widgetKey}
                data={widgets[widgetKey]}
                simulation={this.state.simulation}
                onWidgetChange={(w, k) => this.widgetChange(w, k)}
                onWidgetStatusChange={(w, k) => this.widgetStatusChange(w, k)}
                editing={this.state.editing}
                index={widgetKey}
                grid={this.state.visualization.grid}
                paused={this.state.paused}
              />
            ))}
          </WidgetArea>
          
          {/* TODO: Create only one context menu for all widgets */}
          {widgets != null && Object.keys(widgets).map(widgetKey => (
            <WidgetContextMenu key={widgetKey} index={widgetKey} widget={widgets[widgetKey]} onEdit={this.editWidget} onDelete={this.deleteWidget} onChange={this.widgetChange} />
          ))}

          <EditWidget sessionToken={this.state.sessionToken} show={this.state.editModal} onClose={(data) => this.closeEdit(data)} widget={this.state.modalData} simulationModels={this.state.simulationModels} files={this.state.files} />
        </div>
      </div>
    );
  }
}

export default Fullscreenable()(Container.create(Visualization, { withProps: true }));
