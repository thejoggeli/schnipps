<?php
	header('Content-type: application/json');
	
	session_start();
	$wait = 60;
	$time = $_SESSION["save_time"] ?? 0;
	if(time()-$time < $wait){
		$remain = $wait - (time()-$time);
		echo json_encode(["error" => "too-soon", "errorMessage" => "Wait $remain seconds"]);
		exit;
	}	

	$json = [];
	
	$fileinfo = pathinfo($_FILES['file']['name']);
	$fileext = strtolower($fileinfo['extension']);
	
	$imageType;
	if($fileext == "jpg" || $fileext == "jpeg"){
		$imageType = "jpg";
	} else if($fileext == "png"){
		$imageType = "png";
	}
	
	$filepath = "upload";
	$filename = time() . "_" . basename($_FILES['file']['name']);
	$filetarget = "$filepath/$filename";
	move_uploaded_file($_FILES['file']['tmp_name'], $filetarget);
	
	$num_x = $_POST["num_x"];
	$num_y = $_POST["num_y"];
	$parts = json_decode($_POST["parts"], false);
	
	$image;
	if($imageType == "jpg"){
		$image = imagecreatefromjpeg($filetarget);
	} else {
		$image = imagecreatefrompng($filetarget);
	}
	
	$zipfiles = [];
	
	$partspath = "download/" . pathinfo($filename)["filename"];
	mkdir($partspath);	
	$nakedname = pathinfo($filename)["filename"];
	for($x = 0; $x < $num_x; $x++){
		for($y = 0; $y < $num_y; $y++){
			$part = $parts[$x][$y];
			$partname = str_pad($x, 3, '0', STR_PAD_LEFT) . "_" . str_pad($y, 3, '0', STR_PAD_LEFT) . "_" . $nakedname . ".png";
			$img = imagecreatetruecolor($part->outer->width, $part->outer->height);
			$bgcolor = ImageColorAllocate($img, 0xEE, 0xEE, 0xEE);
			ImageFilledRectangle($img, 0, 0, $part->outer->width, $part->outer->height, $bgcolor);
			imagecopymerge(
				$img, $image,
				$part->dst->left, $part->dst->top, $part->src->left, $part->src->top,
				$part->src->width, $part->src->height,
				100
			);
			$quadcolor = ImageColorAllocate($img, 0xFF, 0, 0);
			for($i = 0; $i < 4; $i++){
				$quad = $part->quads[$i];
				ImageFilledRectangle($img, $quad->x, $quad->y, $quad->x+$quad->width-1, $quad->y+$quad->height-1, $quadcolor);
			}			
			
			imagepng($img, $partspath . "/" . $partname);
			$zipfiles[] = $partname;
		}
	}
	
	chdir($partspath);
	$zipname = pathinfo($filename)["filename"] . ".zip";
	
	$zip = new ZipArchive;
	$zip->open($zipname, ZipArchive::CREATE);
	foreach($zipfiles as $file){
		$zip->addFile($file);
	}
	$zip->close();
	
	foreach($zipfiles as $file){
		unlink($file);
	}
	
	$json["download_link"] = $partspath . "/" . $zipname;
	
	$_SESSION["save_time"] = time();

	echo json_encode($json);

?>