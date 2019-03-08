
function Toast(){}
Toast.show = function(text, duration){
	$(".toast-text").html(text);
	$(".toast").finish().clearQueue().fadeIn(250).delay(duration*1000).fadeOut(250);
}
Toast.info = function(text, duration){
	Toast.setClass("info");
	Toast.show(text, duration);
}
Toast.error = function(text, duration){
	Toast.setClass("error");
	Toast.show(text, duration);
}
Toast.success = function(text, duration){
	Toast.setClass("success");
	Toast.show(text, duration);
}
Toast.setClass = function(c){
	$(".toast").removeClass("info");
	$(".toast").removeClass("error");	
	$(".toast").removeClass("success");	
	$(".toast").addClass(c);	
}