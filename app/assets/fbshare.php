<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(E_ALL & ~E_NOTICE);

header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$_POST = file_get_contents("php://input");
$_POST = json_decode($_POST, TRUE);

if($_POST["data"]){
	$data = $_POST["data"];
    $fileExt = "jpg";
    $filename = uniqid(md5($_POST["poster"]));
    $filename = substr($filename, 0, 25);
    list($type, $data) = explode(';', $data);
    list(, $data) = explode(',', $data);
    $data = base64_decode($data);

    file_put_contents("/var/www/vhosts/showhaus.org/i.showhaus.org/uploads/".$filename.".".$fileExt, $data);
    echo "http://i.showhaus.org/uploads/".$filename.".".$fileExt;
}

?>