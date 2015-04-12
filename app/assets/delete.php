<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(E_ALL & ~E_NOTICE);

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$post = $_POST['id'];
$password = $_POST['password'];

$_POST = file_get_contents("php://input");
$_POST = json_decode($_POST, TRUE);
$mysqli = new mysqli("localhost", "overwrite", "Mfve5@09", "haus");

$checkAgainst = mysqli_query($mysqli, "SELECT * FROM venue WHERE id = '$post' AND password = '$password'");

if(mysqli_num_rows($checkAgainst)!=0) {
    mysqli_query($mysqli, "DELETE from events WHERE id = '$post'");
}
else{
    http_response_code(007);
}
?>