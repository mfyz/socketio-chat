var socket = io.connect('http://localhost:3000');

var session = {
	username: null,
	users: []
};

var ui = {
	initUserList: function(){
		userlist_html = '';
		session.users.forEach(function(user){
			isYou = (user == session.username ? ' (you)' : '');
			userlist_html += '<li>' + user + isYou + '</li>';
		});
		document.getElementById('userlist').innerHTML = userlist_html;
	},

	printMessageRow: function(message_html){
		messages = document.getElementById('messages');
		messages.innerHTML += message_html;
		// Scroll to bottom
		messages.scrollTop = messages.scrollHeight;
	},

	printMessage: function(username, message){
		classes = '';
		if (username == session.username) classes += ' owner';

		message_html = '<p class="' + classes + '"><b>' + username + '</b>: ' + message + '</p>';
		this.printMessageRow(message_html);
	},

	printNotification: function(message){
		if (arguments.length > 1) extra_classes = arguments[1];
		else extra_classes = '';

			message_html = '<p class="notification ' + extra_classes + '">' + message + '</p>';
		this.printMessageRow(message_html);
	}
};

socket.on('init', function (data) {
	session.username = data.name;
	session.users = data.users;

	ui.initUserList();
});

socket.on('user_joined', function (data) {
	session.users.push(data.name);
	ui.initUserList();
	icon = '<i class="glyphicon glyphicon-user"></i> ';
	ui.printNotification(icon + data.name + ' has joined chat.', 'green');
});

socket.on('user_left', function (data) {
	i = session.users.indexOf(data.name);
	session.users.splice(i, 1);

	ui.initUserList();
	icon = '<i class="glyphicon glyphicon-arrow-left"></i> ';
	ui.printNotification(icon + data.name + ' has left chat.');
});

socket.on('message_received', function (data) {
	ui.printMessage(data.username, data.message);
});

function compose_message(){
	compose_text = document.getElementById('compose_text');

	ui.printMessage(session.username, compose_text.value);

	socket.emit('send_message', {
		username: session.username,
		message: compose_text.value
	}, function(){
		console.log('sent!');
	});

	compose_text.value = '';
	return false;
}