define([//Dojo
  'dojo/_base/declare', 
  'dojo/_base/lang',
  //Jimu
  'jimu/BaseWidget',
  'jimu/SelectionManager',
  'jimu/dijit/Message',
  'jimu/LayerInfos/LayerInfos',
  //Dijit
  'dijit/form/Select',
  //Custom classes
  './idWebMapLayers',
  //Esri
  'esri/tasks/query', 
  'esri/tasks/QueryTask',
  //Files
  'xstyle/css!./files/bootstrap.min.css',
  './files/jquery-3.3.1.min',
  './files/bootstrap.min',
  //domReady!
  'dojo/domReady!'
  ],
function(declare, lang,
   BaseWidget, SelectionManager, Message, LayerInfos,
   Select, idWebMapLayers, Query, QueryTask) {

return declare([BaseWidget], {

layerName: null,
layer: null,
field: null,
url: null,
uniqueValue: null,
selectionManager: SelectionManager.getInstance(),


startup: function(){
  this.inherited(arguments);
  this._setWidgetSize();
  // this._initLoadingShelter();
  this._initLayerChooser();
  // this._initButtons();
  // this._getSelectedFeatures();
},

_setWidgetSize: function(){
    var panel = this.getPanel();
    panel.position.height = 550;
    panel.setPosition(panel.position);
    panel.panelManager.normalizePanel(panel);
},


_initLayerChooser: function(){
  var idForChangeEvent = "layerChooserNodeEvent" 
  console.log("_initLayerChooser is called");
  new idWebMapLayers({
    idForChangeEvent: idForChangeEvent,
    layerNode: "layerChooserNode",
    map: this.map,
    geometry: "*", //options: 'point', 'polygon', 'line', 'multiPatch' or '*'
    imageFolderUrl: this.folderUrl
  }) 
  this.layerName = dijit.byId(idForChangeEvent).value;
  console.log(this.layerName);
  this.layer = this.map.getLayer(this.layerName);
  this.url = this.layer.url;

  dijit.byId(idForChangeEvent).on("change", lang.hitch(this, function(evt){
    this.layerName = evt;
    console.log("inside evenet");
    this.layer = this.map.getLayer(this.layerName);
    this.url = this.layer.url;
  }))
},


_queryDownstream: function(){
    console.log(this.layer);  
    console.log(this.layer.getSelectedFeatures()); 
    selectedFeatures = this.layer.getSelectedFeatures();
    featuresToSelect = [];
    selectedFeatures.forEach(feature => {
      console.log(feature["attributes"]["SUBID"]);
      console.log(feature["attributes"]["ALLDOWN"]);
      var downStream = feature["attributes"]["ALLDOWN"].split(',').slice()
      console.log(downStream);
      featuresToSelect = featuresToSelect.concat(downStream);
    });
    // remove the zeros from the result
    featuresToSelect = featuresToSelect.filter((el) => {return el > 0})
    console.log(featuresToSelect);

    var query = new Query()
    console.log("SUBID IN (" + featuresToSelect.join(', ') + ")");
    query.where = "SUBID IN (" + featuresToSelect.join(', ') + ")";
    selecteFeatures = [];
    query.outFields = ["*"];
    new QueryTask(this.url).execute(query, lang.hitch(this, function(results){
      // this.selectionManager.setSelection(this.layer, results.features);
      this.selectionManager.addFeaturesToSelection(this.layer, results.features);
    }),function(error){
      new Message({
        message: "There was a problem selecting."
      });
    });
  },


_queryUpstream: function(){
  console.log(this.layer);  
  console.log(this.layer.getSelectedFeatures()); 
  selectedFeatures = this.layer.getSelectedFeatures();
  featuresToSelect = [];
  selectedFeatures.forEach(feature => {
    if (feature["attributes"]["MAINUPP"]){
      console.log(feature["attributes"]["SUBID"]);
      console.log(feature["attributes"]["MAINUPP"]);
      var upStream = feature["attributes"]["MAINUPP"].split(',').slice()
      console.log(upStream);
      featuresToSelect = featuresToSelect.concat(upStream);
    }

  });
  // remove the zeros from the result
  featuresToSelect = featuresToSelect.filter((el) => {return el > 0})
  console.log(featuresToSelect);
  if(featuresToSelect.length > 0){
    var query = new Query()
    console.log("SUBID IN (" + featuresToSelect.join(', ') + ")");
    query.where = "SUBID IN (" + featuresToSelect.join(', ') + ")";
    selecteFeatures = [];
    query.outFields = ["*"];
    new QueryTask(this.url).execute(query, lang.hitch(this, function(results){
      this.selectionManager.addFeaturesToSelection(this.layer, results.features);
    }),function(error){
      new Message({
        message: "There was a problem selecting."
      });
    });
  }
  },


_clearSelection: function(){
this.selectionManager.clearSelection(this.layer)
}
});
});
