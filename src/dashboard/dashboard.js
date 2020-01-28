/**
 * File: dashboard.js
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

import React, {Component} from 'react';
import { Container } from 'flux/utils';
import Fullscreenable from 'react-fullscreenable';
import classNames from 'classnames';

import Widget from '../widget/widget';
import EditWidget from '../widget/edit-widget';

import WidgetContextMenu from './widget-context-menu';
import WidgetToolbox from './widget-toolbox';
import WidgetArea from './widget-area';
import DashboardButtonGroup from './dashboard-button-group';

import LoginStore from '../user/login-store';
import DashboardStore from './dashboard-store';
import ProjectStore from '../project/project-store';
import SimulationStore from '../simulation/simulation-store';
import SimulationModelStore from '../simulationmodel/simulation-model-store';
import FileStore from '../file/file-store';
import WidgetStore from '../widget/widget-store';
import AppDispatcher from '../common/app-dispatcher';

import 'react-contexify/dist/ReactContexify.min.css';

class Dashboard extends Component {

  static lastWidgetKey = 0;
  static getStores() {
    return [ DashboardStore, ProjectStore, SimulationStore, SimulationModelStore, FileStore, LoginStore, WidgetStore ];
  }

  static calculateState(prevState, props) {
    if (prevState == null) {
      prevState = {};
    }
    const sessionToken = LoginStore.getState().token;

    let dashboard = DashboardStore.getState().find(d => d.id === parseInt(props.match.params.dashboard, 10));
    if (dashboard == null){
      AppDispatcher.dispatch({
        type: 'dashboards/start-load',
        data: props.match.params.dashboard,
        token: sessionToken
      });
    }

    // obtain all widgets of a dashboard
    let widgets = WidgetStore.getState().filter(w => w.dashboardID === parseInt(props.match.params.dashboard, 10));

    // compute max y coordinate
    let maxHeight = null;
    maxHeight = Object.keys(widgets).reduce( (maxHeightSoFar, widgetKey) => {
      let thisWidget = widgets[widgetKey];
      let thisWidgetHeight = thisWidget.y + thisWidget.height;

      return thisWidgetHeight > maxHeightSoFar? thisWidgetHeight : maxHeightSoFar;
    }, 0);

    let simulationModels = [];
    //if (prevState.simulation != null) {
    //  simulationModels = SimulationModelStore.getState().filter(m => prevState.simulation.models.includes(m._id));
    //}

    return {
      dashboard,
      widgets,
      simulationModels,
      sessionToken: sessionToken,
      files: null,

      editing: prevState.editing || false,
      paused: prevState.paused || false,

      editModal:  false,
      modalData:  null,
      modalIndex:  null,
      widgetChangeData: [],
      widgetAddData:[],

      maxWidgetHeight: maxHeight || null,
      dropZoneHeight: maxHeight +80 || null,
    };

  }


  static getNewWidgetKey() {
    const widgetKey = this.lastWidgetKey;
    this.lastWidgetKey++;

    return widgetKey;
  }

//!!!won't work anymore
  componentDidMount() {

    // load widgets of dashboard
    AppDispatcher.dispatch({
      type: 'widgets/start-load',
      token: this.state.sessionToken,
      param: '?dashboardID=' + this.state.dashboard.id
    });


  }

  handleKeydown(e) {
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

  transformToWidgetsList(widgets) {
    return Object.keys(widgets).map( (key) => widgets[key]);
  }

  handleDrop(widget) {
    widget.dashboardID = this.state.dashboard.id;

    AppDispatcher.dispatch({
      type: 'widgets/start-add',
      token: this.state.sessionToken,
      data: widget
    });

    let tempChanges = this.state.widgetAddData;
    tempChanges.push(widget);

    this.setState({ widgetAddData: tempChanges})
    /*let widgets = [];
    widgets = this.state.dashboard.get('widgets');

    const widgetKey = Dashboard.getNewWidgetKey();
    widgets[widgetKey] = widget;

    const dashboard = this.state.dashboard.set('widgets',widgets);

    // this.increaseHeightWithWidget(widget);

    this.setState({ dashboard });*/
  };


  widgetStatusChange(updated_widget, key) {
    // Widget changed internally, make changes effective then save them
    this.widgetChange(updated_widget, key, this.saveChanges);
  }

  widgetChange(widget, index, callback = null){

    let tempChanges = this.state.widgetChangeData;
    tempChanges.push(widget);

    this.setState({ widgetChangeData: tempChanges})

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


  editWidget(widget, index){
    this.setState({ editModal: true, modalData: widget, modalIndex: index });
  };


  closeEdit(data){

    if (data == null) {
      this.setState({ editModal: false });

      return;
    }

    AppDispatcher.dispatch({
      type: 'widgets/start-edit',
      token: this.state.sessionToken,
      data: data
    });

    this.setState({ editModal: false });
  };


  deleteWidget(widget, index) {
    /*const widgets = this.state.dashboard.get('widgets');
    delete widgets[index];

    const dashboard = this.state.dashboard.set('widgets');

    this.setState({ dashboard });*/
    AppDispatcher.dispatch({
      type: 'widgets/start-remove',
      data: widget,
      token: this.state.sessionToken
    });
  };


  startEditing(){
    this.setState({ editing: true });
  };

  saveEditing() {
    // Provide the callback so it can be called when state change is applied
    // TODO: Check if callback is needed


    this.state.widgetChangeData.forEach( widget => {
      AppDispatcher.dispatch({
        type: 'widgets/start-edit',
        token: this.state.sessionToken,
        data: widget
      });
    });
    this.setState({ editing: false });
  };

  saveChanges() {
    // Transform to a list
    const dashboard = Object.assign({}, this.state.dashboard.toJS(), {
        widgets: this.transformToWidgetsList(this.state.widgets)
      });

    AppDispatcher.dispatch({
      type: 'dashboards/start-edit',
      data: dashboard,
      token: this.state.sessionToken
    });
  }

  cancelEditing() {
    console.log("cancelEditing the add data: ");
    console.log(this.state.widgetAddData);
    this.state.widgetAddData.forEach( widget => {
      AppDispatcher.dispatch({
        type: 'widgets/start-remove',
        data: widget,
        token: this.state.sessionToken
      });
    });
    AppDispatcher.dispatch({
      type: 'widgets/start-load',
      token: this.state.sessionToken,
      param: '?dashboardID=1'
    });
    this.setState({ editing: false, widgetChangeData: [], widgetAddData: [] });

  };

  setGrid(value) {
    const dashboard = this.state.dashboard.set('grid', value);

    this.setState({ dashboard });
  };

  pauseData(){
    this.setState({ paused: true });
  };

  unpauseData() {
    this.setState({ paused: false });
  };


  render() {
    const grid = this.state.dashboard.grid;
    const boxClasses = classNames('section', 'box', { 'fullscreen-padding': this.props.isFullscreen });
    let draggable = this.state.editing;
    return <div className={boxClasses} >
      <div className='section-header box-header'>
        <div className="section-title">
          <span>{this.state.dashboard.name}</span>
        </div>

        <DashboardButtonGroup
          editing={this.state.editing}
          onEdit={this.startEditing.bind(this)}
          fullscreen={this.props.isFullscreen}
          paused={this.state.paused}
          onSave={this.saveEditing.bind(this)}
          onCancel={this.cancelEditing.bind(this)}
          onFullscreen={this.props.toggleFullscreen}
          onPause={this.pauseData.bind(this)}
          onUnpause={this.unpauseData.bind(this)}
        />
      </div>

      <div className="box box-content" onContextMenu={ (e) => e.preventDefault() }>
        {this.state.editing &&
        <WidgetToolbox grid={grid} onGridChange={this.setGrid.bind(this)} widgets={this.state.widgets} />
        }
        {!draggable?(
        <WidgetArea widgets={this.state.widgets} editing={this.state.editing} grid={grid} onWidgetAdded={this.handleDrop.bind(this)}>
          {this.state.widgets != null && Object.keys(this.state.widgets).map(widgetKey => (
            <WidgetContextMenu
            key={widgetKey}
            index={parseInt(widgetKey,10)}
            widget={this.state.widgets[widgetKey]}
            onEdit={this.editWidget.bind(this)}
            onDelete={this.deleteWidget.bind(this)}
            onChange={this.widgetChange.bind(this)}

            onWidgetChange={this.widgetChange.bind(this)}
            onWidgetStatusChange={this.widgetStatusChange.bind(this)}
            editing={this.state.editing}
            grid={grid}
            paused={this.state.paused}
            />


          ))}
        </WidgetArea>
        ) : (
          <WidgetArea widgets={this.state.widgets} editing={this.state.editing} grid={grid} onWidgetAdded={this.handleDrop.bind(this)}>
          {this.state.widgets != null && Object.keys(this.state.widgets).map(widgetKey => (
            <Widget
              key={widgetKey}
              data={this.state.widgets[widgetKey]}
              onWidgetChange={this.widgetChange.bind(this)}
              onWidgetStatusChange={this.widgetStatusChange.bind(this)}
              editing={this.state.editing}
              index={parseInt(widgetKey,10)}
              grid={grid}
              paused={this.state.paused}
            />

          ))}
        </WidgetArea>

        )}

        <EditWidget sessionToken={this.state.sessionToken} show={this.state.editModal} onClose={this.closeEdit.bind(this)} widget={this.state.modalData} simulationModels={this.state.simulationModels} files={this.state.files} />


      </div>
    </div>;
  }
}


let fluxContainerConverter = require('../common/FluxContainerConverter');
export default Fullscreenable()(Container.create(fluxContainerConverter.convert(Dashboard), { withProps: true }));