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

import AppDispatcher from '../app-dispatcher';
import UserStore from '../stores/user-store';
import SimulatorDataStore from '../stores/simulator-data-store';
import SimulationModelStore from '../stores/simulation-model-store';
import FileStore from '../stores/file-store';

import EditableWidgetContainer from '../components/editable-widget-container';
import WidgetContainer from '../components/widget-container';

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
        let simulatorData = {};

        if (props.paused) {
            if (prevState && prevState.simulatorData) {
                simulatorData = JSON.parse(JSON.stringify(prevState.simulatorData));
            }
        } else {
            simulatorData = SimulatorDataStore.getState();
        }

        return {
            simulatorData,
            files: FileStore.getState(),
            simulationModels: SimulationModelStore.getState(),

            sequence: prevState != null ? prevState.sequence + 1 : 0,

            sessionToken: UserStore.getState().token
        };
    }

    componentWillMount() {
        if (this.state.sessionToken == null) {
            return;
        }

        AppDispatcher.dispatch({
            type: 'files/start-load',
            token: this.state.sessionToken
        });

        AppDispatcher.dispatch({
            type: 'simulationModels/start-load',
            token: this.state.sessionToken
        });
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

    createWidget(widget) {
      let simulationModel = null;

      for (let model of this.state.simulationModels) {
          if (model._id !== widget.simulationModel) {
              continue;
          }

          simulationModel = model;
      }

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
          return <WidgetSlider widget={widget} editing={this.props.editing} simulationModel={simulationModel} onWidgetChange={(w) => this.props.onWidgetStatusChange(w, this.props.index) } onInputChanged={value => this.inputDataChanged(widget, value)} />
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
        const element = this.createWidget(this.props.data);

        if (this.props.editing) {
            return <EditableWidgetContainer widget={this.props.data} grid={this.props.grid} index={this.props.index}>
                {element}
            </EditableWidgetContainer>;
        }

        return <WidgetContainer widget={this.props.data}>
            {element}
        </WidgetContainer>;
    }
}

export default Container.create(Widget, { withProps: true });
