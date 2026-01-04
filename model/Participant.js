class Participant{
	constructor(username, isadmin = false) {
		//this.id = id;
		//this.email = email;
		this.username = username;
		//this.friends = friends; 
		this.isAdmin = isadmin;
	}
}

module.exports = Participant;
