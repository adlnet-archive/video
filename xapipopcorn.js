(function(ADL){
    var debug = true;
    var log = function(message) 
    {
        if (!debug) return false;
        try
        {
            console.log(message);
            return true;
        }
        catch(e){return false;}
    } 

	function PopcornVideo(player) {
		var myplayer = player;
        var playerID = player.media.id;
        var firstqhit = false;
        var midwayhit = false;
        var thirdqhit = false;
        var completed = false;
		var isTracking = true;
        //youtube videos don't have children
        var objectURI = player.media.children[0].src ? player.media.children[0].src : player.media.src;
        var videoActivity = {"id":objectURI, "definition":{"name": {"en-US":playerID}}};
        //you can edit the actor inside of the wrapper or just include it here
        var actor = ADL.XAPIWrapper.lrs.actor ? ADL.XAPIWrapper.lrs.actor : 
            {"account":{"name":"lou", "homePage":"uri:testaccount"}};

         myplayer.on("play", function(){
            // Same event when first playing for playing after pause-need to differ it like this
            if (myplayer.roundTime() != 0){
                console.log('video ' + playerID + ' resumed')            
                startstuff(false)
            }
            else{
                console.log('video ' + playerID + ' launched')
                startstuff(true)
            }
         });

         // if stmt to catch specific times - the hits get reset to false when video ends
         myplayer.on("timeupdate", function(){
            if (!firstqhit && myplayer.roundTime() == Math.round(myplayer.duration() * .25)){
                console.log('video ' + playerID + ' first point')
                firstqhit = true
                middlestuff("firstquartile", myplayer.roundTime())
            }
            else if (!midwayhit && myplayer.roundTime() == Math.round(myplayer.duration() * .5)){
                console.log('video ' + playerID + ' half point')
                midwayhit = true
                middlestuff("midway", myplayer.roundTime())
            }
            else if (!thirdqhit && myplayer.roundTime() == Math.round(myplayer.duration() * .75)){
                console.log('video ' + playerID + ' third point')
                thirdqhit = true
                middlestuff("thirdquartile", myplayer.roundTime())
            }
         });

         myplayer.on("pause", function(){
            //popcorn pauses before ends so only record pause when it's not the end
            if (myplayer.roundTime() != Math.round(myplayer.duration())){
                console.log('video ' + playerID + ' paused')
                pausestuff(myplayer.roundTime())                
            }
         });

         myplayer.on("seeked", function(){
            //if try to replay movie, instead of playing it fires seeked
            if (myplayer.roundTime() != 0){
                console.log('user seeked ' + playerID + ' to ' + myplayer.roundTime())
                seekstuff(myplayer.roundTime())
            }
         });

         myplayer.on("ended", function(){
            console.log('video ' + playerID + ' ended')
            endstuff(myplayer.duration())
         });    

        function startstuff(launched){
            //reporting for first starting video
            if (launched){
                report({"actor":actor, 
                        "verb":ADL.verbs.launched, 
                        "object":videoActivity});
            }
            //reporting for resuming video
            else{
                var resumeTime = "PT"+Math.round(myplayer.roundTime()) + "S";
                report({"actor":actor, 
                        "verb":ADL.verbs.resumed, 
                        "object":videoActivity, 
                        "result":{"extensions":{"resultExt:resumed":resumeTime}}});
            }
        }

        function middlestuff(quartile, benchTime) {
            var benchObj = {"id":objectURI + "#" + quartile, "definition":{"name":{"en-US":playerID + "#" + quartile}}};
            var bench = "PT"+Math.round(benchTime) + "S";
            var extKey = "resultExt:" + quartile
            var result = {"extensions":{}};
            result["extensions"][extKey] = bench
            var context = {"contextActivities":{"parent" : [videoActivity]}};
            report({"actor":actor,
                    "verb":ADL.verbs.progressed,
                    "object":benchObj,
                    "result":result,
                    "context":context});
        }

        function pausestuff(pauseTime){
            var paused = "PT"+Math.round(pauseTime) + "S";
            report({"actor":actor, 
                    "verb":ADL.verbs.suspended, 
                    "object":videoActivity, 
                    "result":{"extensions":{"resultExt:paused":paused}}});
        }

        function seekstuff(seekTime){
            var seeked = "PT"+Math.round(seekTime) + "S";          
            report({"actor":actor, 
                    "verb":ADL.verbs.interacted, 
                    "object":videoActivity, 
                    "result":{"extensions":{"resultExt:seeked": seeked}}});
        }

        function endstuff(endTime) {
            var duration = "PT"+Math.round(endTime) + "S";
            report({"actor":actor, 
                    "verb":ADL.verbs.completed, 
                    "object":videoActivity, 
                    "result":{"duration":duration, "completion": true}});
            firstqhit = midwayhit = thirdqhit = false;
        }

        this.report = report;
        function report (stmt) {
            if (stmt) {
                stmt['timestamp'] = (new Date()).toISOString();
                if (isTracking) {
                    ADL.XAPIWrapper.sendStatement(stmt, function(){});
                }
                else {
                    log("would send this statement if 'isTracking' was true.");
                    log(stmt);
                }
            }
        }
    };

    // -- -- //
    var XAPIVideo = function() {
        this._videos = {};
    };

    XAPIVideo.prototype.addVideo = function(player) {
        log("adding player: ");
        var playerID = player.media.id
        try{
            var v = new PopcornVideo(player)
        }
        catch(e){return false;}
        this._videos[playerID] = v;
        return true;
    };

    XAPIVideo.prototype.getVideo = function(id) {
        try {
            return this._videos[id]
        }
        catch (e) {
            return {};
        }
    };

    XAPIVideo.prototype.getVideos = function() {
        var v = []
        for (var k in this._videos) {
            if (!this._videos.hasOwnProperty(k)) 
                continue;
            v.push(k);
        }
        return v;
    }

    ADL.XAPIVideo = new XAPIVideo();    

}(window.ADL = window.ADL || {}));