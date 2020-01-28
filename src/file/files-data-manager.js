/**
 * File: files-data-manager.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 16.03.2017
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

import RestDataManager from '../common/data-managers/rest-data-manager';
import RestAPI from '../common/api/rest-api';
import AppDispatcher from '../common/app-dispatcher';

class FilesDataManager extends RestDataManager {
  constructor() {
    super('file', '/files');
  }

  upload(file, token = null, progressCallback = null, finishedCallback = null) {
    RestAPI.upload(this.makeURL('/upload'), file, token, progressCallback).then(response => {

      AppDispatcher.dispatch({
        type: 'files/uploaded',
      });

      // Trigger a files reload
      AppDispatcher.dispatch({
        type: 'files/start-load',
        token
      });

      if (finishedCallback) {
        finishedCallback();
      }
    }).catch(error => {
      AppDispatcher.dispatch({
        type: 'files/upload-error',
        error
      });
    });
  }
}

export default new FilesDataManager();