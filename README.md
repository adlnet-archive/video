video
=====

This is a plugin for the XAPIWrapper to easily track the watching of videos. [Read more about the Experience API Spec here.](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md) [Read more about the XAPIWrapper here.](https://github.com/adlnet/xAPIWrapper)

## Contributing to the project
We welcome contributions to this project. Fork this repository, 
make changes and submit pull requests. If you're not comfortable 
with editing the code, please submit an issue and we'll be happy 
to address it.  

## XAPIWrapper
This plugin is for the XAPIWrapper so it is included as a submodule at the base level. Since the XAPIWrapper is needed, the ADL Verbs project is also included as a submodule at the base level and the third-party XAPIWrapper javascript dependencies are included in the `js/` folder. A sample ADL video in .mp4 format is included in the `media/` folder as well. To configure the LRS endpoints and actor being used, please consult the XAPIWrapper ReadMe.


## Popcorn.js
Popcorn.js is an HTML5 media framework written in JavaScript for filmmakers, web developers, and anyone who wants to create time-based interactive media on the web. Popcorn.js is part of Mozilla's Popcorn project. Once a video is created using popcorn, it can be added to the list of videos inside of the ADL XAPIVideo plugin. [For more information about Popcorn.js, visit here.](http://popcornjs.org/)


## example.html
If you did not change any of the LRS settings inside of the XAPIWrapper, you can change them like this:
``` html
    <script type="text/javascript">
        ADL.XAPIWrapper.changeConfig({"endpoint":"http://localhost:8000/xapi/", "user":"test", "password":"password"});
    </script>
```

### Create Popcorn player with local video
To create a Popcorn player with a local video and add it to the XAPIVideo list, when the HTML doc is ready do this:
```JavaScript
	 var pop = Popcorn("#adlvid",{id:"adlvid"});
	 ADL.XAPIVideo.addVideo(pop);
	 pop.play();
```
The first parameter is the name of the div the video is placed in, and the second parameter lists the ID you wish to use for the player. The last line will autoplay the video as soon as the page is done loading.

### Create Popcorn player for YouTube video
To crate a Popcorn player with a YouTube video and add it to the XAPIVideo list, when the HTML doc is ready do this:
```JavaScript
     var popyou = Popcorn.youtube("#youtubevid", "http://www.youtube.com/watch?v=IUHpRoFkI8k");
     ADL.XAPIVideo.addVideo(popyou);
     popyou.play();
```
The first parameter is the name of the div you want the video to be placed in (it will also serve as the ID), and the second parameter is the URL of the video you wish to use. The last line will autoplay the video as soon as the page is done loading.

__NOTE:__ The example.html page uses the Popcorn.js and jQuery CDNs and must be hosted to use them. If this will not be hosted, download the libraries and include them in the `js/` folder. Then change the script src in example.html for both Popcorn.js and jQuery to that path. (If you have python installed on your machine, the easiest way to host the page while testing is to simply run the command `python -m SimpleHTTPServer <port number>` in the base of the directory.)


## xapipopcorn.js
Right now the script sends statements to the LRS that says the user launched the video, made it through the first, second, and third quarters of the video, and completed watching the video. It will also capture whenever a user pauses, resumes or seeks during the video. Example of statements it sends:
```JavaScript
{
    "verb": {
        "id": "http://adlnet.gov/expapi/verbs/launched",
        "display": {
            "en-US": "launched"
        }
    },
    "timestamp": "2013-12-04T14:02:41.318Z",
    "object": {
        "definition": {
            "name": {
                "en-US": "youtubevid"
            }
        },
        "id": "http://www.youtube.com/watch?v=IUHpRoFkI8k",
        "objectType": "Activity"
    },
    "actor": {
        "account": {
            "homePage": "uri:testaccount",
            "name": "tester"
        },
        "objectType": "Agent"
    },
    "stored": "2013-12-04T14:02:42.208502+00:00",
    "version": "1.0.0",
    "authority": {
        "mbox": "mailto:test@test.com",
        "name": "test",
        "objectType": "Agent"
    },
    "id": "942f2328-b987-46cf-a53c-e96e7e1a15a7"
}
```
```JavaScript
{
    "version": "1.0.0",
    "timestamp": "2013-12-04T14:03:08.679Z",
    "object": {
        "definition": {
            "name": {
                "en-US": "youtubevid#halfway"
            }
        },
        "id": "http://www.youtube.com/watch?v=IUHpRoFkI8k#halfway",
        "objectType": "Activity"
    },
    "actor": {
        "account": {
            "homePage": "uri:testaccount",
            "name": "tester"
        },
        "objectType": "Agent"
    },
    "stored": "2013-12-04T14:03:09.321518+00:00",
    "verb": {
        "id": "http://adlnet.gov/expapi/verbs/progressed",
        "display": {
            "en-US": "progressed"
        }
    },
    "result": {
        "extensions": {
            "resultExt:halfway": "PT28S"
        }
    },
    "context": {
        "contextActivities": {
            "parent": [
                {
                    "definition": {
                        "name": {
                            "en-US": "youtubevid"
                        }
                    },
                    "id": "http://www.youtube.com/watch?v=IUHpRoFkI8k"
                }
            ]
        }
    },
    "id": "1c2412f5-7857-42f3-88ba-7ce19a479fa2",
    "authority": {
        "mbox": "mailto:test@test.com",
        "name": "test",
        "objectType": "Agent"
    }
}
```
```JavaScript
{
    "version": "1.0.0",
    "timestamp": "2013-12-04T15:25:38.550Z",
    "object": {
        "definition": {
            "name": {
                "en-US": "youtubevid"
            }
        },
        "id": "http://www.youtube.com/watch?v=IUHpRoFkI8k",
        "objectType": "Activity"
    },
    "actor": {
        "mbox": "mailto:default@example.com",
        "objectType": "Agent"
    },
    "stored": "2013-12-04T15:25:39.086136+00:00",
    "verb": {
        "id": "http://adlnet.gov/expapi/verbs/completed",
        "display": {
            "en-US": "completed"
        }
    },
    "result": {
        "duration": "PT55S",
        "completion": true
    },
    "id": "aaedac03-ab39-45b1-aa33-cfd07a840b93",
    "authority": {
        "mbox": "mailto:test@test.com",
        "name": "test",
        "objectType": "Agent"
    }
}
```

