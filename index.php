<!DOCTYPE html>
<?php 
	
?>
<html><head>
	<title>Der Schnippselisierer</title>
	<script src="jquery-3.2.1.min.js"></script>
	<script src="jquery.cookie.js"></script>
	<script src="storage.js"></script>
	<script src="script.js"></script>
	<script src="toast.js"></script>
	<link rel="stylesheet" type="text/css" href="style.css">
	<link rel="stylesheet" type="text/css" href="toast.css">
</body><body>
	<div class="loading-overlay overlay">
		<div class="fadeout"></div>
		<div class="text">
			<div>Loading image ...</div>
			<div><img src="svg/loader.svg" class="loader"></div>
		</div>
	</div>
	<div class="processing-overlay overlay">
		<div class="fadeout"></div>
		<div class="text">
			<div>Processing image ...</div>
			<div><img src="svg/loader.svg" class="loader"></div>
		</div>
	</div>
	<div class="done-overlay overlay">
		<div class="close">x</div>
		<div class="fadeout"></div>
		<div class="text">
			<div>Done!</div>
			<div><a href="/" class="download-link" download>Download zip file</a></div>
		</div>
	</div>
	<div class="upload-state state">	
		<div class="image-drop-wrap">
			<div id="image-drop"></div>
		</div>
		<div class="image-drop-text">
			Drag & drop image
		</div>	
	</div>
	<div class="image-state state">
		<div class="image-props">
			<div class="group group-size">
				<div class="title">Card size (mm)</div>
				<div><span class="label">Width&nbsp;</span> <input class="card-width" name="width" type="text" value="145"></div>
				<div><span class="label">Height</span> <input class="card-height" name="height" type="text" value="105"></div>
			</div>
			<div class="group group-size">
				<div class="title">Crop size (px)</div>
				<div><span class="label">Width&nbsp;</span> <input class="width" name="width" type="text"></div>
				<div><span class="label">Height</span> <input class="height" name="height" type="text" readonly></div>
			</div>
			<div class="group group-padding"> 
				<div class="title">Options</div>
				<div><span class="label">Padding</span> <input class="padding" type="text" value="16"> </div>
				<div><span class="label">Border&nbsp;</span> <input class="border" type="text" value="8"></div>
			</div>
			<div class="group more">
				<div class="title name">&nbsp;</div>
				<div><span>Size&nbsp;&nbsp; </span><input class="info resolution" type="text" value="720x480" readonly></div>
				<div><span>Aspect </span><input class="info source-aspect" type="text" value="..." readonly></div>
			</div>
			<div class="group group-aspect more"> 
				<div class="title">Result</div>
				<div><span class="label">Stretch</span> <input class="stretch" type="text" value="..." readonly></div>
				<div><span class="label">Aspect&nbsp;</span> <input class="aspect" type="text" value="..." readonly></div>
			</div>
			<div class="group group-dpi more"> 
				<div class="title">DPI</div>
				<div><span class="label">(h)</span> <input class="dpi-x" type="text" value="..." readonly></div>
				<div><span class="label">(v)</span> <input class="dpi-y" type="text" value="..." readonly></div>
			</div>
			<form id="upload" class="group" method="post" action="upload.php" enctype="multipart/form-data">
				<input id="image-upload" name="files[]" type="file" accept=".png, .jpg, .jpeg" style="display:none">
				<input type="submit">
			</form>
			<div class="group">
				<input type="button" class="another" value="Choose another image">
			</div>
			<div class="clearfix"></div>
			<div class="desc">
				Card aspect ratio is <span class="card-aspect">...</span>. 
				Resulting DPI is <span class="result-dpi">...</span>. 
				<a href="javascript:;" class="more-info">More info</a>
				<a href="javascript:;" class="less-info">Less info</a> 
			</div>
		</div>
		<div class="canvas-wrap">
			<canvas id="canvas"></canvas>
		</div>
	</div>
	<div class="toast">
		<div class="inner">
			<span class="toast-text">Toast</div>
		</div>
	</div>
</body></html>
