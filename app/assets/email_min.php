<pre style="display:hide">
<?php
	//server connection stuff for subscribers db
	//use eventlist.php to sort what cities posts to send to what people; up to 7 days of shows
	$jsonEventList = include 'eventlist.php';
	$eventList = json_decode($jsonEventList);
	$eventListCities = array();
	for($i = 0; $i < count($eventList); $i++){
		if(array_search($eventList[$i]['city'], $eventListCities) === 0){
			array_push($eventListCities, $eventList[$i]['city']);
		}
	}
?>
</pre>
<?php
	echo $eventList[0];
	var_dump( $eventListCities);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Upcoming Shows in New York City (9/8 - 9/15)</title>

<style type="text/css">

  /* reset */
  #outlook a {padding:0;} /* Force Outlook to provide a "view in browser" menu link. */
  .ExternalClass {width:100%;} /* Force Hotmail to display emails at full width */
  .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;} /* Forces Hotmail to display normal line spacing.  More on that: http://www.emailonacid.com/forum/viewthread/43/ */
  p {margin: 0; padding: 0; font-size: 0px; line-height: 0px;} /* squash Exact Target injected paragraphs */
  table td {border-collapse: collapse;} /* Outlook 07, 10 padding issue fix */
  table {border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; } /* remove spacing around Outlook 07, 10 tables */

  /* bring inline */
  a.phone {pointer-events: auto; cursor: default;} /* phone link, use as wrapper on phone numbers */
  span {font-size: 13px; line-height: 17px; color: #000001;}

	/* showhaus styles */
	body {font-family: "menlo", "helvetica", sans-serif; line-height: 1.3; padding: 20px; font-size: 14px;}
	h1 {line-height: 1.3; padding-top: 0;}
	h2 {line-height: 1.3; padding-bottom:0;}
	hr {padding: 0;}

</style>
<!--[if gte mso 9]>
  <style>
  /* Target Outlook 2007 and 2010 */
  </style>
<![endif]-->
</head>
<body style="width:80%; margin:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">

<!-- body wrapper -->
<table cellpadding="0" cellspacing="0" border="0" style="margin:0; width:100%;"">
  <tr>
    <td valign="top">
      <!-- edge wrapper -->
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="top">
            <!-- content wrapper -->
            <table cellpadding="0" cellspacing="0" border="0" >
              <tr>
                <td valign="top" style="vertical-align: top;">
<!-- ///////////////////////////////////////////////////// -->

<table cellpadding="0" cellspacing="0" border="0" align="center">
  <tr>




		<td valign="top" style="vertical-align: top;">
      <h1> UPCOMING SHOWS IN NEW YORK CITY </h1>
			  Happy Tuesday! Here’s what’s happening in New York City this week via <a href="http://showhaus.org">showhaus.org</a>.
				<br><br>Contact <a href="mailto:info@showhaus.com">info@showhaus.org</a> with any questions or concerns.
				<br><br>👍 = Staff Pick

				<hr>

				<!-- TUESDAY -->
				<h2>TUESDAY 9/08/16</h2>
				<a href="#">MPHO, Long Nails, WALL</a> 👍
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span><br>

				<hr>

				<!-- WEDNESDAY -->
				<h2>WEDNESDAY 9/09/16</h2>
				<a href="#">MPHO, Long Nails, WALL</a> 👍
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span><br>

				<hr>

				<!-- THURSDAY -->
				<h2>THURSDAY 9/10/16</h2>
				<a href="#">MPHO, Long Nails, WALL</a> 👍
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span>
				<br><br><a href="#">MPHO, Long Nails, WALL</a>
				<br><span style="font-size:12px">@ ALPHAVILLE</span><br>

        <hr>

        <!-- unsubscribe -->
        This email is auto-generated based on content from <a href="http://showhaus.org">showhaus.org</a>. Double check dates and times in case something changes!
        <br><br>You're probably recieving this becuse you signed up on our website.
        <br><br> If you don't want these emails anymore, <a href="#">unsubscribe here</a>.

    </td>

  </tr>
</table>
<!-- //////////// -->
















                </td>
              </tr>
            </table>
            <!-- / content wrapper -->
          </td>
        </tr>
      </table>
      <!-- / edge wrapper -->
    </td>
  </tr>
</table>
<!-- / page wrapper -->
</body>
</html>