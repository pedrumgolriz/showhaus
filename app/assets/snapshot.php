<?php
ini_set('display_errors', '1');
    ini_set('max_execution_time', 0);
    error_reporting(E_ALL);
date_default_timezone_set('America/New_York');
$server_date = date("m/d/Y");

$mysqli = new mysqli("localhost", "read", "jX!57u6a", "haus");
$query = mysqli_query($mysqli, "SELECT DISTINCT *, NULL AS password, NULL AS email FROM venue, events WHERE STR_TO_DATE(events.date, '%m/%d/%Y') >= STR_TO_DATE('".$server_date."', '%m/%d/%Y') AND events.venue = venue.venue GROUP BY events.id");



//WE CAN USE SEARCH QUERY FROM GOOGLE TO FIND RELAVENT SHOWS
//WILL DO THIS LATER
/*
var searchQuery = $_SERVER['HTTP_REFERER'];
if(searchQuery != "" || searchQuery != null){
	//sort through events for most relevant
}
else{
	//show staff picks && 50 shows today
}*/


?>
<html>
    <head>
        <title>showhaus: new york show listings and venues </title>
        <meta name="description" content="showhaus is an open directory of live music and venues across a variety of cities.">
          <meta name="keywords" content="concerts, music, shows, venues, diy, indie">
          <meta name="google-site-verification" content="0JT4T9OaYhqVePWErhSX--jCQjyYX8ItSsw4vJjxodE" />
          <link rel="icon" type="image/png" href="../favicon.ico">
    </head>
    <body>
        <div class="breadcrumb">
            <div class="tagline">
                <span class="tagline-text"><a href="http://www.showhaus.org"><?php echo mysqli_num_rows($query) ?> Upcoming Shows</a></span>
            </div>
            <div class="breadcrumb-nav home">
                <a href="http://showhaus.org/#!about">about</a>
                <!-- :: <a href="#!api">api</a> -->
                <a href="http://showhaus.org/#!feeds">feeds</a>
                <a href="http://showhaus.org/#!post"><strong>post a show</strong></a>
            </div>
        </div>
        <h1><?php echo mysqli_num_rows($query) ?> Upcoming Shows</h1>
        <table border="1">
        <thead>
            <tr>
                <td>Date</td>
                <td>Time</td>
                <td>Title</td>
                <td>Venue</td>
                <td>Source</td>
				<td>Price</td>
				<td>Ticket Link</td>
            </tr>

        </thead>
        <tbody>
        <?php
            while($row = mysqli_fetch_array($query)) {
            ?>
                <tr>
                    <td><?php echo $row['date']?></td>
                    <td><?php echo $row['time']?></td>
                    <td><?php echo $row['title']?></td>
                    <td><?php echo $row['venue']?></td>
                    <td><?php echo $row['fb_event']?></td>
                    <td><?php
                        if($row['price'] == "-1"){
                            echo "free";
                        }
                        else{
                            echo $row['price'];
                        }
                        ?>
                    </td>
                    <td><?php echo $row['ticket_uri']?></td>
                </tr>
            <?php
            }
            ?>
            </tbody>
            </table>
            <script>
            	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            	})(window,document,'script','http://www.google-analytics.com/analytics.js','ga');

            	ga('create', 'UA-58930808-1', 'auto');
            	ga('send', 'pageview');

            </script>
    </body>
</html>