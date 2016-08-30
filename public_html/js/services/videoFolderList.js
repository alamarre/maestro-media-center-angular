var videoFolderList = angular.module('videoFolderList', []);

videoFolderList.factory('videoFolderList', ['$q','$http',function($q,$http) {
return {
  getFiles: function(folder) {
    var deferred = $q.defer();
    $http({
        method: 'GET',
        url: '/api/v1.0/folders',
        params: {
            "path": folder
        },
    })
    .success(function(result) {
        result.files = result.files.filter(function(file) {
            return file.indexOf(".mp4") == (file.length-".mp4".length);
        });
        deferred.resolve(result);
    });
    return deferred.promise;
  }
};
}]);
