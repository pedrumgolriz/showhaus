<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(E_ALL & ~E_NOTICE);

header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$_POST = file_get_contents("php://input");
$_POST = json_decode($_POST, TRUE);
$mysqli = new mysqli("localhost", "write", "dxV6m6~8", "haus");

$page =  mysqli_real_escape_string($mysqli, $_POST['page']) ;
$date = htmlspecialchars(stripslashes($_POST['date']));
$url = htmlspecialchars(stripslashes($_POST['url']));

echo $page;

$theselect = mysqli_query($mysqli, "SELECT * FROM feeds WHERE page = '".$page."'");
if(mysqli_num_rows($theselect)==0 && $page!="" && $date!="" && $url!=""){
    mysqli_query($mysqli, "INSERT INTO feeds (page, date, url) VALUES ('$page', '$date', '$url')");
    echo 'added';
}
else{
    echo "alreadyAdded";
}
?>
