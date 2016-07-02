<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(E_ALL & ~E_NOTICE);

header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$_POST = file_get_contents("php://input");
$_POST = json_decode($_POST, TRUE);
$mysqli = new mysqli("localhost", "overwrite", "Mfve5@09", "haus");

$mode =  htmlspecialchars(stripslashes($_POST['mode']));
$password =  htmlspecialchars(stripslashes($_POST['password']));
$comments =  htmlspecialchars(stripslashes($_POST['comments']));
$postNumber = htmlspecialchars(stripslashes($_POST['postNumber']));

$pwQuery = mysqli_query($mysqli, "SELECT pw FROM `passes` ORDER BY id DESC limit 1");

while($row = mysqli_fetch_assoc($pwQuery)){
	if($row['pw'] === $password){
		$correctPW = true;
	}
	else{
		echo "intruder";
		exit();
	}
}

if($mode == "edit"){
	$editQuery = mysqli_query($mysqli, "SELECT * FROM events WHERE id = '".$postNumber."' LIMIT 1");
	while($row = mysqli_fetch_assoc($editQuery)){
    	if($row['password']!=="tapedeck"){
    	    echo $row['password'];
    	}
    	else{
    	    echo "false";
    	}
    }
}
else if($mode == "delete"){
	//run events.php]
    mysqli_query($mysqli, "DELETE from events WHERE id = '".$postNumber."'");
	include('events.php');
	echo "delete";
}
else if($mode == "staffPick"){
	//run events.php
	mysqli_query($mysqli, "UPDATE events SET featured = '$comments' where id = '$postNumber'");
	include('events.php');
	echo "staffPick";
}
else{
	echo "intruder";
	exit();
}
?>