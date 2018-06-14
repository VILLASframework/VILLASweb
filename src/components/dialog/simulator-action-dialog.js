/**
 * File: simulator-action-dialog.js
 * Author: Steffen Vogel <stvogel@eonerc.rwth-aachen.de>
 * Date: 07.06.2018
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
import PropTypes from 'prop-types';
import { Grid, Row, Col, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import 'datejs';

import ParametersEditor from '../parameters-editor';
import Dialog from './dialog';

const offset = 10*1000;

class SimulatorActionDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            valid: false,
            when: new Date(Date.now() + offset)
        };
    }

    onClose = canceled => {
        if (canceled) {
            this.props.onClose();

            return;
        }

        this.props.onClose(this.state.when);
    }

    onReset = () => {
        this.setState({
            valid: true,
            when: new Date(Date.now() + offset)
        });
    }

    handleDateChange = event => {
        const date = this.state.when.toLocaleDateString();
        const when = new Date(date + ' ' + event.target.value);

        this.setState({ when });
    }

    handleStartParametersChange = startParameters => {
      this.setState({ parameters: startParameters });
    }

    render() {
        const min = new Date(Date.now() + offset);

        return <Dialog show={this.props.show} title='Simulator Action' buttonTitle='Run' onClose={this.onClose} onReset={this.onReset} valid={this.state.valid}>
            <form>
                <p>
                    <i>Enter execution time for the simulator action</i>
                </p>

                <FormGroup>
                    <ControlLabel>Action date</ControlLabel>
                    <Grid fluid={true}>
                        <Row>
                          <Col lg={6}>
                            <FormControl required type='date' value={this.state.when.toString('yyyy-MM-dd')} min={min.toString('yyyy-MM-dd')} onChange={this.handleChange} />
                          </Col>
                          <Col lg={6}>
                            <FormControl required type='time' value={this.state.when.toString('HH:mm:ss')} min={min.toString('HH:mm:ss')} onChange={this.handleChange} step={1} />
                          </Col>
                        </Row>
                    </Grid>
                </FormGroup>

                <FormGroup controlId='startParameters'>
                    <ControlLabel>Additional Start Parameters</ControlLabel>
                    <ParametersEditor onChange={this.handleStartParametersChange} />
                </FormGroup>

            </form>
        </Dialog>;
    }
}

SimulatorActionDialog.PropTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default SimulatorActionDialog;
