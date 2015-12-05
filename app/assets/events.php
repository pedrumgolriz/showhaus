<?php
header('content-type: application/json; charset=utf-8');
date_default_timezone_set('America/Los_Angeles');
$server_date = date("m/d/Y");
$today_flag = "0";
	$mysqli = new mysqli("localhost", "read", "jX!57u6a", "haus");
  $postnumber = htmlspecialchars(stripslashes($_GET['post']));
  if($postnumber!=""){
    $query = mysqli_query($mysqli, "SELECT DISTINCT *, NULL AS password, NULL AS email FROM venue, events WHERE events.date >= '".$server_date."' AND events.venue = venue.venue AND '".$postnumber."' = events.id ORDER BY date ASC");
    $edit = 1;
  }
  else{
    $query = mysqli_query($mysqli, "SELECT DISTINCT *, NULL AS password, NULL AS email FROM venue, events WHERE STR_TO_DATE(events.date, '%m/%d/%Y') >= STR_TO_DATE('".$server_date."', '%m/%d/%Y') AND events.venue = venue.venue GROUP BY events.id");
    $edit = 0;
  }
  $return = array();
  while($row = mysqli_fetch_assoc($query)){
    //formatting of dates
    //format the location of the image
    if($row['poster']!=""){
      if(substr($row['poster'], 0, 4)=="http"){
        $row['poster'] = html_entity_decode($row['poster']);
      }
      else{
        $row['poster'] = "http://i.showhaus.org/uploads/".$row['poster'];
      }
    }
    if( strtolower($row['city']) == "brooklyn" || strtolower($row['city']) == "new york" ){
      $row['city'] = "NYC";
    }
    //echo $row['city'];
    $row['description'] = html_entity_decode($row['description']);
    $return[] = $row;
  }
	echo $_GET['callback'] . '('.json_encode($return).')';
?>
