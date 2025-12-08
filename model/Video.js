class Video {
    /**
     * @param {string} videoId
     * @param {string} title
     * @param {string} url
     */
    constructor(videoId,title,url) {
        this.videoId = videoId;
        this.title = title;
        this.url = url;

        if(typeof this.videoId !== "string" | typeof this.title !== "string" | typeof this.url !== "string"){
            throw new Error("Constructor arguments types not corresponding with the given ones");
        }
    }

    getVideoId(){
        return this.videoId;
    }

    getTitle(){
        return this.title;
    }

    getUrl(){
        return this.url
    }
}