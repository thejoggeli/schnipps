var canvas, ctx;
var image = null;


var viewport = {width: 1920/4, height: 1080/4};
var padding = {left: 12, right: 12, top: 12, bottom: 12};
var border = {left: 3, right: 3, top: 3, bottom: 3};
var quadOffset = 0;

$(document).ready(function(){
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
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
	$("#image-drop").on("drop", function(e){
		e.preventDefault();
		e.stopPropagation();
		$(this).removeClass("drag");
		var ee = e.originalEvent;
		var dt = ee.dataTransfer;
		var files = dt.files;
		var file = dt.files[0];
		var imageType = /image.*/;
		if (!file.type.match(imageType)) {
			alert("not an image");
			return;
		}
		$("#upload").hide();
		$("#image-drop").hide();
		$("#image-upload").prop("files", files);
		img = new Image();
		var reader = new FileReader();
		reader.onload = function(e){
			img.src = e.target.result;
		};
		img.onload = function(){
			image = img;
			$(".image-props").show();
			$("#canvas").show();
			drawImage();
		}
		reader.readAsDataURL(file);
	});
	$(window).on("resize", function(){
		drawImage();
	});
});
function Part(image, x, y, w, h){
	this.image = image;
	this.view = {x: x, y: y, width: w, height: h};
	this.src = {left: x, right: x+w, top: y, bottom: y+h};
	this.padding = {left: 0, right: 0, top: 0, bottom: 0};
	this.border = {left: 0, right: 0, top: 0, bottom: 0};
	this.inner = {width: w, height: h};
	this.outer = {width: w, height: h};
	this.overflow = {left: 0, right: 0, top: 0, bottom: 0}; 
	this.quads;
	this.paddingQuads;
}
Part.prototype.applyPadding = function(padding){
	this.padding.left = padding.left;
	this.padding.right = padding.right;
	this.padding.top = padding.top;
	this.padding.bottom = padding.bottom;
	this.border.left = 0;
	this.border.right = 0;
	this.border.top = 0;
	this.border.bottom = 0;
	if(this.src.left - this.padding.left < 0){
		var delta = (this.padding.left - this.src.left);
		this.padding.left -= delta;
		this.border.left = delta;
	}
	if(this.src.top - this.padding.top < 0){
		var delta = (this.padding.top - this.src.top);
		this.padding.top -= delta;
		this.border.top += delta;
	}
	console.log(this.src.x + this.src.width + this.padding.right);
	if(this.src.x + this.src.width + this.padding.right > this.image.width){
		console.log("overflow");
		this.padding.right -= (this.image.width - (this.src.x + this.src.width + this.padding.right));
	}
	if(this.src.y + this.src.height + this.padding.bottom > this.image.height){
		this.padding.bottom -= (this.image.height - (this.src.y + this.src.height + this.padding.bottom));
	}
	this.src.left = this.view.x - this.padding.left;
	this.src.top = this.view.y - this.padding.top;
	this.src.right = this.view.x + this.view.width + this.padding.right;
	this.src.bottom = this.view.y + this.view.height + this.padding.bottom;
	
}
Part.prototype.updateBounds = function(){
	this.outer.width = (this.src.right - this.src.left) + this.border.left + this.border.right;
	this.outer.height = (this.src.bottom - this.src.top) + this.border.top + this.border.bottom;
	this.inner.width = (this.src.right-this.src.left);
	this.inner.height = (this.src.bottom-this.src.top);
	this.overflow.left = this.border.left + this.padding.left;
	this.overflow.right = this.border.right + this.padding.right;
	this.overflow.top = this.border.top + this.padding.top;
	this.overflow.bottom = this.border.bottom + this.padding.bottom;
}
Part.prototype.updateQuads = function(){
	this.quads = [];
	this.quads[0] = {
		x: 0,
		y: 0,
		width: this.overflow.left-quadOffset,
		height: this.overflow.top-quadOffset,
		color: "red",
	};
	this.quads[1] = {
		x: this.outer.width - this.overflow.right + quadOffset,
		y: 0,
		width: this.overflow.right-quadOffset,
		height: this.overflow.top-quadOffset,
		color: "blue",
	};
	this.quads[2] = {
		x: this.outer.width - this.overflow.right + quadOffset,
		y: this.outer.height - this.overflow.bottom + quadOffset,
		width: this.overflow.right - quadOffset,
		height: this.overflow.bottom - quadOffset,
		color: "green",
	};
	this.quads[3] = {
		x: 0,
		y: this.outer.height - this.overflow.bottom + quadOffset,
		width: this.overflow.left - quadOffset,
		height: this.overflow.bottom - quadOffset,
		color: "yellow",
	};
	this.paddingQuads = [];
	this.paddingQuads[0] = {
		x: this.border.left,
		y: this.border.top,
		width: this.padding.left,
		height: this.inner.height,
		color: "#ffffff44",
	}
	this.paddingQuads[1] = {
		x: this.border.left + this.inner.width - this.padding.right,
		y: this.border.top,
		width: this.padding.right,
		height: this.inner.height,
		color: "#ffffff44",
	}
	this.paddingQuads[2] = {
		x: this.border.left,
		y: this.border.top + this.inner.height - this.padding.bottom,
		width: this.inner.width,
		height: this.padding.bottom,
		color: "#ffffff44",
	}
	this.paddingQuads[3] = {
		x: this.border.left,
		y: this.border.top,
		width: this.inner.width,
		height: this.padding.top,
		color: "#ffffff44",
	}
}

function drawImage(){
	if(image === null) return;
	
	var num_x = Math.ceil(image.width/viewport.width);
	var num_y = Math.ceil(image.height/viewport.height);
	
	var parts = [];	
	for(var x = 0; x < num_x; x++){
		parts[x] = [];
		for(var y = 0; y < num_y; y++){
			var part = new Part(image, x*viewport.width, y*viewport.height, viewport.width, viewport.height);
			part.applyPadding(padding);
			part.updateBounds();
			part.updateQuads();
			parts[x][y] = part;
		}
	}
	
	var total_w = 0;
	var total_h = 0;
	for(var x = 0; x < num_x; x++){
		var part = parts[x][0];
		total_w += part.outer.width;
	}
	for(var y = 0; y < num_y; y++){
		var part = parts[0][y];
		total_h += part.outer.height;
	}
	
	var aspect = total_w/total_h;
	canvas.width = document.documentElement.clientWidth;
	canvas.height = canvas.width/aspect;
	
	var scale = document.documentElement.clientWidth/total_w;	
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.scale(scale, scale);
	var dx = 0;
	for(var x = 0; x < num_x; x++){
		var dy = 0;
		for(var y = 0; y < num_y; y++){
			var part = parts[x][y];
			ctx.drawImage(
				part.image, 
				part.src.left, part.src.top, (part.src.right-part.src.left), (part.src.bottom-part.src.top),
				dx+part.border.left, dy+part.border.top, part.inner.width, part.inner.height
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
			dy += parts[x][y].outer.height;
		}
		dx += parts[x][0].outer.width;
	}
	ctx.restore();
}
