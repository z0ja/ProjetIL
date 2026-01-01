import {Video} from "./Video.js";
import {PlayerState} from "./PlayerState.js";

export class VideoPlayer {
    /**
     * 
     * @param {Video} video 
     * @param {PlayerState} player
     */
    constructor(video=null,player=null) {
        console.log("test");
        
        this.currentTime = 0;
        this.currentVideo = video;

        if((video !== null && !(video instanceof Video)) || (player !== null && !(player instanceof PlayerState))){
            throw new Error("Constructor arguments types not corresponding with the given ones");
        }

        if(player === null && video === null){
            this.currentState = new PlayerState();
            this.currentVideo = new Video();
        }

        else if(player === null) this.currentState = new PlayerState(video.getVideoId()) ;
        else this.currentState = player;

        // crée le iframe player
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        this.admin = false; //temporaire
        this.user = Math.floor(Math.random() * 100).toString(); //temporaire user aleatoire
        this.jump = 0;
        if(this.admin) this.JUMP_MAX = 6;
        else this.JUMP_MAX = 1;

        let id;
        if (video === null) id = '';
        else id = this.currentVideo.getVideoId();
        
        window.onYouTubeIframeAPIReady = () => {
            this.initPlayer(id);
        };
        
        if (!document.getElementById('youtube-api-script')) {
            var tag = document.createElement('script');
            tag.id = 'youtube-api-script';
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else if (window.YT && window.YT.Player) {
            this.initPlayer(videoIdString);
        }
    }

    initPlayer(videoId) {
        this.player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: videoId,
            playerVars: { 'playsinline': 1 },
            events: {
                'onReady': (event) => this.onPlayerReady(event),       // Arrow function pour garder le 'this'
                'onStateChange': (event) => this.onPlayerStateChange(event) // Arrow function pour garder le 'this'
            },
        });
    }

    onPlayerReady(event){
        this.loadVideo(new Video(this.currentVideo.getVideoId()),false);
    }

    onPlayerStateChange(event){
        if (event.data == YT.PlayerState.PLAYING) {
            if(this.jump != 0) this.jump += 1;

            if(this.currentState.getStatus() === "paused" && this.jump == 0){
            console.log("video lancer");

            this.currentState.setStatus("played");

            if(this.admin){
                this.sendState("changeState");
            }

            else{
                this.jump += 1;
                this.sendState("setState");
            }
            }

            if(this.jump > this.JUMP_MAX) this.jump = 0;
            this.interval = setInterval(() => this.changeTime(),1000);
        } 
        
        else {
            if(this.jump != 0 && this.admin) this.jump += 1;
            
            if(this.currentState.getStatus() === "played" && this.jump == 0){
            console.log("video en pause");
            this.currentState.setStatus("paused");

            if(this.admin){
                this.sendState("changeState");
            }
            }

            if(this.jump > this.JUMP_MAX && this.admin) this.jump = 0;
            clearInterval(this.interval);
        }
    }

    changeTime() {
        var time = this.player.getCurrentTime();
        var diff = time - this.currentTime;

        if (diff > 2) {
            console.log("temps avancer");

            if(this.admin){
                this.currentTime = time;
                if(this.jump == 0) this.sendState("changeState");
            }

            else{
                this.seek(this.currentTime);
                time = this.currentTime;
            }
        } 
        else if (diff < -1) {
            console.log("temps reculer");

            if(this.admin){
                this.currentTime = time;
                if(this.jump == 0) this.sendState("changeState");
            }

            else{
                this.seek(this.currentTime);
                time = this.currentTime;
            }
        }

        this.currentTime = time;
    }

    play(){
        if (this.player && typeof this.player.playVideo === 'function') {
            this.player.playVideo();
        }
    }

    pause(){
        if (this.player && typeof this.player.pauseVideo === 'function') {
            this.player.pauseVideo();
        }
    }

    seek(time){
        this.currentState.setTime(time);
        this.currentTime = time;

        if (this.player && typeof this.player.seekTo === 'function') {
            this.player.seekTo(time,true);
        }
    }

    loadVideo(video,newState=true){
        if(!(video instanceof Video)){
            throw new Error("Function arguments types not corresponding with the given ones")
        }
        
        this.currentVideo = video;

        if(newState) this.currentState = new PlayerState(this.currentVideo.getVideoId());

        if (this.player && typeof this.player.loadVideoById === 'function') {
            this.player.loadVideoById(this.currentVideo.getVideoId());
        }
    }

    getState(){
        return this.currentState;
    }

    setState(state){
        if(!(state instanceof PlayerState)){
            throw new Error("Function arguments types not corresponding with the given ones")
        }

        this.jump += 1;

        this.currentState = state;

        if(this.currentState.getVideoId() !== this.currentVideo.getVideoId()){
            this.loadVideo(new Video(this.currentState.getVideoId()),false);
        }

        if(this.currentState.getStatus() === "played") this.play();
        else if(this.currentState.getStatus() === "paused") this.pause();
        else throw new Error("Video status is not played or paused");

        this.seek(this.currentState.getTime());
    }

    sendState(event){
        this.currentState.setTime(this.currentTime);

        let json = this.currentState.toJson();
        json["user"] = this.user;
        window.socket.emit(event,json);
    }

    setAdmin(admin){ //temporaire
        this.admin = admin;
    }

    getUser(){
        return this.user;
    }
}