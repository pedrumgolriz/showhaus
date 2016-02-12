<?php
  header('content-type: application/json; charset=utf-8');
	$mysqli = new mysqli("localhost", "read", "jX!57u6a", "haus");
	//if too many results, limit in the future
	//sort by id! when that day comes
	$query = mysqli_query($mysqli, "SELECT * FROM venue");
	$thearray = array();
	while($row = mysqli_fetch_assoc($query)){
		if(strtolower($row['city']==='brooklyn')){
			$row['city'] = 'New York';
		}
		$thearray[] = [$row['city'],$row['venue'],$row['address']];
	}
	echo $_GET['callback'] . '('.json_encode($thearray) .')';
	//[city][venue]
?>
