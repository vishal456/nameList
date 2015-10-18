var mongo = require('mongodb').MongoClient,
	client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/names', function(err, db){
	if(err) throw err;

	client.on('connection',function(socket){
		console.log("someone has connected");

		var col = db.collection('namelist'),
			sendStatus = function(s){
				socket.emit('status', s);
			};


		//Emit all messages
		col.find().limit(100).sort({_id : 1}).toArray(function(err, res){
			if(err) throw err;

			socket.emit('output', res);
		});

		//wait for input
		socket.on('input', function(data) {
			console.log("someone has logged in");
			var name = data.name,
			whitespacePattern = /^\s*$/;


			if(whitespacePattern.test(name)){
				console.log("invalid input");
				sendStatus('Name is required');
			}
			else{
				col.insert({name : name}, function(){
					console.log("Inserted");

					//emit all new messages
					client.emit('output', [data]);

					sendStatus({
						message : "Name added",
						clear : true
					});
				});
			}

			
		});
	});

});
