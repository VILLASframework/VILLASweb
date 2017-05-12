/**
 * File: widget-grid.js
 * Author: Ricardo Hernandez-Montoya <rhernandez@gridhound.de>
 * Date: 08.05.2017
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
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';

import AppDispatcher from '../app-dispatcher';
import 'CoSi_Front-End/css/svg-basic.css'

class WidgetGrid extends Component {
  constructor(props) {
    super(props);
    this.Viewer = null;

    this.state = {
      svg: null
    };
  }
  
  componentWillReceiveProps(nextProps) {

    if (nextProps.grids && nextProps.widget.file) {
      let thisGrid = nextProps.grids.find( grid => grid._id === nextProps.widget.file );
      if (thisGrid) {
        this.setState( { svg: thisGrid.svg });
      } else {
        AppDispatcher.dispatch({
          type: 'grids/start-load',
          data: nextProps.widget.file
        });
      }
    }
  }

  componentDidUpdate() {
    if (this.Viewer) {
      this.Viewer.fitToViewer();
    }
  }

  onGridElementClick(e) {
    const elements = ['line', 'text', 'image', 'box'];
    if (elements.includes(e.target.nodeName)) {
      console.log('Element %o with id %o was clicked', e.target.nodeName, e.target.id);
    }
  }

  render() {
    // ReactSVGPanZoom requires an SVG element at init for its own controls, hence the need to nest another SVG
    return (
      <div className="grid-widget full">
        <ReactSVGPanZoom
          style={{outline: "1px solid black"}}
          detectAutoPan={false}
          onClick={e => this.onGridElementClick(e.originalEvent.nativeEvent) }
          width={this.props.widget.width-2} height={this.props.widget.height-2} ref={Viewer => this.Viewer = Viewer} >
          <svg width={this.props.widget.width} height={this.props.widget.height}>
            <svg dangerouslySetInnerHTML={{__html: this.state.svg }} />
          </svg>
        </ReactSVGPanZoom>
      </div>
    );
  }
}

export default WidgetGrid;
