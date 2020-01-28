/**
 * File: table.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 14.03.2017
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
import { format } from 'd3';

import Table from '../../common/table';
import TableColumn from '../../common/table-column';

class WidgetTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rows: [],
      sequence: null,
      showUnit: false
    };
  }


  static getDerivedStateFromProps(props, state){
    if (props.simulationModel == null) {
      return{
        rows: [],
        sequence: null,
      };
    }

    const simulator = props.simulationModel.simulator;

    // check data
    if (props.data == null
      || props.data[simulator] == null
      || props.data[simulator].output == null
      || props.data[simulator].output.values.length === 0
      || props.data[simulator].output.values[0].length === 0) {

      // clear values
      return{
        rows: [],
        sequence: null,
        showUnit: false,
      };
    }

    // check if new data, otherwise skip
    /*if (state.sequence >= props.data[simulator.node][simulator.simulator].sequence) {
      return;
    }*/

    // get rows
    const rows = [];

    props.data[simulator].output.values.forEach((signal, index) => {
      if (index < props.simulationModel.outputMapping.length) {
        rows.push({
          name: props.simulationModel.outputMapping[index].name,
          unit: props.simulationModel.outputMapping[index].type,
          value: signal[signal.length - 1].y
        });
      }
    });

    return {
      showUnit: props.showUnit,
      rows: rows,
      sequence: props.data[simulator].output.sequence
    };
  }

  render() {
    var columns = [
      <TableColumn key={1} title="Signal" dataKey="name" width={120} />,
      <TableColumn key={2} title="Value" dataKey="value" modifier={format('.4s')} />
    ];

    if (this.props.widget.customProperties.showUnit)
      columns.push(<TableColumn key={3} title="Unit" dataKey="unit" />)

    return (
      <div className="table-widget">
        <Table data={this.state.rows}>
          { columns }
        </Table>
      </div>
    );
  }
}

export default WidgetTable;