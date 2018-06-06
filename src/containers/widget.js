/**
 * File: widget.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 04.03.2017
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
import { ContextMenuProvider } from 'react-contexify';
import Rnd from 'react-rnd';
import classNames from 'classnames';

import AppDispatcher from '../app-dispatcher';
import UserStore from '../stores/user-store';
import SimulatorDataStore from '../stores/simulator-data-store';
import SimulationModelStore from '../stores/simulation-model-store';
import FileStore from '../stores/file-store';

import WidgetLamp from '../components/widget-lamp';
import WidgetValue from '../components/widget-value';
import WidgetPlot from '../components/widget-plot';
import WidgetTable from '../components/widget-table';
import WidgetLabel from '../components/widget-label';
import WidgetPlotTable from '../components/widget-plot-table';
import WidgetImage from '../components/widget-image';
import WidgetButton from '../components/widget-button';
import WidgetNumberInput from '../components/widget-number-input';
import WidgetSlider from '../components/widget-slider';
import WidgetGauge from '../components/widget-gauge';
import WidgetBox from '../components/widget-box';
import WidgetHTML from '../components/widget-html';
import WidgetTopology from '../components/widget-topology';

import '../styles/widgets.css';

class Widget extends React.Component {
  static getStores() {
    return [ SimulatorDataStore, SimulationModelStore, FileStore, UserStore ];
  }

  static calculateState(prevState, props) {
    const sessionToken = UserStore.getState().token;

    let simulatorData = {};

    if (props.paused) {
      if (prevState && prevState.simulatorData) {
        simulatorData = JSON.parse(JSON.stringify(prevState.simulatorData));
      }
    } else {
      simulatorData = SimulatorDataStore.getState();
    }

    if (prevState) {
      return {
        sessionToken,
        simulatorData,
        files: FileStore.getState(),
        sequence: prevState.sequence + 1,

        simulationModels: SimulationModelStore.getState()
      };
    } else {
      return {
        sessionToken,
        simulatorData,
        files: FileStore.getState(),
        sequence: 0,

        simulationModels: SimulationModelStore.getState()
      };
    }
  }

  constructor(props) {
    super(props);

    // Reference to the context menu element
    this.contextMenuTriggerViaDraggable = null;
  }

  componentWillMount() {
    // If loading for the first time
    if (this.state.sessionToken) {
      AppDispatcher.dispatch({
        type: 'files/start-load',
        token: this.state.sessionToken
      });

      AppDispatcher.dispatch({
        type: 'simulationModels/start-load',
        token: this.state.sessionToken
      });
    }
  }

  snapToGrid(value) {
    if (this.props.grid === 1)
      return value;

    return Math.round(value / this.props.grid) * this.props.grid;
  }

  drag(event, data) {
    const x = this.snapToGrid(data.x);
    const y = this.snapToGrid(data.y);

    if (x !== data.x || y !== data.y) {
      this.rnd.updatePosition({ x, y });
    }
  }

  dragStop(event, data) {
    // update widget
    let widget = this.props.data;
    widget.x = this.snapToGrid(data.x);
    widget.y = this.snapToGrid(data.y);

    this.props.onWidgetChange(widget, this.props.index);
  }

  resizeStop(direction, delta, event) {
    // update widget
    let widget = Object.assign({}, this.props.data);

    // resize depends on direction
    if (direction === 'left' || direction === 'topLeft' || direction === 'bottomLeft') {
      widget.x -= delta.width;
    }

    if (direction === 'top' || direction === 'topLeft' || direction === 'topRight') {
      widget.y -= delta.height;
    }

    widget.width += delta.width;
    widget.height += delta.height;

    this.props.onWidgetChange(widget, this.props.index);
  }

  borderWasClicked(e) {
    // check if it was triggered by the right button
    if (e.button === 2) {
      // launch the context menu using the reference
      if(this.contextMenuTriggerViaDraggable) {
          this.contextMenuTriggerViaDraggable.handleContextClick(e);
      }
    }
  }

  inputDataChanged(widget, data) {
    let simulationModel = null;

    for (let model of this.state.simulationModels) {
      if (model._id !== widget.simulationModel) {
        continue;
      }

      simulationModel = model;
    }

    AppDispatcher.dispatch({
      type: 'simulatorData/inputChanged',
      simulator: simulationModel.simulator,
      signal: widget.signal,
      data
    });
  }

  createWidget(widget, simulationModel) {
    if (widget.type === 'Lamp') {
      return <WidgetLamp widget={widget} data={this.state.simulatorData} dummy={this.state.sequence} simulationModel={simulationModel} />
    } else if (widget.type === 'Value') {
      return <WidgetValue widget={widget} data={this.state.simulatorData} dummy={this.state.sequence} simulationModel={simulationModel} />
    } else if (widget.type === 'Plot') {
      return <WidgetPlot widget={widget} data={this.state.simulatorData} dummy={this.state.sequence} simulationModel={simulationModel} paused={this.props.paused} />
    } else if (widget.type === 'Table') {
      return <WidgetTable widget={widget} data={this.state.simulatorData} dummy={this.state.sequence} simulationModel={simulationModel} />
    } else if (widget.type === 'Label') {
      return <WidgetLabel widget={widget} />
    } else if (widget.type === 'PlotTable') {
      return <WidgetPlotTable widget={widget} data={this.state.simulatorData} dummy={this.state.sequence} simulationModel={simulationModel} editing={this.props.editing} onWidgetChange={(w) => this.props.onWidgetStatusChange(w, this.props.index)} paused={this.props.paused} />
    } else if (widget.type === 'Image') {
      return <WidgetImage widget={widget} files={this.state.files} token={this.state.sessionToken} />
    } else if (widget.type === 'Button') {
      return <WidgetButton widget={widget} editing={this.props.editing} />
    } else if (widget.type === 'NumberInput') {
      return <WidgetNumberInput widget={widget} editing={this.props.editing} simulationModel={simulationModel} />
    } else if (widget.type === 'Slider') {
      return <WidgetSlider widget={widget} editing={this.props.editing} simulationModel={simulationModel} onWidgetChange={(w) => this.props.onWidgetStatusChange(w, this.props.index) } onInputChanged={(value) => this.inputDataChanged(widget, value)} />
    } else if (widget.type === 'Gauge') {
      return <WidgetGauge widget={widget} data={this.state.simulatorData} editing={this.props.editing} simulationModel={simulationModel} />
    } else if (widget.type === 'Box') {
      return <WidgetBox widget={widget} editing={this.props.editing} />
    } else if (widget.type === 'HTML') {
      return <WidgetHTML widget={widget} editing={this.props.editing} />
    } else if (widget.type === 'Topology') {
      return <WidgetTopology widget={widget} files={this.state.files} />
    }

    return null;
  }

  render() {
    // configure grid
    const grid = [this.props.grid, this.props.grid];

    // get widget element
    const widget = this.props.data;
    let borderedWidget = false;

    let simulationModel = null;

    for (let model of this.state.simulationModels) {
      if (model._id !== widget.simulationModel) {
        continue;
      }

      simulationModel = model;
    }

    const element = this.createWidget(widget, simulationModel);

    const widgetClasses = classNames({
      'widget': !this.props.editing,
      'editing-widget': this.props.editing,
      'border': borderedWidget,
      'unselectable': false,
      'locked': widget.locked && this.props.editing
    });

    if (this.props.editing) {
      const resizing = { bottom: !widget.locked, bottomLeft: !widget.locked, bottomRight: !widget.locked, left: !widget.locked, right: !widget.locked, top: !widget.locked, topLeft: !widget.locked, topRight: !widget.locked};

      return (
        <Rnd
          ref={c => { this.rnd = c; }}
          default={{ x: Number(widget.x), y: Number(widget.y), width: widget.width, height: widget.height }}
          minWidth={widget.minWidth}
          minHeight={widget.minHeight}
          lockAspectRatio={Boolean(widget.lockAspect)}
          bounds={'parent'}
          className={ widgetClasses }
          onResizeStart={(event, direction, ref) => this.borderWasClicked(event)}
          onResizeStop={(event, direction, ref, delta) => this.resizeStop(direction, delta, event)}
          onDrag={(event, data) => this.drag(event, data)}
          onDragStop={(event, data) => this.dragStop(event, data)}
          dragGrid={grid}
          resizeGrid={grid}
          zIndex={widget.z}
          enableResizing={resizing}
          disableDragging={widget.locked}
        >
          <ContextMenuProvider id={'widgetMenu' + this.props.index}>
            {element}
          </ContextMenuProvider>
        </Rnd>
      );
    } else {
      return (
        <div className={ widgetClasses } style={{ width: Number(widget.width), height: Number(widget.height), left: Number(widget.x), top: Number(widget.y), 'zIndex': Number(widget.z), position: 'absolute' }}>
          {element}
        </div>
      );
    }
  }
}

export default Container.create(Widget, { withProps: true });
