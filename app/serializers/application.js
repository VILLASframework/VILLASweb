import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  normalizeFindAllResponse: function(store, primaryModelClass, payload, id, requestType) {
    var json = { data: [] };

    var _this = this;

    this._normalizePayload(payload, function(item) {
      if (item.type === 'entity') {
        json.data.push(item);
      } else if (item.type === 'property') {
        _this._updateProperty(item);
      }

      return true;
    });

    return json;
  },

  normalizeFindRecordResponse: function(store, primaryModelClass, payload, id, requestType) {
    var json = { data: {} };

    var _this = this;

    this._normalizePayload(payload, function(item) {
      if (item.type === 'entity') {
        json.data = item;
      } else if (item.type === 'property') {
        _this._updateProperty(item);
      }

      return true;
    });

    return json;
  },

  normalizeQueryResponse: function(store, primaryModelClass, payload, id, requestType) {
    var json = { data: [] };

    var _this = this;

    this._normalizePayload(payload, function(item) {
      if (item.type === 'entity') {
        json.data.push(item);
      } else if (item.type === 'property') {
        _this._updateProperty(item);
      }

      return true;
    });

    return json;
  },

  _normalizePayload: function(payload, handleItem) {
    var propertyIndex = 0;

    // check if payload has context responses
    if (payload.contextResponses) {
      payload.contextResponses.forEach(function(item) {
        // check if item has context element
        if (item.contextElement) {
          // create new entity object
          var entity = {
            type: 'entity',
            id: item.contextElement.id,
            attributes: {
              type: item.contextElement.type
            },
            relationships: {
              properties: {
                data: []
              }
            }
          }

          if (item.contextElement.attributes) {
            item.contextElement.attributes.forEach(function(attribute) {
              if (attribute.type !== 'category') {
                // find timestamp data
                var timestamp = 0;

                attribute.metadatas.forEach(function(metadata) {
                  if (metadata.name === 'timestamp') {
                    timestamp = Date.parse(metadata.value);
                  }
                });

                // create property
                var property = {
                  type: 'property',
                  id: 'property_' + propertyIndex++,
                  attributes: {
                    name: attribute.name,
                    type: attribute.type,
                    date: timestamp,
                    visible: false,
                    values: []
                  },
                  relationships: {
                    entity: {
                      data: { type: 'entity', id: entity.id }
                    }
                  }
                }

                // add values
                if (attribute.value) {
                  attribute.value.forEach(function (value) {
                    property.attributes.values.push(value);
                  });
                }

                entity.relationships.properties.data.push({ type: 'property', id: property.id });

                handleItem(property);
              } else {
                var category = {
                  type: 'category',
                  id: 'category_' + propertyIndex++,
                  attributes: {
                    name: attribute.name,
                  },
                  relationships: {
                    entity: {
                      data: { type: 'entity', id: entity.id }
                    }
                  }
                }

                handleItem(category);
              }
            });
          }

          // pass entity to caller function
          if (handleItem(entity) == false) {
            // if false returned the caller needs no more entites
            return;
          }
        }
      });
    }
  },

  _updateProperty: function(item) {
    // create record if needed, otherwise add to current one
    var record = this.store.peekRecord('property', item.id);
    if (record) {
      if (record.timestamp !== item.attributes.timestamp) {
        item.attributes.values.forEach(function (value) {
          record.get('values').push(value);
        });

        record.set('timestamp', item.attributes.timestamp);
      }
    } else {
      // add new item
      this.store.push(item);
    }
  }
});
