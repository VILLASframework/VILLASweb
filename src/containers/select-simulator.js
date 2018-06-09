/**
 * File: select-simulator.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 10.05.2018
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
import { FormGroup, FormControl, ControlLabel, Col } from 'react-bootstrap';
import _ from 'lodash';

import SimulatorStore from '../stores/simulator-store';

class SelectSimulator extends React.Component {
    static getStores() {
        return [ SimulatorStore ];
    }

    static calculateState() {
        return {
            simulators: SimulatorStore.getState(),
            selectedSimulator: ''
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value === this.state.selectedSimulator) {
            return;
        }

        let selectedSimulator = nextProps.value;
        if (selectedSimulator == null) {
            if (this.state.simulators.length > 0) {
                selectedSimulator = this.state.simulators[0]._id;
            } else {
                selectedSimulator = '';
            }
        }

        this.setState({ selectedSimulator });
    }

    handleChange = event => {
        this.setState({ selectedSimulator: event.target.value });

        // send complete simulator to callback
        if (this.props.onChange != null) {
            const simulator = this.state.simulators.find(s => s._id === event.target.value);

            this.props.onChange(simulator);
        }
    }

    render() {
        const simulatorOptions = this.state.simulators.map(s => 
            <option key={s._id} value={s._id}>{_.get(s, 'properties.name') || _.get(s, 'rawProperties.name') || s.uuid}</option>
        );

        return <FormGroup>
            <Col componentClass={ControlLabel} sm={3} md={2}>
                Simulator
            </Col>

            <Col sm={9} md={10}>
                <FormControl componentClass='select' placeholder='Select simulator' value={this.state.selectedSimulator} onChange={this.handleChange}>
                    {simulatorOptions}
                </FormControl>
            </Col>
        </FormGroup>;
    }
}

export default Container.create(SelectSimulator);
