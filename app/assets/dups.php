<?php
header('content-type: application/json; charset=utf-8');
$mysqli = new mysqli("localhost", "overwrite", "Mfve5@09", "haus");
//deletes duplicate events
$query = "DELETE events FROM events LEFT JOIN events b ON events.id<b.id AND events.title=b.title WHERE b.id IS NOT NULL";
mysqli_query($mysqli, $query);
printf("Events rows  (DELETED): %d\n", mysqli_affected_rows($mysqli));
//deletes duplicate venues
$query = "DELETE venue FROM venue LEFT JOIN venue b ON venue.id<b.id AND venue.venue=b.venue WHERE b.id IS NOT NULL";
mysqli_query($mysqli, $query);
printf("Venue rows  (DELETED): %d\n", mysqli_affected_rows($mysqli));
?>
