export function broadcastPlayerState(state){
    let json = state.toJson();
    json['user'] = ""; // ajouter l'utilisateur qui a fait l'action pour faire en sorte de ne pas changer son 'PlayerState'

    io.emit('changeState',json)
}

export function sendPlayerState(state,socket){
    console.log("envoie");
    let json = state.toJson();
    json['user'] = "";
    
    socket.emit('changeState',json);
}