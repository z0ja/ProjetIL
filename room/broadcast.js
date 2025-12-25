import {PlayerState} from "../model/PlayerState.js";

function broadcastPlayerState(state){
    if(typeof state !== PlayerState){
        throw new Error("Function arguments types not corresponding with the given ones")
    }

    
}