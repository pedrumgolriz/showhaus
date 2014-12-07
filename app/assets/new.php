<?php
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$_POST = file_get_contents("php://input");
$_POST = json_decode($_POST, TRUE);
$mysqli = new mysqli("localhost", "write", "dxV6m6~8", "haus");

$city = htmlspecialchars(stripslashes($_POST['city']));
if($_POST['newvenue']!=""){
    $venue = htmlspecialchars(stripslashes($_POST['newvenue']));
}else{
    $venue = htmlspecialchars(stripslashes($_POST['venue']));
}
$title = htmlspecialchars(stripslashes($_POST['title']));
$subtitle = htmlspecialchars(stripslashes($_POST['subtitle']));
$date = htmlspecialchars(stripslashes($_POST['date']));
$time = htmlspecialchars(stripslashes($_POST['time']));
$price = htmlspecialchars(stripslashes($_POST['price']));
$description = htmlspecialchars(stripslashes($_POST['description']));
$tags = htmlspecialchars(stripslashes($_POST['tags']));
$tags = explode(",", $tags);
$tag1 = $tags[0];
$tag2 = $tags[1];


if($_POST["fbimage"]!=""){
    $poster =  htmlspecialchars(stripslashes($_POST["fbimage"]));
}
else if($_POST["poster"]){
    $poster = $_FILES["image"]["name"];
    $poster_tmp = $_FILES["image"]["tmp_name"];
    $poster_ext = pathinfo($poster, PATHINFO_EXTENSION);
    $poster = uniqid(md5($poster)).".".$poster_ext;
    if(strtoupper($art_ext)=="JPEG"){
        $art_ext = "jpg";
    }
    move_uploaded_file($poster_tmp, "/var/www/vhosts/showhaus.org/i.showhaus.org/uploads/".$poster);
}


$email = htmlspecialchars(stripslashes($_POST['email']));
$password = generate_password();
$newvenue = htmlspecialchars(stripslashes($_POST['venue_address']));
if($_POST['newvenue']!=""){
    $theselect = mysqli_query($mysqli, "SELECT * FROM venue WHERE venue = '".$venue."' && city = '".$city."'");
    if(mysqli_num_rows($theselect)==0){
        mysqli_query($mysqli, "INSERT INTO venue (venue, address, city) VALUES ('$venue', '$newvenue', '$city')");
    }
    //eventually, update the address if mysqli_num_rows($theselect) > 0. It'll act like a kind of wiki
}
if($title){
    mysqli_query($mysqli, "INSERT INTO events (title, subtitle, description, tag1, tag2, venue, city, date, time, price, poster, email, password)
		VALUES ('$title', '$subtitle','$description','$tag1','$tag2','$venue','$city','$date','$time','$price','$poster','$email','$password')");
    /* close connection */
}
else{
    echo "You shouldn't be here.";
}
$postnumber = mysqli_insert_id($mysqli);
echo $postnumber;
mysqli_close($mysqli);




function generate_password() {
    $consonants = "bcdfghjklmnpqrstvwxyz";
    $vowels = "aeiou";
    $singleCon = substr( str_shuffle( $consonants ), 0, 1);
    $doubleCon = substr( str_shuffle( $consonants ), 0, 1);
    while($singleCon==$doubleCon){
        $doubleCon = substr( str_shuffle( $consonants ), 0, 1);
    }
    $doubleNum = rand(1,9)*11;
    $password = $singleCon.substr( str_shuffle( $vowels ), 0, 1).$doubleCon.$doubleCon.$doubleNum.rand (100, 900 );
    return $password;
}

//Send eMail to user
$to = $email;
$subject = "[showhaus] ✔ your show has been posted!";
$from = "noreply@showhaus.org";
$headers = "From: $from". "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
$message = file_get_contents("../email.html");
$variables = array();
$variables['postnumber'] = $postnumber;
$variables['password'] = $password;
foreach($variables as $key => $value){
    $message = str_replace('{{ '.$key.' }}', $value, $message);
}
mail($to,$subject,$message,$headers);
?>
