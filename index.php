<!DOCTYPE html>
<?php 
	
?>
<html><head>
	<title>Post</title>
	<script src="jquery-3.2.1.min.js"></script>
	<script src="script.js"></script>
	<link rel="stylesheet" type="text/css" href="style.css">
</body><body>
	<div>
		<form id="upload" method="post" action="upload.php" enctype="multipart/form-data">
			<input id="image-upload" name="files[]" type="file" accept=".png, .jpg, .jpeg">
		</form>
		<div id="image-drop"></div>
		<div class="image-props">
			x <input type="text">
			y <input type="text">
		</div>
		<div class="canvas-wrap">
			<canvas id="canvas"></canvas>
		</div>
	</div>
</body></html>
