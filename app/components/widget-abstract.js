/**
 * File: widget-abstract.js
 * Author: Markus Grigull <mgrigull@eonerc.rwth-aachen.de>
 * Date: 15.07.2016
 * Copyright: 2016, Institute for Automation of Complex Power Systems, EONERC
 *   This file is part of VILLASweb. All Rights Reserved. Proprietary and confidential.
 *   Unauthorized copying of this file, via any medium is strictly prohibited.
 **********************************************************************************/

import Ember from 'ember';
import Resizable from '../mixins/resizable';
import Draggable from '../mixins/draggable';

export default Ember.Component.extend(Resizable, Draggable, {
  tagName: 'div',
  classNames: [ 'widgetAbstract' ],
  classNameBindings: [ 'widgetEditing' ],
  attributeBindings: [ 'style' ],

  widget: null,
  widgetEditing: true,
  editing: false,
  grid: false,
  data: null,

  disabled_resize: false,
  autoHide_resize: true,
  grid_resize: [ 10, 10 ],

  disabled_drag: false,
  containment_drag: 'parent',
  grid_drag: [ 10, 10 ],
  scroll_drag: true,

  style: Ember.computed('widget', function() {
    return Ember.String.htmlSafe('width: ' + this.get('widget.width') + 'px; height: ' + this.get('widget.height') + 'px; left: ' + this.get('widget.x') + 'px; top: ' + this.get('widget.y') + 'px;');
  }),

  name: Ember.computed('widget', function() {
    return this.get('widget.name');
  }),

  stop_resize(event, ui) {
    var width = ui.size.width;
    var height = ui.size.height;

    this.set('widget.width', width);
    this.set('widget.height', height);
  },

  resize_resize(/* event, ui */) {

  },

  stop_drag(event, ui) {
    this.set('widget.x', ui.position.left);
    this.set('widget.y', ui.position.top);
  },

  drag_drag(/* event, ui */) {

  },

  _updateUI: Ember.on('init', Ember.observer('editing', 'grid', 'isShowingModal', function() {
    if (this.get('editing') === true) {
      this.set('disabled_resize', false);
      //this.set('autoHide_resize', false);
      this.set('disabled_drag', false);

      this.set('widgetEditing', true);
    } else {
      this.set('disabled_resize', true);
      //this.set('autoHide_resize', true);
      this.set('disabled_drag', true);

      this.set('widgetEditing', false);
    }

    if (this.get('grid') === true) {
      this.set('grid_resize', [ 10, 10 ]);
      this.set('grid_drag', [ 10, 10 ]);
    } else {
      this.set('grid_resize', false);
      this.set('grid_drag', false);
    }
  })),

  /*doubleClick() {
    if (this.get('editing')) {
      this.sendAction('showPlotDialog', this.get('plot'));
    }
  }*/
});