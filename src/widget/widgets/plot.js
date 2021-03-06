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

import React from 'react';

import Plot from '../widget-plot/plot';
import PlotLegend from '../widget-plot/plot-legend';

class WidgetPlot extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      signals: []
    };
  }


  static getDerivedStateFromProps(props, state){

    let intersection = []
    let data = [];
    let signalID, sig;
    for (signalID of props.widget.signalIDs) {
      for (sig of props.signals) {
        if (signalID === sig.id) {
          intersection.push(sig);

          // sig is a selected signal, get data
          // determine ID of infrastructure component related to signal (via config)
          let icID = props.icIDs[sig.id]

          // distinguish between input and output signals
          if (sig.direction === "out") {
            if (props.data[icID] != null && props.data[icID].output != null && props.data[icID].output.values != null) {
              if (props.data[icID].output.values[sig.index-1] !== undefined) {
                let values = props.data[icID].output.values[sig.index-1];
                if(sig.scalingFactor !== 1) {
                  let scaledValues = JSON.parse(JSON.stringify(values));
                  for (let i=0; i< scaledValues.length; i++){
                    scaledValues[i].y = scaledValues[i].y * sig.scalingFactor;
                  }
                  data.push(scaledValues);
                } else {
                  data.push(values);
                }
              }
            }
          } else if (sig.direction === "in") {
            if (props.data[icID] != null && props.data[icID].input != null && props.data[icID].input.values != null) {
              if (props.data[icID].input.values[sig.index-1] !== undefined) {
                let values = props.data[icID].output.values[sig.index-1];
                if(sig.scalingFactor !== 1) {
                  let scaledValues = JSON.parse(JSON.stringify(values));
                  for (let i=0; i< scaledValues.length; i++){
                    scaledValues[i].y = scaledValues[i].y * sig.scalingFactor;
                  }
                  data.push(scaledValues);
                } else {
                  data.push(values);
                }
              }
            }
          }
        } // sig is selected signal
      } // loop over props.signals
    } // loop over selected signals

    return {signals: intersection, data: data}

  }


  scaleData(data, scaleFactor){
    // data is an array of value pairs x,y
  }

  render() {
    return <div className="plot-widget" ref="wrapper">
      <div className="widget-plot">
        <Plot
          data={this.state.data}
          height={this.props.widget.height - 55}
          width={this.props.widget.width - 20}
          time={this.props.widget.customProperties.time}
          yMin={this.props.widget.customProperties.yMin}
          yMax={this.props.widget.customProperties.yMax}
          yUseMinMax={this.props.widget.customProperties.yUseMinMax}
          paused={this.props.paused}
          yLabel={this.props.widget.customProperties.ylabel}
        />
      </div>
      <PlotLegend signals={this.state.signals} />
    </div>;
  }
}

export default WidgetPlot;
