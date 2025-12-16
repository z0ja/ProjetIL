require("../model/Video.js");

class Playlist{

	constructor(){
		const this.list = [];
		this.pointer = 0;
	}

	addVideo(videoUrl){
		this.list.push(videoUrl);
	}

	removeVideo(){
		return this.list.splice(this.pointer, 1);
	}

	getNextVideo(){
		return this.list[this.pointer++];
	}


}
