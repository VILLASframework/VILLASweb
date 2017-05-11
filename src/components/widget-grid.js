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
    this.SVGembed = null;
    this.SVGembedLoadListener = () => this.svgLoaded();
    this.Viewer = null;

    this.state = {
      svg: null
    };
  }

  componentDidMount() {
    if (this.SVGembed) {
      // Alternative since 'onLoad' prop doesn't work
      this.SVGembed.addEventListener('load', this.SVGembedLoadListener);
      // Embed stylesheet
      console.log('embedding style');
      let svgDoc = this.SVGembed.ownerDocument;
      console.log('svgDoc: %o', svgDoc);
      let styleElement = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
      styleElement.textContent = "svg { fill: #fff }"; // add whatever you need here
      
      console.log('svgElement: %o', svgDoc.getElementById("svg"));
      svgDoc.getElementById("svg").appendChild(styleElement);
    }
  }

  componentWillUnmount() {
    if (this.SVGembed) {
      this.SVGembed.removeEventListener('load', this.SVGembedLoadListener);
    }
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
    console.log('componentDidUpdate');
    if (this.Viewer) {
      this.Viewer.fitToViewer();
    }
  }

  svgLoaded() {
    console.log('SVG loaded. Viewer: %o', this.Viewer);
    this.Viewer.fitToViewer();
  }

  render() {
    
    return (
      <div className="grid-widget full">
        {/*<button onClick={event => this.Viewer.zoomOnViewerCenter(1.1)}>Zoom in</button>
        <button onClick={event => this.Viewer.fitSelection(40, 40, 200, 200)}>Zoom area</button>
        <button onClick={event => this.Viewer.fitToViewer()}>Fit</button>
        
        <hr/>*/}
        
        {/*{ this.props.widget.file && 
          <embed  ref={ (domNode) => this.SVGembed = domNode } src={dataUrl} type="image/svg+xml" /> }*/}
          <ReactSVGPanZoom
            style={{outline: "1px solid black"}}
            detectAutoPan={false}
            width={this.props.widget.width-2} height={this.props.widget.height-2} ref={Viewer => this.Viewer = Viewer}
            onClick={event => console.log('click', event.x, event.y, event.originalEvent)}
            onMouseMove={event => console.log('move', event.x, event.y)} >
            <svg width={this.props.widget.width} height={this.props.widget.height}>
              <svg dangerouslySetInnerHTML={{__html: this.state.svg }}/>
            </svg>
            {/*<svg width={300} height={150}>
              <image ref={ (domNode) => this.SVGembed = domNode } x="10" y="20" width="80" height="80" xlinkHref={dataUrl} onLoad={ () => console.log('loaded svg image')}/>
            </svg>*/}
          </ReactSVGPanZoom>
        
      </div>
    );
  }
}

export default WidgetGrid;
