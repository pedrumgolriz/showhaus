<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(E_ALL & ~E_NOTICE);

header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$mysqli = new mysqli("localhost", "overwrite", "Mfve5@09", "haus");
$_POST = file_get_contents("php://input");
$_POST = json_decode($_POST, TRUE);
$data = json_encode($_POST);
$password = htmlspecialchars(stripslashes($_POST["password"]));

$checkAgainst = mysqli_query($mysqli, "SELECT * FROM events WHERE password = '".$password."' LIMIT 1");

if(mysqli_num_rows($checkAgainst)!=0) {
    mysqli_query($mysqli, "DELETE from events WHERE password = '".$password."'");
    echo "success";
}
else{
    echo "Error";
}
?>