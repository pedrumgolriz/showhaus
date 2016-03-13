<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(E_ALL & ~E_NOTICE);

header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$mysqli = new mysqli("localhost", "read", "jX!57u6a", "haus");
$_POST = file_get_contents("php://input");
$_POST = json_decode($_POST, TRUE);
$data = json_encode($_POST);
$post = $_POST["_"];
$password = $_POST["password"];

$checkAgainst = mysqli_query($mysqli, "SELECT * FROM events WHERE id = '".$post."' AND password = '".$password."' LIMIT 1");

if(mysqli_num_rows($checkAgainst)!=0) {
    echo "success";
}
else{
    echo "fail";
}
?>
