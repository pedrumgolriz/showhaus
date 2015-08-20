<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(E_ALL & ~E_NOTICE);

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

$_POST = file_get_contents("php://input");
$_POST = json_decode($_POST, TRUE);
$mysqli = new mysqli("localhost", "overwrite", "Mfve5@09", "haus");

$city = mysqli_real_escape_string($mysqli, $_POST['city']);
if($_POST['newvenue']!=""){
    $venue = mysqli_real_escape_string($mysqli, $_POST['newvenue']);
}else{
    $venue = mysqli_real_escape_string($mysqli, $_POST['venue']);
}
$title = mysqli_real_escape_string($mysqli, $_POST['title']);
$subtitle = mysqli_real_escape_string($mysqli, $_POST['subtitle']);
$date = mysqli_real_escape_string($mysqli, $_POST['date']);
$time = mysqli_real_escape_string($mysqli, $_POST['time']);
$price = mysqli_real_escape_string($mysqli, $_POST['price']);
$description = mysqli_real_escape_string($mysqli, $_POST['description']);
$tags = $_POST['tags'];
$tag1 = mysqli_real_escape_string($mysqli, $tags[0]);
$tag2 = mysqli_real_escape_string($mysqli, $tags[1]);
for ($i = 1; $i<count($tags); $i++){
    $tag2 = mysqli_real_escape_string($mysqli, $tags[$i]);
}
$id = $_POST['id'];


if($_POST["fbimage"]!=""){
    $poster = mysqli_real_escape_string($mysqli, $_POST["fbimage"]);
}
else if($_POST["poster"]){
    $fileExt = explode("image/", $_POST["poster"])[1];
    $fileExt = explode(";", $fileExt)[0];
    $filename = uniqid(md5($_POST["poster"])).".".$fileExt;
    $poster = convert2image($_POST["poster"], $filename);
    copy($poster, "/var/www/vhosts/showhaus.org/i.showhaus.org/uploads/".$poster);
}


$email = mysqli_real_escape_string($mysqli, $_POST['email']);
$password = generate_password();
$newvenue = mysqli_real_escape_string($mysqli, $_POST['venue_address']);
if($_POST['newvenue']!=""){
    $theselect = mysqli_query($mysqli, "SELECT * FROM venue WHERE venue = '".$venue."' && city = '".$city."'");
    if(mysqli_num_rows($theselect)==0){
        mysqli_query($mysqli, "INSERT INTO venue (venue, address, city) VALUES ('$venue', '$newvenue', '$city')");
    }
    //eventually, update the address if mysqli_num_rows($theselect) > 0. It'll act like a kind of wiki
}
if($title){
    if($poster){
        mysqli_query($mysqli, "UPDATE events SET title = '$title', subtitle = '$subtitle', tag1 = '$tag1', tag2 = '$tag2', venue = '$venue', city = '$city', date = '$date', time = '$time', price = '$price', poster = '$poster', description = '$description' where id = '$id'");
    }
    else{
        mysqli_query($mysqli, "UPDATE events SET title = '$title', subtitle = '$subtitle', tag1 = '$tag1', tag2 = '$tag2', venue = '$venue', city = '$city', date = '$date', time = '$time', price = '$price', description = '$description' where id = '$id'");
    }
    /* close connection */
}
else{
    echo "You shouldn't be here.";
}
$postnumber = mysqli_insert_id($mysqli);
echo $postnumber;
mysqli_close($mysqli);

function convert2image($b64, $output_file){
    $ifp = fopen($output_file, "wb");

    $data = explode(',', $b64);

    fwrite($ifp, base64_decode($data[1]));
    fclose($ifp);

    return $output_file;
}


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
