export default class PlayerState {
    /**
     * 
     * @param {string} status 
     * @param {number} time 
     * @param {string} videoId 
     */
    constructor(status="paused",time=0,videoId="") {
        this.status = status;
        this.time = time;
        this.videoId = videoId;

        if(typeof this.status !== "string" || typeof this.time !== "number" || typeof this.videoId !== "string"){
            throw new Error("Constructor arguments types not corresponding with the given ones");
        }
    }

    getStatus(){
        return this.status;
    }

    getTime(){
        return this.time;
    }

    getVideoId(){
        return this.videoId;
    }

    setStatus(status){
        if(status !== "paused" && status !== "played"){
            throw new Error("status value not 'paused' or 'played'");
        }
        this.status = status;
    }

    setTime(time){
        if(typeof this.time !== "number"){
            throw new Error("Function arguments types not corresponding with the given ones");
        }
        this.time = time;
    }

    toJson(){
        return {
            status : this.getStatus(),
            time : this.getTime(),
            videoId : this.getVideoId(),
        };
    }
}