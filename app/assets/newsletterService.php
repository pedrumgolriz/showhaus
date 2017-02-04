<?php
	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
    date_default_timezone_set('US/Eastern');
	//server connection stuff for subscribers db
	//use eventlist.php to sort what cities posts to send to what people; up to 7 days of shows
	$jsonEventList = file_get_contents("eventlist.php");
	$eventList = json_decode($jsonEventList, true);
	$finalEventList = [];
	$eventListCities = array();
	$htmlTemplate = "";
	//restrict date to 7 days ahead of current time
	for($i = 0; $i < count($eventList); $i++){
		if(!array_search($eventList[$i]['city'], $eventListCities)){
			$today = time();
			$dateOfEvent = $eventList[$i]['date'];
			$dateDiff = $dateOfEvent - $today;
			if(-1*((time() - strtotime($eventList[$i]['date']))/(60*60*24)) < 7 && ((time() - strtotime($eventList[$i]['date']))/(60*60*24))){
				array_push($finalEventList, $eventList[$i]);
				array_push($eventListCities, $eventList[$i]['city']);
			}
			$goneThru = true;
		}
	}
	//list of cities with events
	$eventListCities = array_values(array_unique($eventListCities));
	//list of subscribers in each city
	/*
		[{"email":"xxx@xxx.com", "city":"baltimore"},{"email":"abc@abc.com", "city": "NYC"}];
	*/
	$mysqli = new mysqli("localhost", "read", "jX!57u6a", "haus");
	$userTableSQL =  mysqli_query($mysqli, "SELECT * FROM subscribers");
	$userTable = [];
	while($row = mysqli_fetch_assoc($userTableSQL)){
		if($row['email'] !== "" && $row['city'] !== ""){
			if(filter_var($row['email'], FILTER_VALIDATE_EMAIL)){
				array_push($userTable, $row);
			}
		}
	}
	for($q = 0; $q < count($eventListCities); $q++){
		for($z = 0; $z < count($userTable); $z++){
			if($eventListCities[$q] === $userTable[$z]['city'] && $goneThru == true){
				$to = $userTable[$z]['email'];
                $subject = "Upcoming Shows in ".$userTable[$z]['city'];
                $from = "noreply@showhaus.org";
                $headers = "From: $from". "\r\n";
                $headers .= "MIME-Version: 1.0\r\n";
                $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
                $message = file_get_contents("email_min.html");
                $variables = array();
                $variables['email'] = $to;
                $variables['city'] = $userTable[$z]['city'];
                $variables['tuesdayShows'] = '';
                $variables['wednesdayShows'] = '';
                $variables['thursdayShows'] = '';
                $variables['fridayShows'] = '';
                $variables['saturdayShows'] = '';
                $variables['sundayShows'] = '';
                $variables['mondayShows'] = '';


				//sort eventlist by date low2high $finalEventList[$t].date

                //loop thru eventslist
                //for each day Tues to Mon
                for($f = 0; $f < count($finalEventList); $f++){
	                $showTemplate = $finalEventList[$f]['title'];
	                $venueTemplate = '<div style="font-size:12px">@ '.$finalEventList[$f]['venue'].'</div><br/>';
	                if($finalEventList[$f]['fb_event']){
	                    $showTemplate = "<div><a href='".$finalEventList[$f]['fb_event']."'>".$showTemplate."</a>";
	                    if($finalEventList[$f]['featured'] !== ''){
                            $showTemplate.= "<b> &#128077;</b>";
                        }
                        else{
                            $showTemplate.="</div>";
                        }
	                }
	                else{
                        $showTemplate = "<div>".$showTemplate."</div>";
	                }
	                $eventStrTime = strtotime($finalEventList[$f]['date']);
	                if(date("l", $eventStrTime) === "Tuesday"){
	                    $variables['tuesdayShows'].=$showTemplate.$venueTemplate;
	                    $variables['tuesdayDate'] = $finalEventList[$f]['date'];
	                }
	                else if(date("l", $eventStrTime) === "Wednesday"){
	                    $variables['wednesdayShows'] .= $showTemplate.$venueTemplate;
                        $variables['wednesdayDate'] = $finalEventList[$f]['date'];
	                }
	                else if(date("l", $eventStrTime) === "Thursday"){
                        $variables['thursdayShows'] .= $showTemplate.$venueTemplate;
                        $variables['thursdayDate'] = $finalEventList[$f]['date'];
                    }
                    else if(date("l", $eventStrTime) === "Friday"){
                        $variables['fridayShows'] .= $showTemplate.$venueTemplate;
                        $variables['fridayDate'] = $finalEventList[$f]['date'];
                    }
                    else if(date("l", $eventStrTime) === "Saturday"){
                        $variables['saturdayShows'] .= $showTemplate.$venueTemplate;
                        $variables['saturdayDate'] = $finalEventList[$f]['date'];
                    }
                    else if(date("l", $eventStrTime) === "Sunday"){
                        $variables['sundayShows'] .= $showTemplate.$venueTemplate;
                        $variables['sundayDate'] = $finalEventList[$f]['date'];
                    }
                    else if(date("l", $eventStrTime) === "Monday"){
                        $variables['mondayShows'] .= $showTemplate.$venueTemplate;
                        $variables['mondayDate'] = $finalEventList[$f]['date'];
                    }
                }

                foreach($variables as $key => $value){
                  $message = str_replace('{{ '.$key.' }}', $value, $message);
                }
                echo $message;
                mail($to,$subject,$message,$headers);
			}
		}
	}
?>