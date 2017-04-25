/**
 * File: dropzone.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 02.03.2017
 * Copyright: 2017, Institute for Automation of Complex Power Systems, EONERC
 *   This file is part of VILLASweb. All Rights Reserved. Proprietary and confidential.
 *   Unauthorized copying of this file, via any medium is strictly prohibited.
 **********************************************************************************/

import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';

const dropzoneTarget = {
  drop(props, monitor, component) {
    // get drop position
    var position = monitor.getSourceClientOffset();
    var dropzoneRect = component.wrapper.getBoundingClientRect();
    position.x -= dropzoneRect.left;
    position.y -= dropzoneRect.top;

    // Z-Index is one more the top most children
    let foundZ = props.children.reduce( (maxZ, currentChildren) => {
      // Is there a simpler way? Is not easy to expose a getter in a Container.create(Component)
      let widget = currentChildren.props.data;
      if (widget && widget.z) {
        if (widget.z > maxZ) {
          return widget.z;
        }
      }
      return maxZ;
    }, 0);
    position.z = foundZ >= 100? foundZ : ++foundZ;

    props.onDrop(monitor.getItem(), position);
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
}

class Dropzone extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    onDrop: PropTypes.func.isRequired
  };

  render() {
    var toolboxClass = classNames({
      'box-content': true,
      'toolbox-dropzone': true,
      'toolbox-dropzone-active': this.props.isOver && this.props.canDrop && this.props.editing,
      'toolbox-dropzone-editing': this.props.editing
    });

    return this.props.connectDropTarget(
      <div className={toolboxClass} style={{ height: this.props.height}} ref={wrapper => this.wrapper = wrapper}>
        {this.props.children}
      </div>
    );
  }
}

export default DropTarget('widget', dropzoneTarget, collect)(Dropzone);
