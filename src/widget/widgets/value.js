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
import { format } from 'd3';

class WidgetValue extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      unit: ''
    };
  }

  static getDerivedStateFromProps(props, state){
    if(props.widget.signalIDs.length === 0){
      return null;
    }

    // get the signal with the selected signal ID
    let signalID = props.widget.signalIDs[0];
    let signal = props.signals.filter(s => s.id === signalID)
    // determine ID of infrastructure component related to signal[0] (there is only one signal for a value widget)
    let icID = props.icIDs[signal[0].id];

    // check if data available
    let value = ''
    if (props.data == null || props.data[icID] == null || props.data[icID].output == null || props.data[icID].output.values == null) {
      value = '';
    } else {
      // check if value has changed
      const data = props.data[icID].output.values[signal[0].index - 1];
      if (data != null && Number(state.value) !== data[data.length - 1].y) {
        value = signal[0].scalingFactor * data[data.length - 1].y;
      }
    }

    // Update unit (assuming there is exactly one signal for this widget)
    let unit = '';
    if(signal !== undefined){
      unit = signal[0].unit;
    }

    return {
      value: value,
      unit: unit,
    };

  }

  render() {
    let value_to_render = Number(this.state.value);
    let value_width = this.props.widget.customProperties.textSize*(Math.abs(value_to_render) < 1000 ? (5):(8));
    let unit_width = this.props.widget.customProperties.textSize*(this.state.unit.length + 0.7);
    return (
      <div className="single-value-widget">
        <strong style={{ fontSize: this.props.widget.customProperties.textSize + 'px', flex: '1 1 auto'}}>{this.props.widget.name}</strong>
        <span style={{ fontSize: this.props.widget.customProperties.textSize + 'px', flex: 'none', width: value_width}}>{Number.isNaN(value_to_render) ? NaN : format('.3f')(value_to_render)}</span>
        {this.props.widget.customProperties.showUnit &&
          <span style={{ fontSize: this.props.widget.customProperties.textSize + 'px', flex: 'none',  width: unit_width}}>[{this.state.unit}]</span>
        }
      </div>
    );
  }
}

export default WidgetValue;
