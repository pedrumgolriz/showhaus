<?
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$_POST = file_get_contents("php://input");
$_POST = json_decode($_POST, TRUE);
$a = $_POST['a'];
$mysqli = new mysqli("localhost", "read", "jX!57u6a", "haus");
$query = mysqli_query($mysqli, "SELECT pw FROM `passes` ORDER BY id DESC limit 1");

while($row = mysqli_fetch_assoc($query)){
	if($row['pw'] === $a){
		echo 1;
	}
	else{
		echo 0;
	}
}
?>