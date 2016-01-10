var videoPlayerProxy = angular.module('videoPlayerProxy',[
    'playerManager',
    'chromecast'
]);

videoPlayerProxy.controller('VideoPlayerProxyController', ['$scope', '$location','videoFolderList','chromecast',
    function($scope, $location,videoFolderList,chromecast) {
        var index = $location.search().index;
        var folder = $location.search().folder;
        if(chromecast.isActivated()) {
            chromecast.playToChromeCast(folder,index);
            $scope.showVideo = false;
            $location.path("/remote.html")
        } else {
            $location.path("/player.html")
        }
        
    }
]);