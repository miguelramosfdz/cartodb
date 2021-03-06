var Backbone = require('backbone');
var _ = require('underscore');
var LayerDefinitionModel = require('../../../../../../../javascripts/cartodb3/data/layer-definition-model');
var AnalysisFormsCollection = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analysis-forms-collection');
var AnalysesWorkflowListView = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analyses-workflow-list-view');
var AnalysisDefinitionNodesCollection = require('../../../../../../../javascripts/cartodb3/data/analysis-definition-nodes-collection');

describe('editor/layers/layer-content-view/analyses/analyses-workflow-list-view', function () {
  beforeEach(function () {
    this.analysisDefinitionNodesCollection = new AnalysisDefinitionNodesCollection(null, {
      configModel: {},
      userModel: {}
    });

    this.analysisDefinitionNodesCollection.add({
      id: 'a1',
      type: 'source',
      status: 'ready'
    });

    this.analysisDefinitionNodesCollection.add({
      id: 'a2',
      type: 'source',
      status: 'ready'
    });

    this.analysisDefinitionNodesCollection.add({
      id: 'a3',
      type: 'source',
      status: 'ready'
    });

    this.layerDefModel = new LayerDefinitionModel({
      id: 'l-1',
      options: {
        type: 'CartoDB',
        table_name: 'foo',
        source: 'a1',
        letter: 'a'
      }
    }, {
      parse: true,
      collection: new Backbone.Collection(),
      configModel: {}
    });
    spyOn(this.layerDefModel, 'getAnalysisDefinitionNodeModel');

    this.viewModel = new Backbone.Model({
      selectedNodeId: 'a2'
    });

    this.analysisFormsCollection = new AnalysisFormsCollection(null, {
      configModel: {},
      userActions: {},
      layerDefinitionModel: this.layerDefModel,
      analysisSourceOptionsModel: {}
    });
    this.analysisFormsCollection.add([
      {id: 'a3'},
      {id: 'a2'},
      {id: 'a1'}
    ]);
    spyOn(this.analysisFormsCollection, 'deleteNode');

    this.view = new AnalysesWorkflowListView({
      analysisDefinitionNodesCollection: this.analysisDefinitionNodesCollection,
      analysisFormsCollection: this.analysisFormsCollection,
      model: this.viewModel,
      layerId: this.layerDefModel.id,
      hideAddButton: false
    });
    this.view.render();
  });

  it('should render correctly', function () {
    expect(_.size(this.view._subviews)).toBe(4); // [3 x Analysis Node, Tooltip]
  });

  it('should display add button and the list of analysis', function () {
    expect(this.view.$('.js-add-analysis').length).toBe(1);
    expect(this.view.$('.js-add-analysis').data('layer-id')).toEqual('l-1');
  });

  it('should render an item per node', function () {
    var content = this.view.$el.html();

    expect(content).toContain('a3');
    expect(content).toContain('a2');
    expect(content).toContain('a1');
  });

  it('should highlight selected node', function () {
    expect(this.view.$('li:eq(1) .VerticalRadioList-radio .CDB-Radio').attr('checked')).toBe('checked');
    expect(this.view.$('li:eq(1)').text()).toContain('a2');
  });

  describe('when another non-selected node is clicked', function () {
    beforeEach(function () {
      this.view.$('li:eq(2)').click();
    });

    it('should change selected workflow item', function () {
      expect(this.viewModel.get('selectedNodeId')).toEqual('a1');
    });

    it('should only have one item selected still', function () {
      expect(this.view.$('.CDB-Radio:checked').length).toEqual(1);
    });
  });

  describe('when a node has failed', function () {
    it('should have a has-failed class', function () {
      var analysisNodeModel = this.analysisDefinitionNodesCollection.models[0];
      analysisNodeModel.set('status', 'failed');
      this.view.render();

      // The first analysis is the last in the list
      expect(this.view.$('li:eq(2) .VerticalRadioList-itemInner').hasClass('has-error')).toBe(true);
    });
  });

  describe('when a node is loading', function () {
    it('should show a loader', function () {
      var analysisNodeModel = this.analysisDefinitionNodesCollection.models[0];
      analysisNodeModel.set('status', 'loading');
      this.view.render();

      // The first analysis is the last in the list
      expect(this.view.$('li:eq(2)').html()).toContain('CDB-LoaderIcon');
    });
  });

  it('should not have any leaks', function () {
    expect(this.view).toHaveNoLeaks();
  });

  afterEach(function () {
    this.view.clean();
  });
});
