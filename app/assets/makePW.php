<?php

$mysqli = new mysqli("localhost", "write", "dxV6m6~8", "haus");

$password = generateStrongPassword();

mysqli_query($mysqli, "INSERT INTO passes (pw) VALUES ('$password')");

function generateStrongPassword()
{
	$alpha = "abcdefghijklmnopqrstuvwxyz";
    $alpha_upper = strtoupper($alpha);
    $numeric = "0123456789";
    $special = ".-+=_,!@$#*%<>[]{}";
    $chars = "";

    if (isset($_POST['length'])){
        // if you want a form like above
        if (isset($_POST['alpha']) && $_POST['alpha'] == 'on')
            $chars .= $alpha;

        if (isset($_POST['alpha_upper']) && $_POST['alpha_upper'] == 'on')
            $chars .= $alpha_upper;

        if (isset($_POST['numeric']) && $_POST['numeric'] == 'on')
            $chars .= $numeric;

        if (isset($_POST['special']) && $_POST['special'] == 'on')
            $chars .= $special;

        $length = $_POST['length'];
    }else{
        // default [a-zA-Z0-9]{9}
        $chars = $alpha . $alpha_upper . $numeric;
        $length = 64;
    }

    $len = strlen($chars);
    $pw = '';

    for ($i=0;$i<$length;$i++)
            $pw .= substr($chars, rand(0, $len-1), 1);

    // the finished password
    return str_shuffle($pw);
}

$to = "pedrumgolriz@gmail.com, luismqueral@gmail.com";
$subject = "[showhaus] your pass is ready";
$from = "noreply@showhaus.org";
$headers = "From: $from". "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
$message = "Your pass: ".$password;
mail($to,$subject,$message,$headers);

?>