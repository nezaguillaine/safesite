//Global variables
var http= require("http");
var md5 = require("MD5");
var mongoose = require("mongoose");

//Starting the the server
httpServer=http.createServer(function(request, response){
	console.log("new user connected to the server!")
});

//Setting the port on which the server will be listening on
httpServer.listen(1337);
var users={};
var messages=[];
var history=10;

var io= require("socket.io").listen(httpServer);

//connecting to mongodb database
mongoose.connect("mongodb://localhost:27017/safesite",function(err){
	if(err){
		console.log(err);
	}else{
		console.log("connected to mongodb");
	}
});

//create the schema to be used by chat collection
var chatSchema=mongoose.Schema({
	username:String,
	message:String,
	created:{type:Date, default: Date.now}
});

var profileSchema = mongoose.Schema({
	email:String,
	name:String,
	bio:String,
	experience:String,
	interest_field:String,
	sex:String,
	location:String,
	mentor:String
});

//Create cat collection with help of model
var Chat= mongoose.model("Chat", chatSchema);
var Profile=mongoose.model("Profile",profileSchema);

io.sockets.on("connection",function(socket){
	//current user we are working with
	var me=false;
	console.log("new user");
	
	for(var k in users)
	{
		socket.emit("newuser",users[k]);
	}
	
	for(var m in messages)
	{
		socket.emit("newmsg",messages[m]);
	}
	/**
	*User connecting to the chat
	*/
	socket.on("login",function(user){
		console.log(user);
		me=user;
		me.id=user.email.replace("@","-").replace(".","-");
		//me.avatar="https://gravatar.com/avatar/"+ md5(user.email)+"?s=50";
		me.avatar="img/thn2.jpg";
		socket.emit("logged");
		users[me.id]=me;
		io.sockets.emit("newuser",me);
	});
	
	/**
	*	User leaving the to the chat
	*/
	socket.on("disconnect",function(){
		if(!me)
		{
			return false;
		}
		delete users[me.id];
		io.sockets.emit("dis_user",me);
	});
	
	/**
	* Message reception
	**/
	socket.on("newmsg", function(message){

		var newMsg= new Chat({username:me.username, message:message.message});

		/**
		var newProfile= new Profile({
				email:me.email,
				name:me.username,
				bio:"",
				experience:"1 year",
				sex:"M",
				location:"Kacyiru",
				mentor:"Y"
			});

		newProfile.save(function(err,p){
			if(err){
				throw err;
			}
			console.log(p);
		})
		**/
		newMsg.save(function(err){
			if(err){
				throw err;
			} 

			message.user=me;
			var date=new Date();
			message.h=date.getHours();
			message.m=date.getMinutes();
			messages.push(message);
			
			if(messages.length>history)
			{
				messages.shift();
			}
			io.sockets.emit("newmsg",message);
		});
	});

	/**
	*	Request for mentor
	**/
	socket.on("mentor",function(){
		Profile.find({},function(err,profiles){
			if(err) {
				throw err
			}
			console.log(profiles);
			socket.emit("mentor",profiles);
		})
	});
});