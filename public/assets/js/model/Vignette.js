import {VideoPlayer} from "./VideoPlayer.js";

export class Vignette extends VideoPlayer {
    constructor(video=null,player=null) {
        super(video,player);
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
        super.setState(this.player);
    }
}