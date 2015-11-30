(function() {
  'use_strict';

  angular.module('app')
    .controller("diagramCtrl", ['$scope', '$rootScope', 'GoJS', 'Upload', '$log',
      'DiagramServices', 'Modal', '$http', '$location', diagramCtrl
    ]);

  function diagramCtrl($scope, $rootScope, GoJS, Upload, $log, DiagramServices,
     Modal, $http, $location) {

    $scope.init = GoJS.initDiagram();
    $scope.diagramList;
    $scope.temp = {};
    $scope.myDiagram = {
      userName: $rootScope.userName,
      diagramName: "",
      diagramDetail: $scope.init.model,
      category: $location.path().split("/")[2]
    };
    $scope.modal = Modal.modalTrigger();
    $scope.uploader = Upload.init();
    $scope.uploader.onCompleteItem = onCompleteItem;
    $scope.newDiagram = newDiagram;
    $scope.saveAsDiagram = saveAsDiagram;
    $scope.saveDiagram = saveDiagram;
    $scope.loadDiagram = loadDiagram;
    $scope.selectDiagram = selectDiagram;
    $scope.deleteDiagram = deleteDiagram;
    $scope.closeModal = closeModal;
    $scope.redo = redo;
    $scope.undo = undo;
    $scope.exportJSON = exportJSON;
    $scope.exportImage = exportImage;

    loadDiagramList();

    function saveAsDiagram(myDiagram){
      $log.info(myDiagram);
      DiagramServices.saveDiagram(myDiagram, function(){
        loadDiagramList();
        closeModal();
      });
    }
    function saveDiagram(myDiagram){
      if (myDiagram.diagramName.length == 0) {
        $scope.modal.save = !$scope.modal.save;
        $scope.modal.overlay = !$scope.modal.overlay;
      }else {
        DiagramServices.updateDiagram(myDiagram, function(){
          loadDiagramList();
        });
      }
    }
    function newDiagram() {
      $scope.myDiagram.diagramName = "";
      $scope.init.model = new go.GraphLinksModel();
      $scope.init.model.linkFromPortIdProperty = "fromPort";
      $scope.init.model.linkToPortIdProperty = "toPort";
      $scope.myDiagram.diagramDetail = $scope.init.model;
    }
    function closeModal(){
      $scope.modal = Modal.closeModal();
    }
    function loadDiagramList(){
      DiagramServices.loadDiagramList($scope.myDiagram.userName, function(result) {
        $scope.diagramList = result;
      });
    }
    function loadDiagram(diagramParam){
      $scope.myDiagram.diagramName = diagramParam.diagramName;
      $scope.myDiagram.diagramDetail = $scope.init.model = go.Model.fromJson(diagramParam.diagramDetail);
    }
    function selectDiagram(diagramParam){
      $scope.temp.diagramId = diagramParam.diagramId;
      $scope.temp.diagramName = diagramParam.diagramName;
    }
    function deleteDiagram(diagramParam){
      var c = confirm("delete "+diagramParam.diagramName+" ?");
      if (c) {
        DiagramServices.deleteDiagram(diagramParam.diagramId, function(result){
          $log.info(result);
          loadDiagramList();
        });
      }
    }
    function redo(diagram){
      $scope.myDiagram.diagramDetail = GoJS.redo(diagram);
    }
    function undo(diagram){
      $scope.myDiagram.diagramDetail = GoJS.undo(diagram);
    }
    function exportJSON(myDiagram){
      DiagramServices.exportJSON(myDiagram);
      closeModal();
    }
    function exportImage(myDiagram, init){
      DiagramServices.exportImage(myDiagram, init);
      closeModal();
    }
    function onCompleteItem(item, response, status, headers) {
      console.info('Complete', item.file.name);
      $http.get('/api/containers/container1/download/' + item.file.name).then(function(value) {
        $scope.init.model = new go.GraphLinksModel();
        $scope.init.model.linkFromPortIdProperty = "fromPort";
        $scope.init.model.linkToPortIdProperty = "toPort";
        $scope.myDiagram.diagramDetail = $scope.init.model = go.Model.fromJson(value.data);
        closeModal();
      });
    };

  }

})();