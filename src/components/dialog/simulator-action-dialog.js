/**
 * File: simulator-action-dialog.js
 * Author: Ricardo Hernandez-Montoya <rhernandez@gridhound.de>
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
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

import Dialog from './dialog';

class SimulatorActionDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            valid: false,
            when: new Date()
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
        const now = new Date();

        this.setState({
            valid: true,
            when: new Date(now.getTime() + 3 * 60 * 1000)
        });
    }

    handleChange = event => {
        const date = new Date().toLocaleDateString();
        const when = new Date(date + ' ' + event.target.value);

        this.setState({ when });
    }

    render() {
        return <Dialog show={this.props.show} title='Simulator Action' buttonTitle='Run' onClose={this.onClose} onReset={this.onReset} valid={this.state.valid}>
            <form>
                <p>
                    <i>Enter execution time for the simulator action</i>
                </p>

                <FormGroup>
                    <ControlLabel>Action time</ControlLabel>
                    <FormControl required type='datetime-local' value={this.state.when.toLocaleTimeString()} min={new Date().toLocaleTimeString()} onChange={this.handleChange} />
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
