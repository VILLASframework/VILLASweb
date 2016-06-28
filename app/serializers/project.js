import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    owner: { serialize: 'ids' },
    visualizations: { serialize: 'ids' }
  }
});
