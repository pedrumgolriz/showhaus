<?php

//if already in the system
//delete row of email
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$_POST = file_get_contents("php://input");
$_POST = json_decode($_POST, TRUE);
$mysqli = new mysqli("localhost", "overwrite", "Mfve5@09", "haus");
$email = htmlspecialchars(stripslashes($_GET['email']));

//checks to see if already in system
$check =  mysqli_query($mysqli, "SELECT * FROM subscribers WHERE email = '".$email."' ");
if(mysqli_num_rows($check)>0){
	mysqli_query($mysqli, "DELETE FROM subscribers WHERE email = '".$email."' LIMIT 1");
	echo "You are now unsubscribed from our mailing list. To resubscribe, visit http://showhaus.org and sign up at the bottom of the page.";
}
else{
	echo "something went wrong";
	echo mysqli_num_rows($check);
}

?>