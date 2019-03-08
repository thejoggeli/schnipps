var canvas, ctx;
var image = null;


var viewport = {width: 1920/4, height: 1080/4};
var padding = {left: 12, right: 12, top: 12, bottom: 12};
var border = 12;
var file;
var parts;
var num_x;
var num_y;

$(document).ready(function(){
	showState("upload");
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	$(".image-state .another").on("click", function(){
		showState("upload");
	});
	$(".image-state input[type=text]").on("change", function(){
		applyMenu();
		drawImage();
	});
	$("#image-drop").on("click", function(){
		$("#image-upload").trigger("click");
	});
	$("#image-drop").on("dragenter", function(e){
		e.preventDefault();
		e.stopPropagation();
		$(this).addClass("drag");
	});
	$("#image-drop").on("dragleave", function(e){
		e.preventDefault();
		e.stopPropagation();
		$(this).removeClass("drag");
	});
	$("#image-drop").on("dragover", function(e){
		e.preventDefault();
		e.stopPropagation();
	});
	$("#image-upload").on("change", function(e){
		e.preventDefault();
		e.stopPropagation();
		processFiles(e.originalEvent.target.files);
	});
	$("#image-drop").on("drop", function(e){
		e.preventDefault();
		e.stopPropagation();
		$(this).removeClass("drag");
		var ee = e.originalEvent;
		var dt = ee.dataTransfer;
		var files = dt.files;
		processFiles(files);
	});
	$(".image-state").on("submit", function(e){
		e.preventDefault();
		e.stopPropagation();
		var data = new FormData();
	//	data.file = file;
		data.append("file", file);
		data.append("num_x", num_x);
		data.append("num_y", num_y);
		var part_data = [];
		for(var x = 0; x < num_x; x++){
			part_data[x] = [];
			for(var y = 0; y < num_y; y++){
				var part = parts[x][y];
				part_data[x][y] = {
					view: part.view,
					src: part.src,
					dst: part.dst,
					padding: part.padding,
					outer: part.outer,
					quads: part.quads,
					paddingQuads: part.paddingQuads,
				};
			}
		}
		data.append("parts", JSON.stringify(part_data));
		$(".processing-overlay").show();
		$.ajax({
			url: "upload.php",
			type: "post",
			enctype: "multipart/form-data",
			data: data,
			processData: false,
			contentType: false,
		}).done(function(json){
			console.log(json);
			$(".processing-overlay").hide();
			$(".done-overlay").show();
			$(".download-link").attr("href", json.download_link);
		}).fail(function(data){
			console.log(data);
			alert("Error (" + data.status + " - " + data.statusText + ")");
			$(".processing-overlay").fadeOut();
		});
		return false;
	});
	$(".overlay .close").on("click", function(){
		$(this).closest(".overlay").fadeOut();
	});
	$(window).on("resize", function(){
		drawImage();
	});
});
function applyMenu(){
	var _padding = parseInt($(".image-props .padding").val());
	var _border = parseInt($(".image-props .border").val());
	var _width = parseInt($(".image-props .width").val());
	var _height = parseInt($(".image-props .height").val());
	viewport.width = _width;
	viewport.height = _height;
	padding.left = padding.right = padding.top = padding.bottom = _padding;
	border = _border;
}
function processFiles(files){
	var _file = files[0];
	var imageType = /image.*/;
	if (!_file.type.match(imageType)) {
		alert("not an image");
		return;
	}
	img = new Image();
	img.name = _file.name;
	var reader = new FileReader();
	reader.onload = function(e){
		img.src = e.target.result;
	};
	$(".loading-overlay").show();
	img.onload = function(){
		image = img;
		$(".image-props").show();
		$("#canvas").show();
		showState("image");
		applyMenu();
		drawImage();
		$(".loading-overlay").fadeOut();
	}
	reader.readAsDataURL(_file);
	file = _file;
}
function showState(state){
	$(".state").hide();
	$("."+state+"-state").show();
	if(state == "image"){
		$(".image-props .width").val(image.width/4);
		$(".image-props .height").val(image.height/4);
		$(".image-props .resolution").val(image.width + "x" + image.height);
		$(".image-props .name").val(image.name);
	}
}
function Part(image, x, y, w, h){
	this.image = image;
	this.view = {left: x, top: y, width: w, height: h, right: x+w, bottom: y+h};
	this.src = {left: x, top: y, width: w, height: h, left:x+w, bottom:y+h};
	this.dst = {left: x, top: y, width: w, height: h, left:x+w, bottom:y+h};
	this.padding = {left: 0, right: 0, top: 0, bottom: 0};
	this.outer = {width: w, height: h};
	this.quads;
	this.paddingQuads;
}
Part.prototype.applyPadding = function(padding){
	this.padding.left = padding.left;
	this.padding.right = padding.right;
	this.padding.top = padding.top;
	this.padding.bottom = padding.bottom;
	this.src.left = this.view.left - this.padding.left;
	this.src.right = this.view.left + this.view.width + this.padding.right;
	this.src.top = this.view.top - this.padding.top;
	this.src.bottom = this.view.top + this.view.height + this.padding.bottom;
	this.dst.left = 0;
	this.dst.right = this.view.width + this.padding.left + this.padding.right;
	this.dst.top = 0;
	this.dst.bottom = this.view.height + this.padding.top + this.padding.bottom;
	if(this.src.left < 0){
		this.dst.left += (-this.src.left);
		this.src.left = 0;
	}
	if(this.src.top < 0){
		this.dst.top += (-this.src.top);
		this.src.top = 0;
	}
	if(this.src.right > this.image.width){
		this.dst.right -= (this.src.right - this.image.width);
		this.src.right = this.image.width;
	}
	if(this.src.bottom > this.image.height){
		this.dst.bottom -= (this.src.bottom - this.image.height);
		this.src.bottom = this.image.height;
	}
	this.src.width = this.src.right - this.src.left;
	this.src.height = this.src.bottom - this.src.top;
	this.dst.width = this.dst.right - this.dst.left;
	this.dst.height = this.dst.bottom - this.dst.top;
	this.outer.width = this.view.width + this.padding.left + this.padding.right;
	this.outer.height = this.view.height + this.padding.top + this.padding.bottom;
	this.updateQuads();
}
Part.prototype.updateQuads = function(){
	this.quads = [];
	this.quads[0] = {
		x: 0,
		y: 0,
		width: this.padding.left,
		height: this.padding.top,
		color: "red",
	};
	this.quads[1] = {
		x: this.outer.width - this.padding.right,
		y: 0,
		width: this.padding.right,
		height: this.padding.top,
		color: "blue",
	};
	this.quads[2] = {
		x: 0,
		y: this.outer.height - this.padding.bottom,
		width: this.padding.left,
		height: this.padding.bottom,
		color: "green",
	};
	this.quads[3] = {
		x: this.outer.width - this.padding.right,
		y: this.outer.height - this.padding.bottom,
		width: this.padding.right,
		height: this.padding.bottom,
		color: "yellow",
	};
	this.paddingQuads = [];
	this.paddingQuads[0] = {
		x: 0,
		y: 0,
		width: this.padding.left,
		height: this.outer.height,
		color: "#ffffff44",
	}
	this.paddingQuads[1] = {
		x: 0,
		y: 0,
		width: this.outer.width,
		height: this.padding.top,
		color: "#ffffff44",
	}
	this.paddingQuads[2] = {
		x: this.outer.width - this.padding.right,
		y: 0,
		width: this.padding.right,
		height: this.outer.height,
		color: "#ffffff44",
	}
	this.paddingQuads[3] = {
		x: 0,
		y: this.outer.height - this.padding.bottom,
		width: this.outer.width,
		height: this.padding.bottom,
		color: "#ffffff44",
	}
}

function drawImage(){
	if(image === null) return;
	
	num_x = Math.ceil(image.width/viewport.width);
	num_y = Math.ceil(image.height/viewport.height);
	
	parts = [];	
	for(var x = 0; x < num_x; x++){
		parts[x] = [];
		for(var y = 0; y < num_y; y++){
			var part = new Part(image, x*viewport.width, y*viewport.height, viewport.width, viewport.height);
			part.applyPadding(padding);
			parts[x][y] = part;
		}
	}
	
	var total_w = border;
	var total_h = border;
	for(var x = 0; x < num_x; x++){
		var part = parts[x][0];
		total_w += part.outer.width;
		total_w += border;
	}
	for(var y = 0; y < num_y; y++){
		var part = parts[0][y];
		total_h += part.outer.height;
		total_h += border;
	}
	
	var aspect = total_w/total_h;
	canvas.width = Math.floor(document.documentElement.clientWidth);
	canvas.height = Math.floor(canvas.width/aspect);
	
	var scale = document.documentElement.clientWidth/total_w;	
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.scale(scale, scale);
	var dx = border;
	for(var x = 0; x < num_x; x++){
		var dy = border;
		for(var y = 0; y < num_y; y++){
			var part = parts[x][y];
			ctx.drawImage(
				part.image, 
				part.src.left, part.src.top, part.src.width, part.src.height,
				dx+part.dst.left, dy+part.dst.top, part.dst.width, part.dst.height
			);
			for(var i = 0; i < part.paddingQuads.length; i++){
				var quad = part.paddingQuads[i];
				ctx.fillStyle = quad.color;
				ctx.fillRect(dx + quad.x, dy + quad.y, quad.width, quad.height);
			}
			for(var i = 0; i < part.quads.length; i++){
				var quad = part.quads[i];
				ctx.fillStyle = quad.color;
				ctx.fillRect(dx + quad.x, dy + quad.y, quad.width, quad.height);
			} 
			dy += parts[x][y].outer.height + border;
		}
		dx += parts[x][0].outer.width + border;
	}
	ctx.restore();
	$(".image-props .aspect").val((viewport.width+padding.left+padding.right)/(viewport.height+padding.top+padding.bottom));
}
