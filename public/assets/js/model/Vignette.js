import {VideoPlayer} from "./VideoPlayer.js";

export class Vignette extends VideoPlayer {
    constructor(video=null,player=null) {
        console.log(player);
        super(video,player);
        console.log(this.currentState);
    }

    initPlayer(videoId) {
        this.player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: videoId,
            playerVars: { 'playsinline': 1 , 'controls' : 0, 'disablekb' : 1},
            events: {
                'onReady': (event) => this.onPlayerReady(event),       // Arrow function pour garder le 'this'
            },
        });
    }

    isAdmin(){
        return false;
    }

    onPlayerReady(event){
        console.log(this.currentState);
        super.setState(this.currentState);
        //this.pause();
        this.interval = setInterval(() => this.pause(),1000);
    }

    static getVignette(text){
        let ancien = ""
        let video = ""
        let time = ""
        let begin_video = false
        let begin_time = false
        let vignette = []
        for (let letter of text){
            if(begin_time && letter == "]"){
                begin_time = false
                vignette.push([video,Number(time)])
                video = ""
                time = ""
            }
            if(begin_time) {
                time = time+letter
            }
            if(begin_video && letter == ":"){
                begin_video = false
                begin_time = true
            }
            if(begin_video){
                video = video+letter
            }
            if(letter == "|" && ancien == "["){
                begin_video = true
            }
            ancien = letter
        }
        
        return vignette
    }
}