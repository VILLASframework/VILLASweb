/**
 * File: simulator-store.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 03.03.2018
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

import _ from 'lodash';

import ArrayStore from '../common/array-store';
import SimulatorsDataManager from './simulators-data-manager';
import SimulatorDataDataManager from './simulator-data-data-manager';

class SimulatorStore extends ArrayStore {
  constructor() {
    super('simulators', SimulatorsDataManager);
  }

  reduce(state, action) {
    switch(action.type) {
      case 'simulators/loaded':
        // connect to each simulator
        for (let simulator of action.data) {
          const endpoint = _.get(simulator, 'properties.endpoint') || _.get(simulator, 'rawProperties.endpoint');

          if (endpoint != null && endpoint !== '') {
            SimulatorDataDataManager.open(endpoint, simulator.id);
          } else {
            // console.warn('Endpoint not found for simulator at ' + endpoint);
            // console.log(simulator);
          }
        }

        return super.reduce(state, action);

      case 'simulators/edited':
        // connect to each simulator
        const simulator = action.data;
        const endpoint = _.get(simulator, 'properties.endpoint') || _.get(simulator, 'rawProperties.endpoint');

        if (endpoint != null && endpoint !== '') {
          console.log("Updating simulatorid " + simulator.id);
          SimulatorDataDataManager.update(endpoint, simulator.id);
        }

        return super.reduce(state, action);

      case 'simulators/fetched':
        return this.updateElements(state, [action.data]);

      case 'simulators/fetch-error':
        return state;

      case 'simulators/start-action':
        if (!Array.isArray(action.data))
          action.data = [ action.data ]

        SimulatorsDataManager.doActions(action.simulator, action.data, action.token);
        return state;

      case 'simulators/action-error':
        console.log(action.error);
        return state;

      default:
        return super.reduce(state, action);
    }
  }
}

export default new SimulatorStore();