/**
 * File: simulators-data-manager.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 02.03.2017
 * Copyright: 2017, Institute for Automation of Complex Power Systems, EONERC
 *   This file is part of VILLASweb. All Rights Reserved. Proprietary and confidential.
 *   Unauthorized copying of this file, via any medium is strictly prohibited.
 **********************************************************************************/

import RestDataManager from './rest-data-manager';
import RestAPI from '../api/rest-api';
//import AppDispatcher from '../app-dispatcher';

class SimulatorsDataManager extends RestDataManager {
  constructor() {
    super('simulator', '/simulators');
  }

  isRunning(simulator) {
    RestAPI.get('http://localhost/nodes.json').then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
  }
}

export default new SimulatorsDataManager();
