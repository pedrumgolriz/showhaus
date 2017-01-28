<?php
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
$pass = "Decca44320!";
$password = $_GET['pass'];
if($password === $pass){
	$mysqli = new mysqli("localhost", "read", "jX!57u6a", "haus");
	$subscribers =  mysqli_query($mysqli, "SELECT * FROM subscribers");
	echo "<h1>Subscriptions: ".mysqli_num_rows($subscribers)."</h1>";
	while($row = mysqli_fetch_assoc($subscribers)){
		echo $row['email']."<br/>";
	}
}

?>
