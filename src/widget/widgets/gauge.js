/**
 * File: gauge.js
 * Author: Ricardo Hernandez-Montoya <rhernandez@gridhound.de>
 * Date: 31.03.2017
 * Copyright: 2018, Institute for Automation of Complex Power Systems, EONERC
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
import { Gauge } from 'gaugeJS';
//import {update} from "immutable";

class WidgetGauge extends Component {
  constructor(props) {
    super(props);

    this.gaugeCanvas = null;
    this.gauge = null;

    this.state = {
      value: 0,
      minValue: null,
      maxValue: null,
    };
  }

  componentDidMount() {
    this.gauge = new Gauge(this.gaugeCanvas).setOptions(this.computeGaugeOptions(this.props.widget));
    //this.gauge.maxValue = this.state.maxValue;
    //this.gauge.setMinValue(this.state.minValue);
    this.gauge.animationSpeed = 30;
    //this.gauge.set(this.state.value);

    //this.updateLabels(this.state.minValue, this.state.maxValue);
  }

  componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS): void {
    if(prevState.minValue !== this.state.minValue){
      this.gauge.setMinValue(this.state.minValue);
    }
    if(prevState.maxValue !== this.state.maxValue){
      this.gauge.maxValue = this.state.maxValue
    }

    // update gauge's value
    if(prevState.value !== this.state.value){
      this.gauge.set(this.state.value)
    }

    // update labels
    if(prevState.minValue !== this.state.minValue || prevState.maxValue !== this.state.maxValue){
      this.updateLabels(this.state.minValue, this.state.maxValue)
    }

  }

  static getDerivedStateFromProps(props, state){
    if (props.simulationModel == null) {
      return{value:0};
    }

    const simulator = props.simulationModel.simulator;

    // update value
    if (props.data == null
      || props.data[simulator] == null
      || props.data[simulator].output == null
      || props.data[simulator].output.values == null
      || props.data[simulator].output.values.length === 0
      || props.data[simulator].output.values[0].length === 0) {
      return{value:0};
    }

    // memorize if min or max value is updated
    let updateValue = false;
    let updateMinValue = false;
    let updateMaxValue = false;

    // check if value has changed
    const signal = props.data[simulator].output.values[props.widget.customProperties.signal];
    // Take just 3 decimal positions
    // Note: Favor this method over Number.toFixed(n) in order to avoid a type conversion, since it returns a String
    if (signal != null) {
      const value = Math.round(signal[signal.length - 1].y * 1e3) / 1e3;
      let minValue = null;
      let maxValue = null;
      if (state.value !== value && value != null) {
        //value has changed
        updateValue = true;

        // update min-max if needed
        let updateLabels = false;

        minValue = state.minValue;
        maxValue = state.maxValue;

        if (minValue == null) {
          minValue = value - 0.5;
          updateLabels = true;
          updateMinValue = true;
        }

        if (maxValue == null) {
          maxValue = value + 0.5;
          updateLabels = true;
          updateMaxValue = true;
        }

        if (props.widget.customProperties.valueUseMinMax) {
          if (state.minValue > props.widget.customProperties.valueMin) {
            minValue = props.widget.customProperties.valueMin;
            updateMinValue = true;
            updateLabels = true;
          }

          if (state.maxValue < props.widget.customProperties.valueMax) {
            maxValue = props.widget.customProperties.valueMax;
            updateMaxValue = true;
            updateLabels = true;
          }
        }

        if (updateLabels === false) {
          // check if min/max changed
          if (minValue > state.gauge.minValue) {
            minValue = state.gauge.minValue;
            updateMinValue = true;
          }

          if (maxValue < state.gauge.maxValue) {
            maxValue = state.gauge.maxValue;
            updateMaxValue = true;
          }
        }
      }

      // prepare returned state
      let returnState = null;
      if(updateValue === true){
        returnState["value"] = value;
      }
      if(updateMinValue === true){
        returnState["minValue"] = minValue;
      }
      if(updateMaxValue === true){
        returnState["maxValue"] = maxValue;
      }

      return returnState
    } // if there is a signal


  }

  updateLabels(minValue, maxValue, force) {
    // calculate labels
    const labels = [];
    const labelCount = 5;
    const labelStep = (maxValue - minValue) / (labelCount - 1);

    for (let i = 0; i < labelCount; i++) {
      labels.push(minValue + labelStep * i);
    }

    // calculate zones
    let zones = this.props.widget.customProperties.colorZones ? this.props.widget.customProperties.zones : null;
    if (zones != null) {
      // adapt range 0-100 to actual min-max
      const step = (maxValue - minValue) / 100;

      zones = zones.map(zone => {
        return Object.assign({}, zone, { min: (zone.min * step) + +minValue, max: zone.max * step + +minValue, strokeStyle: '#' + zone.strokeStyle });
      });
    }

    this.gauge.setOptions({
      staticLabels: {
        font: '10px "Helvetica Neue"',
        labels,
        color: "#000000",
        fractionDigits: 1
      },
      staticZones: zones
    });
  }

  computeGaugeOptions(widget) {
    return {
      angle: -0.25,
      lineWidth: 0.2,
      pointer: {
          length: 0.6,
          strokeWidth: 0.035
      },
      radiusScale: 0.8,
      colorStart: '#6EA2B0',
      colorStop: '#6EA2B0',
      strokeColor: '#E0E0E0',
      highDpiSupport: true,
      limitMax: false,
      limitMin: false
    };
  }

  render() {
    const componentClass = this.props.editing ? "gauge-widget editing" : "gauge-widget";
    let signalType = null;

    if (this.props.simulationModel != null) {
      signalType = (this.props.simulationModel != null && this.props.simulationModel.outputLength > 0 && this.props.widget.customProperties.signal < this.props.simulationModel.outputLength) ? this.props.simulationModel.outputMapping[this.props.widget.customProperties.signal].type : '';
    }

    return (
      <div className={componentClass}>
          <div className="gauge-name">{this.props.widget.name}</div>
          <canvas ref={node => this.gaugeCanvas = node} />
          <div className="gauge-unit">{signalType}</div>
          <div className="gauge-value">{this.state.value}</div>
      </div>
    );
  }
}

export default WidgetGauge;