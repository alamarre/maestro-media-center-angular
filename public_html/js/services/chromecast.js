var chromecast = angular.module('chromecast', [
    'remoteManager'
]);

chromecast.factory('chromecast', ['$http', 'remoteManager',function($http,remoteManager) {
    var session = null;
    var serverUrls = null;
    var launchImmediate = false;

    var chromecastApplicationId = "7B866935";
    return {
        isActivated: function() {
            return remoteManager.isRemoteSet()||(session!=null && session!=false);
        },
        initialize: function() {
            if(typeof chrome=="undefined") {
                return;
            }
            this.fetchServerUrls();
            if (!chrome.cast || !chrome.cast.isAvailable) {
                setTimeout(this.initialize.bind(this), 1000);
                return;
            }
            var sessionRequest = new chrome.cast.SessionRequest(chromecastApplicationId);
            var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                    this.sessionListener.bind(this),
                    this.receiverListener.bind(this),
                    chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
                );
            chrome.cast.initialize(apiConfig, this.onCastInitSuccess.bind(this), this.onCastInitError.bind(this));
        },
        getServerUrls: function() {
            return serverUrls;
        },
        fetchServerUrls: function() {
            $http({
                method: 'GET',
                url: '/api/v1.0/server/ips',
            })
            .success(function(result) {
                serverUrls = result;
            });
        },
        launch: function() {
            chrome.cast.requestSession(this.onRequestSessionSuccess.bind(this), this.onLaunchError.bind(this));
        },
        onRequestSessionSuccess: function(e){
            console.log("session success");
            session = e;
            if (session) {
                session.addUpdateListener(this.sessionUpdateListener.bind(this));
            }
            var id = "Chromecast - "+session.receiver.friendlyName;
            remoteManager.setRemoteId(id);
            var connectMessage = {
                "action": "connect",
                "port": window.location.port,
                "scheme":window.location.protocol,
                "guid": id,
                "deviceName": id
            };
            connectMessage.serverUrls = serverUrls;
            var either = function(){};
            if(session) {
               session.sendMessage('urn:x-cast:maestro', connectMessage, either, either);
            }
        },
        onLaunchError: function(error){
            console.log(error);
            console.log("chromecast launch failed");
        },
        sessionListener: function(e) {
            console.log("session" +e);
            session = e;
            if (session) {
                session.addUpdateListener(this.sessionUpdateListener.bind(this));
            }
            var id = "Chromecast - "+session.receiver.friendlyName;
            remoteManager.setRemoteId(id);
            var connectMessage = {
                "action": "connect",
                "port": window.location.port,
                "scheme":window.location.protocol,
                "guid": id,
                "deviceName": id
            };
            connectMessage.serverUrls = serverUrls;
            var either = function(){};
            if(session) {
               session.sendMessage('urn:x-cast:maestro', connectMessage, either, either);
            }
        },
        sessionUpdateListener: function(isAlive) {
            console.log("session " + isAlive);
            if(!isAlive) {
                session = false;
            }
        },
        receiverListener: function(e) {
            if (e === 'available') {
                console.log("receiver found");
            }
            else {
                console.log("receiver list empty");
            }
        },
        onCastInitSuccess: function(){
			if(false&&remoteManager.isRemoteSet()) {
				var receiver = new chrome.cast.Receiver("maestro-receiver",remoteManager.getRemoteId());
				chrome.cast.setReceiverDisplayStatus(receiver,JSON.stringify({"x":"hacky init"}), function() { console.log("S"); }, function() { console.log("F");});
			}
            if(launchImmediate) {
                this.launch();
            }
        },
        onCastInitError: function() {
            console.log("failed to cast");
        },
        playToChromeCast: function(folder, index) {
			if(session) {
				var id = "Chromecast - "+session.receiver.friendlyName;
				remoteManager.setRemoteId(id);
			}
            
            var playMessage = {
                "action": "play",
                "folder": folder,
                "index": index
            };

            var either = function(){};
            remoteManager.sendMessage(playMessage);
        }

    };
}]);
