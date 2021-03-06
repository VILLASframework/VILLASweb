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


import ArrayStore from '../common/array-store';
import WidgetsDataManager from './widgets-data-manager';

class WidgetStore extends ArrayStore {
  constructor() {
    super('widgets', WidgetsDataManager);
  }

  reduce(state, action) {
    switch (action.type) {

      case 'widgets/loaded':

        //WidgetsDataManager.loadFiles(action.token, action.data);
        // TODO make sure files of scenario are loaded
        return super.reduce(state, action);

      default:
        return super.reduce(state, action);

    }
  }

}

export default new WidgetStore();
