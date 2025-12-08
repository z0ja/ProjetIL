class PlayerState {
    /**
     * 
     * @param {string} status 
     * @param {number} time 
     * @param {string} videoId 
     */
    constructor(status,time,videoId) {
        this.status = status;
        this.time = time;
        this.videoId = videoId;

        if(typeof this.status !== "string" | typeof this.time !== "number" | typeof this.videoId !== "string"){
            throw new Error("Constructor arguments types not corresponding with the given ones");
        }
    }
}