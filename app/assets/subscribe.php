<?php

//if not already in system
//add to db
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$_POST = file_get_contents("php://input");
$_POST = json_decode($_POST, TRUE);
$mysqli = new mysqli("localhost", "write", "dxV6m6~8", "haus");
$email = htmlspecialchars(stripslashes($_POST['email']));
$city = htmlspecialchars(stripslashes($_POST['city']));

//checks to see if already in system
$check =  mysqli_query($mysqli, "SELECT * FROM subscribers WHERE email = '".$email."' ");
if(mysqli_num_rows($check)==0){
	mysqli_query($mysqli, "INSERT INTO subscribers (email, city) VALUES ('$email', '$city')");
	echo true;
}
else{
	echo false;
}
?>