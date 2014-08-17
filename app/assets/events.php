<?php
header('content-type: application/json; charset=utf-8');
date_default_timezone_set('America/New_York');
$server_date = date("m/d/Y");
$today_flag = "0";
	$mysqli = new mysqli("localhost", "read", "jX!57u6a", "haus");
	$query = mysqli_query($mysqli, "SELECT DISTINCT *, NULL AS password, NULL AS email FROM venue, events WHERE events.date >= '".$server_date."' AND events.venue = venue.venue ORDER BY date ASC");
  $return = array();
  while($row = mysqli_fetch_assoc($query)){
    //formatting of dates
    if($server_date == $row['date']){
      $row['featured'] = "today";
      $row['date'] = "Today";
    }
    //format the location of the image
    if($row['poster']!=""){
      if(substr($row['poster'], 0, 4)=="http"){
        $row[poster] = html_entity_decode($row['poster']);
      }
      else{
        $row['poster'] = "http://i.showhaus.org/uploads/".$row['poster'];
      }
    }
    $return[] = $row;
  }
	echo $_GET['callback'] . '('.json_encode($return).')';
?>
