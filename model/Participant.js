const user = require('./User.js');

class Participant{
	constructor(id, email, username, friends = []) {
		this.id = id;
		this.email = email;
		this.username = username;
		this.friends = friends; 
		this.isAdmin = false;
	}
}
