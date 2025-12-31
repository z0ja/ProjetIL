export function broadcastPlayerState(state,user,io){
    let json = state.toJson();
    json['user'] = user; // ajouter l'utilisateur qui a fait l'action pour faire en sorte de ne pas changer son 'PlayerState'

    io.emit('changeState',json)
}

export function sendPlayerState(state,socket){
    console.log("envoie de state");
    let json = state.toJson();
    json['user'] = "";
    
    socket.emit('changeState',json);
}