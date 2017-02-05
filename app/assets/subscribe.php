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
	$to = $email;
    $subject = "Subscription Success!";
	$from = "noreply@showhaus.org";
    $headers = "From: $from". "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
    $message = file_get_contents("email_success.html");
    $variables = array();
    $variables['email'] = $to;
    $variables['city'] = $city;

    foreach($variables as $key => $value){
        $message = str_replace('{{ '.$key.' }}', $value, $message);
	}
    mail($to,$subject,$message,$headers);
}
else{
	echo false;
}
?>