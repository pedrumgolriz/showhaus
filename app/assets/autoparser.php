<?php
    ini_set('display_errors', '1');
    ini_set('max_execution_time', 0);
    error_reporting(E_ALL);
    
    date_default_timezone_set('US/Eastern');
    require_once __DIR__ . '/Facebook/autoload.php';
    
    $fb = new Facebook\Facebook([
                                'app_id' => '204851123020578',
                                'app_secret' => 'e744d44a65ce289709993b66bffb3318',
                                'default_graph_version' => 'v2.5',
                                'default_access_token' => '204851123020578|0joKWgaSJfM197SAhfZCMAzILhY', // optional
                                ]);
    

    $mysqli = new mysqli("localhost", "write", "dxV6m6~8", "haus");
    
    //Array that holds each event object
    $events = [];
    $feeds = [];
    $iter = 0;
    $venues = [];
    
    //Get all facebook page names from feed table & get all the current events with facebook url's and check it against the facebook column
    $currentFacebookEvents = mysqli_query($mysqli, "SELECT fb_event FROM events WHERE fb_event != ''");
    $currentFeeds = mysqli_query($mysqli, "SELECT url FROM feeds");
    $currentVenues = mysqli_query($mysqli, "SELECT venue, city FROM venue");
    
    while($row = mysqli_fetch_assoc($currentFacebookEvents)){
        $events[$iter] = explode('/events/',$row['fb_event'])[1];
        $iter++;
    }
    $iter = 0;
    while($row = mysqli_fetch_assoc($currentFeeds)){
        $feeds[$iter] = $row['url'];
        $iter++;
    }
    $iter = 0;
    while($row = mysqli_fetch_assoc($currentVenues)){
        //$venues[$iter] = {'venue': $row['venue'], 'city': $row['city']};
        $venues[$iter] = new stdClass();
        $venues[$iter] -> venue = $row['venue'];
        $venues[$iter] -> city = $row['city'];
        //strtolower(str_replace(' ', '', $row['venue']."*".$row['city']));
        $iter++;
    }
    
    foreach ($feeds as &$page){
        getEventsByPage($fb, $page, $events, $venues, $mysqli);
    }
    
    //run each facebook page thru fql and store into array as object
    
    //echo facebook page details & correct data to match showhaus structure
    
    //check that the event id is not currently in the events table
    //if event[i].id is NOT in events table, post to events table with master password and feeder@showhaus.org
    
    function getEventsByPage($fb, $page, $events, $venues, $mysqli){
        try {
            $response = $fb->get('/'.$page);
            $facebookId = $response->getGraphObject()->getProperty('id');
            $feedsEvents = $fb->get('/'.$facebookId.'/events?start_time,ticket_uri')->getGraphEdge('GraphEvent');
            $today = date("Y-m-d");
            for($i = 0; $i<sizeof($feedsEvents); $i++){
                if(date_format($feedsEvents[$i]->getProperty('start_time'), 'Y-m-d') > $today){
                    getEventDetails($fb, $feedsEvents[$i]->getProperty('id'), $events, $venues, $mysqli);
                }
            }
            //mysqli_close($mysqli);
        } catch(Facebook\Exceptions\FacebookResponseException $e) {
            echo $e->getMessage();
        } catch(Facebook\Exceptions\FacebookSDKException $e) {
            echo 'Facebook SDK returned an error: ' . $e->getMessage();
        }
    }
    
    function getEventDetails($fb, $eventId, $events, $venues, $mysqli){
        try {
            if(checkAgainstDB($eventId, $events)){
                $eventId = $fb->get('/'.$eventId.'?fields=ticket_uri,start_time,name,place,description')->getGraphObject();
                if(is_object($eventId)){
                    postToDB($eventId, $venues, $mysqli);
                }
            }
        } catch(Facebook\Exceptions\FacebookResponseException $e) {
            // When Graph returns an error
            echo ' N.E ';
        } catch(Facebook\Exceptions\FacebookSDKException $e) {
            // When validation fails or other local issues
            echo 'Facebook SDK returned an error: ' . $e->getMessage();
            exit;
        }
    }
    
    function checkAgainstDB($eventId, $events){
        if(in_array($eventId, $events)){
            return false; //exists in array, therefore ignore
        }
        else{
            return true;
        }
    }
    
    function postToDB($event, $venues, $mysqli){
        try{
            $title = $event->getProperty('name');
            $title = mysqli_real_escape_string($mysqli, $title);
            $description = $event->getProperty('description');
            $description = mysqli_real_escape_string($mysqli, $description);
            $testPlace = $event->getProperty('place');
            if(is_object($testPlace)){
                $venue = $event->getProperty('place')->getProperty('name');
                $venue = mysqli_real_escape_string($mysqli, $venue);
            }
            if(isset($venue)){
                $property = $event->getProperty('place');
                if(isset($property->getProperty('location')["name"])){
                    $venue = $property->getProperty('location')["name"];
                    $venue = mysqli_real_escape_string($mysqli, $venue);
                }
                if(isset($property->getProperty('location')["city"])){
                    $city = $property->getProperty('location')["city"];
                    $city = mysqli_real_escape_string($mysqli, $city);
                }
                else{
                    echo $property->getProperty('location');
                }
                if(isset($property->getProperty('location')["street"])){
                    $address = $property->getProperty('location')["street"];
                    $address = mysqli_real_escape_string($mysqli,$address);
                }
                else{
                    $address = "";
                }
                if(isset($property->getProperty('location')["state"])){
                    $state = $property->getProperty('location')["state"];
                    $state = mysqli_real_escape_string($mysqli, $state);
                }
                else{
                    $state = "";
                }
                if(isset($property->getProperty('location')["zip"])){
                    $zip = $property->getProperty('location')["zip"];
                    $zip = mysqli_real_escape_string($mysqli, $zip);
                }
                else{
                    $zip = "";
                }
                if(isset($city)&&isset($venue)){
                    for($c = 0; $c < sizeof($venues); $c++){
                        if($venues[$c]->venue == $venue && $venues[$c]->city == $city){
                            echo "venue already exists";
                        }
                        else{
                            mysqli_query($mysqli, "INSERT INTO `venue` (`venue`, `address`, `city`, `state`, `zip`) VALUES ('$venue','$address','$city','$state','$zip')");
                            break;
                        }
                    }
                }
                if(isset($city)){
                    $date = date_format($event->getProperty('start_time'), 'm/d/Y');
                    $time = date_format($event->getProperty('start_time'), 'g:i A');
                    $ticket_uri = $event->getProperty('ticket_uri');
                    preg_match('/free/', $description, $match);
                    if(array_key_exists(1, $match)){
                        $price = 0;
                    }
                    else{
                        $price = -1;
                    }
                    preg_match('/\$([0-9]+[\.]*[0-9]*)/', $description, $match);
                    if(array_key_exists(1, $match)){
                        $price = $match[1];
                    }
                    $fb_event = "http://facebook.com/events/".$event->getProperty('id');
                    $email = "feeder@showhaus.org";
                    $password = "tapedeck";
                    //post to events
                    echo $venue." show posted\n";
                    mysqli_query($mysqli, "INSERT INTO events (`title`, `venue`, `city`, `date`, `time`, `price`, `email`, `password`, `fb_event`, `ticket_uri`) VALUES ('$title','$venue','$city','$date','$time','$price','$email','$password','$fb_event','$ticket_uri')");
                }
            }
        }
        catch(Facebook\Exceptions\FacebookResponseException $e) {
                // When Graph returns an error
                echo 'ERROR ON SOMETHING CONTINUE';
            } catch(Facebook\Exceptions\FacebookSDKException $e) {
                // When validation fails or other local issues
                echo 'Facebook SDK returned an error: ' . $e->getMessage();
                exit;
            }
    }
?>