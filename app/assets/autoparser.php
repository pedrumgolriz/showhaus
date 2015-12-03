<?php
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

//Get all facebook page names from feed table & get all the current events with facebook url's and check it against the facebook column
$currentFacebookEvents = mysqli_query($mysqli, "SELECT fb_event FROM events WHERE fb_event != ''");
$currentFeeds = mysqli_query($mysqli, "SELECT url FROM feeds");

while($row = mysqli_fetch_assoc($currentFacebookEvents)){
	$events[$iter] = explode('/events/',$row['fb_event'])[1];
	$iter++;
}
$iter = 0;
while($row = mysqli_fetch_assoc($currentFeeds)){
	$feeds[$iter] = $row['url'];
	$iter++;
}

foreach ($feeds as &$page){
    getEventsByPage($fb, $page, $events);
}

//run each facebook page thru fql and store into array as object

//echo facebook page details & correct data to match showhaus structure

//check that the event id is not currently in the events table
	//if event[i].id is NOT in events table, post to events table with master password and feeder@showhaus.org

function getEventsByPage($fb, $page, $events){
    try {
      $response = $fb->get('/'.$page);
      $facebookId = $response->getGraphObject()->getProperty('id');
      $feedsEvents = $fb->get('/'.$facebookId.'/events?start_time')->getGraphEdge('GraphEvent');
      $today = date("Y-m-d");
      for($i = 0; $i<sizeof($feedsEvents); $i++){
        if(date_format($feedsEvents[$i]->getProperty('start_time'), 'Y-m-d') > $today){
            getEventDetails($fb, $feedsEvents[$i]->getProperty('id'), $events);
        }
      }
    } catch(Facebook\Exceptions\FacebookResponseException $e) {
      echo 'Graph returned an error: ' . $e->getMessage();
      exit;
    } catch(Facebook\Exceptions\FacebookSDKException $e) {
      echo 'Facebook SDK returned an error: ' . $e->getMessage();
      exit;
    }
}

function getEventDetails($fb, $eventId, $events){
    try {
      if(checkAgainstDB($eventId, $events)){
        $eventId = $fb->get('/'.$eventId)->getGraphObject();
        postToDB($eventId);
      }
    } catch(Facebook\Exceptions\FacebookResponseException $e) {
      // When Graph returns an error
      echo 'Graph returned an error: ' . $e->getMessage();
      exit;
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

function postToDB($eventId){
    echo $eventId->getProperty('id')."\n";
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
mysqli_close($mysqli);
?>
