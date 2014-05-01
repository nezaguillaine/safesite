(function($){
	//connecting to node js server
	var socket=io.connect("http://localhost:1337");
	
	//as mustache is visible by default, remove the div which contains it at the beginning
	var msgtpl=$("#msgtpl").html();
	var lastMsg=false;
	$("#msgtpl").remove();


	
	//login form submited
	$("#btnLogin").click(function(e){
		//alert("Hello World");

		socket.emit('login',{
			username: $("#username").val(),
			email   : $("#email").val()
		});
	});
	

	//Get the name of the contact
	$(".contact_name").click(function(){
		var name=$(this).text();
		alert(name);
	});


	//on user loged in (only current user
	socket.on("logged",function(){

		//$(location).attr("href","#forum");
		$.mobile.changePage("#forum");
		$("#message").focus();
		$("#login").hide();
	});
	
	/**
	*Sending messages
	**/
	$("#messageSend").click(function(e){
		$.mobile.changePage("#forum");
		socket.emit("newmsg",{message: $("#message").val()});
		$("#message").val('');
		$("#message").focus();
	});
	
	//on user connected (all users)
	socket.on("newuser",function(user){
		$("#users").append('<img src="'+user.avatar+'" id="'+user.id+'"/>');
	});
	//notifying other users that a given user disconnected
	socket.on("dis_user",function(user){
		//alert(user.id);
		$("#"+user.id).remove();
	});
	
	//receiving broadcast message
	socket.on("newmsg",function(message){
		//console.log(message);
		if(lastMsg!=message.user.id)
		{
			$("#messages").append("<div class='separator'></div>");
			lastMsg=message.user.id;
		}
		$("#messages").append('<div class="message">'+Mustache.render(msgtpl,message)+'</div>');
		$("#listView").listView("reflesh");
		$("#messages").animate({scrollTop:$("#messages").prop("scrollHeight")},50);
	});

	$("#mentor").click(function(){
		socket.emit("mentor");
	});

	socket.on("mentor",function(profiles){
		for(var i=0;i<profiles.length;i++){
			console.log(profiles[i].name);
			$("#mentors").append(profiles[i].name+"<br/>");
		}
	});
})(jQuery);