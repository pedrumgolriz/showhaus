<?php
ini_set('display_errors', '1');
    ini_set('max_execution_time', 0);
    error_reporting(E_ALL);
date_default_timezone_set('America/New_York');
$server_date = date("m/d/Y");
$limitTo = rand(800, 1000);

$mysqli = new mysqli("localhost", "read", "jX!57u6a", "haus");
$query = mysqli_query($mysqli, "SELECT DISTINCT *, NULL AS password, NULL AS email FROM venue, events WHERE STR_TO_DATE(events.date, '%m/%d/%Y') >= STR_TO_DATE('".$server_date."', '%m/%d/%Y') AND events.venue = venue.venue GROUP BY events.id LIMIT ".$limitTo."");



//WE CAN USE SEARCH QUERY FROM GOOGLE TO FIND RELAVENT SHOWS
//WILL DO THIS LATER

//var searchQuery = $_SERVER['HTTP_REFERER'];


?>
<html>
    <head>
        <title>showhaus: new york show listings and venues </title>
        <meta name="description" content="showhaus is an open directory of live music and venues across a variety of cities.">
          <meta name="keywords" content="concerts, music, shows, venues, diy, indie, diy electronic music, music diy, music marketing for the diy musician, underground">
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
        <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Time</th>
            <th>Price/Tickets</th>
            <th>Venue</th>
            <th>Url</th>
        </tr>
        <?php
            while($row = mysqli_fetch_array($query)) {
            ?>
                    <tr class="event-wrapper" itemscope itemtype="http://schema.org/Event">
                        <td itemprop="name"><a href="http://showhaus.org/#!/<?php echo $row['id'];?>/<?php echo $row['city'];?>/<?php echo $row['venue'];?>/<?php echo $row['title'];?>"><?php echo $row['title'];?></a></p> 
                        <td class="event-date" itemprop="startDate" content="<?php echo $row['date'];?>"><?php echo $row['date'];?></span></td>
                        <td class="event-time" itemprop="doorTime" content="<?php echo $row['time'];?>"><?php echo $row['time'];?></span></td>
                        <td class="event-fees"> 
                            <span>Price:
                                <span itemprop="offers" itemscope itemtype="http://schema.org/Offer"> 
                                    <a itemprop="url" href="<?php echo $row['ticket_uri'];?>"> 
                                        <span itemprop="price" content='<?php if($row["price"] == "-1"){echo "0";}else{echo $row["price"];}?>'><span itemprop="priceCurrency" content="USD"><?php if($row["price"] == "-1"){echo "0";}else{echo $row["price"];}?></span></span>
                                    </a> 
                                </span>
                            </span>
                        </td> 
                        <td class="location" itemprop="location" itemscope itemtype="http://schema.org/Place"> 
                           <span class="name" itemprop="name">@ <?php echo $row['venue'];?></span>
                           <div itemprop="address"><a href="http://showhaus.org/#!/<?php echo $row['id'];?>/<?php echo $row['city'];?>/<?php echo $row['venue'];?>/<?php echo $row['title'];?>">Details</a></div>
                        </td> 
                        <td class="url" itemprop="url" itemscope itemtype="http://schema.org/Url">
                            <a href="http://showhaus.org/#!/<?php echo $row['id'];?>/<?php echo $row['city'];?>/<?php echo $row['venue'];?>/<?php echo $row['title'];?>">
                                http://showhaus.org/#!/<?php echo $row['id'];?>/<?php echo $row['city'];?>/<?php echo $row['venue'];?>/<?php echo $row['title'];?>
                            </a>
                        </td>
                    </tr>
            <?php
            }
            ?>
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
