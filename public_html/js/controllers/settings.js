var settings = angular.module('settings',[
    'chromecast',
    'remoteManager'
]);

settings.controller('SettingsController', ['$scope','chromecast','remoteManager',
  function ($scope, chromecast,remoteManager) {
    var playRemote = remoteManager.isRemoteSet();
    $scope.settings = {"playRemote": playRemote};
    var promise = remoteManager.getHosts();
    promise.then(function(hosts) {
        $scope.hosts = hosts;
        $scope.noHosts = Object.keys(hosts).length==0;
    });
    $scope.connectChromecast = function() {
        chromecast.launch();
    }
    $scope.setHost = function(host) {
        remoteManager.setRemoteId(host,true);
    }
    $scope.$watch('settings.playRemote', function(newValue, oldValue) {
        remoteManager.controlRemote(newValue);
    });
  }]);
