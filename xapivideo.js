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

    function ProjekktorVideo(player) {
        var myplayer = player;
        var currentid = myplayer.getId();
        var is_tracking = false; // true sends xapi statements, false writes to console
        var currentstate = 'STOPPED';
        var currenttime = 0;
        var reportstate = 'LAUNCHED';
        var firstqhit, midwayhit, thirdqhit, completed;
        var objecturi = player.getSource();
        var actor = ADL.XAPIWrapper.lrs.actor ? ADL.XAPIWrapper.lrs.actor : 
            '{"account":{"name":"unknown", "homePage":' + location.origin + '}}';

        function resetState() {
            currentid = myplayer.getId();
            currentstate = 'STOPPED';
            currenttime = 0;
            reportstate = 'LAUNCHED';
            firstqhit = midwayhit = thirdqhit = completed = false;
            objecturi = player.getSource();
        }

        this.addTracking = addTracking;
        function addTracking() {
            myplayer.addListener('time', timelistener);
            myplayer.addListener('firstquartile', oneqlistener);
            myplayer.addListener('midpoint', midlistener);
            myplayer.addListener('thirdquartile', thirdqlistener);
            myplayer.addListener('state', statelistener);
        }

        this.isComplete = isComplete;
        function isComplete() {
            return (firstqhit && midwayhit && thirdqhit) 
                    && Math.round(currenttime + Math.round(myplayer.getDuration()*0.05)) 
                    > Math.floor(myplayer.getDuration());
        }

        var timelistener = function(time) {
            currenttime = time;
            if (currentstate == "PLAYING" && myplayer.getTimeLeft() == 0){
                myplayer.setStop();
            }
        }

        var oneqlistener = function() {
            log('1st quarter: ' + currenttime);
            if (firstqhit) return;
            firstqhit = true;
            reportstate = 'FIRSTQ';
            middlestuff("#firstquartile");
        }

        var midlistener = function() {
            log('1/2 way: ' + currenttime);
            if (midwayhit) return;
            midwayhit = firstqhit;
            reportstate = 'MIDWAY';
            middlestuff("#midway");
        }

        var thirdqlistener = function() {
            log('3rd quarter: ' + currenttime);
            if (thirdqhit) return;
            thirdqhit = midwayhit && firstqhit;
            reportstate = 'THIRDQ';
            middlestuff("#thirdquartile");
        }

        var statelistener = function(state) {
            currentstate = state;
            switch(state) {
                case 'AWAKENING':
                    log(state);
                    if (currentid != myplayer.getId()) {
                        resetState();
                        log("reset state.. new source = " + player.getSource());
                    }
                    break;
                case 'STARTING':
                    log(state);
                    if (reportstate !== 'LAUNCHED') return;
                    var oneqobj = {"id":objecturi};
                    report({"actor":actor, 
                            "verb":ADL.verbs.launched, 
                            "object":oneqobj});
                    break;
                case 'PLAYING':
                    log(state + "-" + reportstate);
                    if (reportstate === 'SUSPENDED') {
                        var verb = ADL.verbs.resumed;
                        var oneqobj = {"id":objecturi};
                        var duration = "PT"+Math.floor(currenttime) + "S";
                        report({"actor":actor, 
                                "verb":verb, 
                                "object":oneqobj, 
                                "result":{"duration":duration}});
                    }
                    reportstate = state;
                    break;
                case 'PAUSED':
                case 'STOPPED':
                case 'COMPLETED':
                    log(state + ": " + Math.round(myplayer.getDuration() - currenttime) + " seconds left");
                    endstuff();
                    break;
                case 'ERROR':
                case 'DESTROYING':
                    log(state);
                    endstuff();
                    break;
                break;
            }
        }

        function middlestuff(hashtag) {
            if (reportstate === 'COMPLETED' || completed) return;
            var qobj = {"id":objecturi + hashtag};
            var duration = "PT"+Math.floor(currenttime) + "S";
            var context = {"contextActivities":{"parent" : [{"id" : objecturi}]}};
            report({"actor":actor, 
                    "verb":ADL.verbs.progressed, 
                    "object":qobj, 
                    "result":{"duration":duration},
                    "context":context});
        }

        function endstuff() {
            if (reportstate === 'COMPLETED' || completed) return;
            reportstate = 'SUSPENDED';
            completed = isComplete();
            if (completed) {
                reportstate = 'COMPLETED'; 
            }
            var verb = completed?ADL.verbs.completed:ADL.verbs.suspended;
            var oneqobj = {"id":objecturi};
            var duration = "PT"+Math.floor(currenttime) + "S";
            report({"actor":actor, 
                    "verb":verb, 
                    "object":oneqobj, 
                    "result":{"duration":duration}});
        }

        this.report = report;
        function report (stmt) {
            if (stmt) {
                stmt['timestamp'] = (new Date()).toISOString();
                if (is_tracking) {
                    ADL.XAPIWrapper.sendStatement(stmt, function(){});
                }
                else {
                    log("would send this statement if 'is_tracking' was true.");
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
        log(player);
        var src = player.getSource();
        if (src) {
            try {
                if (player.env.className.indexOf('projekktor')>-1) {
                    var v = new ProjekktorVideo(player);
                    v.addTracking();
                    this._videos[src] = v;
                    return true;
                }
            }
            catch (e){/* we don't know this type of player */}
        }
        return false;
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
