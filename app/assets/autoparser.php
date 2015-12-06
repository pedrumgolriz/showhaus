<?php
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
    
    date_default_timezone_set('US/Eastern');
    require_once __DIR__ . '/Facebook/autoload.php';
    
    $fb = new Facebook\Facebook([
                                'app_id' => '204851123020578',
                                'app_secret' => 'e744d44a65ce289709993b66bffb3318',
                                'default_graph_version' => 'v2.5',
                                'default_access_token' => '204851123020578|0joKWgaSJfM197SAhfZCMAzILhY', // optional
                                ]);
    
    
    $_POST = file_get_contents("php://input");
    $_POST = json_decode($_POST, TRUE);
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
        $venues[$iter] = strtolower(str_replace(' ', '', $row['venue']."*".$row['city']));
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
            if(!ctype_digit($facebookId)){
                $facebookId = explode('.com/', $facebookId)[1];
                $feedsEvents = $fb->get('/'.$facebookId.'events?start_time,ticket_uri')->getGraphEdge('GraphEvent');
            }
            else{
                $feedsEvents = $fb->get('/'.$facebookId.'/events?start_time,ticket_uri')->getGraphEdge('GraphEvent');
            }
            $today = date("Y-m-d");
            for($i = 0; $i<sizeof($feedsEvents); $i++){
                if(date_format($feedsEvents[$i]->getProperty('start_time'), 'Y-m-d') > $today){
                    getEventDetails($fb, $feedsEvents[$i]->getProperty('id'), $events, $venues, $mysqli);
                }
            }
            //mysqli_close($mysqli);
        } catch(Facebook\Exceptions\FacebookResponseException $e) {
            echo 'Graph returned an error: ' . $e->getMessage();
        } catch(Facebook\Exceptions\FacebookSDKException $e) {
            echo 'Facebook SDK returned an error: ' . $e->getMessage();
            exit;
        }
    }
    
    function getEventDetails($fb, $eventId, $events, $venues, $mysqli){
        try {
            if(checkAgainstDB($eventId, $events)){
                $eventId = $fb->get('/'.$eventId.'?fields=ticket_uri,start_time,name,place,description,picture')->getGraphObject();
                postToDB($eventId, $venues, $mysqli);
            }
        } catch(Facebook\Exceptions\FacebookResponseException $e) {
            // When Graph returns an error
            echo 'Graph returned an error: ' . $e->getMessage();
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
        $title = $event->getProperty('name');
        $description = $event->getProperty('description');
        $venue = $event->getProperty('place')->getProperty('name');
        if(isset($venue)){
            $property = $event->getProperty('place');
            if(isset($property->getProperty('location')["name"])){
                $venue = $property->getProperty('location')["name"];
            }
            if(isset($property->getProperty('location')["city"])){
                $city = $property->getProperty('location')["city"];
                echo $city;
            }
            else{
                $temp = strtolower(str_replace(' ', '', $venue));
                //check if partial match in $venues
                $matches = implode(',',preg_grep("/".$temp."/", $venues));
                $city = substr($matches, strpos($matches, "*")+1);
            }
            if(isset($property->getProperty('location')["street"])){
                $address = $property->getProperty('location')["street"];
                echo $address;
            }
            else{
                $address = "";
            }
            if(isset($property->getProperty('location')["state"])){
                $state = $property->getProperty('location')["state"];
                echo $state;
            }
            else{
                $state = "";
            }
            if(isset($property->getProperty('location')["zip"])){
                $zip = $property->getProperty('location')["zip"];
                echo $zip;
            }
            else{
                $zip = "";
            }
            if(isset($city)&&isset($venue)){
                if(in_array(strtolower(str_replace(' ', '', $venue."*".$city)), $venues)){
                    echo "match and ignore";
                }
                else{
                    mysqli_query($mysqli, "INSERT INTO venue (venue, address, city, state, zip) VALUES ('$venue','$address','$city','$state','$zip')");
                }
            }
        }
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
        if(isset($city)){
            mysqli_query($mysqli, "INSERT INTO events (title, venue, city, date, time, price, email, password, fb_event, ticket_uri) VALUES ('$title','$venue','$city','$date','$time','$price','$email','$password','$fb_event','$ticket_uri')");
        }
    }
    
    class stdObject {
        public function __construct(array $arguments = array()) {
            if (!empty($arguments)) {
                foreach ($arguments as $property => $argument) {
                    $this->{$property} = $argument;
                }
            }
        }
        
        public function __call($method, $arguments) {
            $arguments = array_merge(array("stdObject" => $this), $arguments); // Note: method argument 0 will always referred to the main class ($this).
            if (isset($this->{$method}) && is_callable($this->{$method})) {
                return call_user_func_array($this->{$method}, $arguments);
            } else {
                throw new Exception("Fatal error: Call to undefined method stdObject::{$method}()");
            }
        }
    }
?>