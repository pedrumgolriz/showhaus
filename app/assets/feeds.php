<?php
  header('content-type: application/json; charset=utf-8');
	$mysqli = new mysqli("localhost", "read", "jX!57u6a", "haus");
	//if too many results, limit in the future
	//sort by id! when that day comes
	$query = mysqli_query($mysqli, "SELECT * FROM feeds");
	$thearray = array();
	while($row = mysqli_fetch_assoc($query)){
		$thearray[] = [$row['page'],$row['date'],$row['url']];
	}
	echo $_GET['callback'] . '('.json_encode($thearray) .')';
	//[city][venue]
?>
