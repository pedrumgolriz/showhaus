<?php
require_once('recaptchalib.php');

$privatekey = "6LdF4fMSAAAAAPOXRTUAlzCJcPrhmZqYmjwAlXAI";

//B. Recaptcha Looks for the POST to confirm 
$resp = recaptcha_check_answer ($privatekey,
                                $_SERVER["REMOTE_ADDR"],
                                $_POST["recaptcha_challenge_field"],
                                $_POST["recaptcha_response_field"]);

//C. If if the User's authentication is valid, echo "success" to the Ajax
if ($resp->is_valid) {
	echo "success";
} else {
    die ("The reCAPTCHA wasn't entered correctly. Go back and try it again." .
       "(reCAPTCHA said: " . $resp->error . ")");
}
?>