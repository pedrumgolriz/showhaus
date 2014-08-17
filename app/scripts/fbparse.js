window.onerror = function () {
    return true;
}
window.fbAsyncInit = function () {
    FB.init({
        appId: '204851123020578',
        status: true,
        xfbml: true
    });
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/all.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

$('#postshow_fb').on('click', function () {
    FB.login(function (response) {}, {
        scope: ''
    });
});
$('#postshow_fb').on('change paste input propertychange', function () {
    $('input:eq(4)').change();
    var eventnum = $(this).val(); //will need to trim just to the number
    eventnum = eventnum.split('events/');
    eventnum = eventnum[1];
    eventnum = eventnum.split('/');
    eventnum = eventnum[0];

    //var fb_image = "https://graph.facebook.com/fql?q=SELECT%20pic_cover%20FROM%20event%20WHERE%20eid%20=%20" + eventnum + "&access_token=CAAC6T55rYyIBAOBhuRnjPivlZCZBZA59jZBZBUZCAquZAX53cfzRBCH1ZAfiB03iIHnc311dsj21Y4ZBZBOVwdeHFfZBGmS9emYzrJWFWJqaGwqFUzLBCB93tOOe0UcUBUP9PcWaviDM7cql9WxZC1U03pJP7RQqBZAfQZC1DXhwKrjzrnuZB0Fn8ieceMXqkdqULORA4kZD";
    //"http://graph.facebook.com/"+eventnum+"/picture?width=9999&height=9999";

    FB.api(
        {
          method: 'fql.query',
          query: 'SELECT pic_cover FROM event WHERE eid = ' + eventnum
        },
        function (response) {
            if (response && !response.error) {
                console.log(response);
                var fb_image = response[0].pic_cover.source;
                console.log('Poster: ' + fb_image);
                $.ajax({
                  url: fb_image,
                  type: 'HEAD',
                  error: function () {
                      console.log('facebook event has no poster art');
                  },
                  success: function () {
                      $('#drop').css("border","none");
                      $('#drop p').html('Successfully imported');
                      $('#drop p').css('color', 'green');
                      var image = new Image();
                      image.src = fb_image;
                      $('#drop p').html('<img src="' + image.src + '" style="max-width: 510px;" id="imgupload"/>');
                      $('#drop p').append('<p><a href="javascript:renewdrop()">delete this image</a></p>');
                      $('input[name=fbimage]').val(image.src);
                  }
                });
            }
            else{
              console.log(response.error);
            }
        }
    )
    //to get the email address
    FB.api(
      {
        method: 'fql.query',
        query: 'SELECT email FROM user WHERE uid=me()'
      },
      function (response){
        var fb_email = response[0].email;
        if(fb_email)
          $('#postshow_email').val(fb_email);
      }
    )
    FB.api(
        eventnum,
        function (response) {
            if (response && !response.error) {
                console.log(response);
                $('#postshow_fb').css('background-color', '#F1FFF6');
                var fb_privacy = response.privacy;
                var fb_title = response.name;
                var subtitle = fb_title.substring(25, 70);
                fb_title = fb_title.substr(0, 25);
                var fb_description = response.description;
                var fb_venue = response.location; // we dont use venue because that gives us an address.
                var fb_address = response.venue.street;
                if(fb_venue)
                fb_venue = fb_venue.substr(0, 25);
                var fb_datetime = response.start_time; //need to handle this result into two items
                fb_datetime = fb_datetime.split('T');
                var fb_date = fb_datetime[0];
                fb_date = fb_date.split('-');
                fb_date = fb_date[1] + "/" + fb_date[2] + "/" + fb_date[0];
                var fb_time = fb_datetime[1];
                //fb_time = fb_time.split('-');
                var fb_time_hour = fb_time.substr(0, 2);
                var fb_time_mins = fb_time.substr(2, 3);
                var ampm = "AM";
                if (fb_time_hour > 12) {
                    fb_time_hour -= 12;
                    ampm = "PM";
                }
                fb_time = fb_time_hour + fb_time_mins + " " + ampm;
                var fb_tag1 = "";
                var fb_tag2 = "";
                for (var i = 0; i < gigantic_genre_array.length; i++) {
                    var test_genre = fb_description.indexOf(gigantic_genre_array[i]);
                    if (test_genre != -1)
                        fb_tag1 = gigantic_genre_array[i];
                }
                var fb_price = fb_description.split('$');
                fb_price = fb_price[1];

                if (fb_price) {
                    var two_digit = isNaN(fb_price.substr(0, 2));
                    var one_digit = isNaN(fb_price.substr(0, 1));
                    if (two_digit == false)
                        fb_price = fb_price.substr(0, 2);
                    else if (one_digit == false)
                        fb_price = fb_price.substr(0, 1);
                }
                else
                    fb_price = 0;
                if (response.venue.city) {
                    var fb_city = response.venue.city;
                    fb_city = fb_city[0].toUpperCase() + fb_city.substring(1);
                }

                /*Stack trace: log all info in console*/

                fb_city.replace(/ /g, '');
                if (fb_city.toLowerCase() == 'washington' || fb_city.toLowerCase() == 'washington dc' || fb_city.toLowerCase() == 'washington d.c.' || fb_city.toLowerCase() == 'dc' || fb_city.toLowerCase() == 'd.c.' || fb_city.toLowerCase() == 'd.c' || fb_city.toLowerCase() == 'washington d.c') {
                    fb_city = 'DC';
                }

                console.log('Event Number: ' + eventnum);
                console.log('City: ' + fb_city);
                console.log('Venue: ' + fb_venue);
                console.log('Title: ' + fb_title);
                console.log('Date: ' + fb_date);
                console.log('Time: ' + fb_time);
                console.log('Price: ' + fb_price);
                console.log('Description: ' + fb_description);
                console.log('Tags: ' + fb_tag1);

                //the input autofill section:
                var beforecity =  $('#postshow_city').val();
                //console.log(before_city);
                $('#postshow_city').val(fb_city);
                $("#postshow_city").trigger("chosen:updated");
                if($("#postshow_city").val()!=fb_city){
                    $("#postshow_city").val(beforecity);
                    $("#postshow_city").trigger("chosen:updated");
                }
                $('#postshow_showtitle').val(fb_title);
                $('#postshow_subtitle').val(subtitle);
                $('#postshow_venue').val(fb_venue);
                if (!$('#postshow_venue').val()) {
                    $('.addvenue').slideDown('slow');
                    $('#postshow_newvenuename').removeAttr('disabled');
                    $('#postshow_venue').val('addvenue');
                    $("#postshow_venue").trigger("chosen:updated");
                    $('#postshow_newvenuename').val(fb_venue);
                    $('#postshow_newvenueaddress').val(fb_address);
                } else {
                    $('.addvenue').slideUp('slow');
                    $('#postshow_newvenuename').attr('disabled', 'disabled');
                    $('#postshow_newvenuename').val('');
                    $('#postshow_newvenueaddress').val('');
                }
                $("#postshow_venue").trigger("chosen:updated");
                $('#postshow_date').val(fb_date);
                $('#postshow_time').val(fb_time);
                $('#postshow_price').val(fb_price);
                $('#tags').select2("val",[fb_tag1]);

                //$("#description").append("<div>\"+fb_description+"\</div>\");
                // tinyMCE.execCommand('mceInsertContent',false, fb_description);
                CKEDITOR.instances.editor.setData('',function(){
                  this.insertText(fb_description);
                  console.log(this);
                });
                //$('input:file').hide();
                //$('#imageupload').attr('src',fb_image);
                update_chars();
            }
            else
                $('#postshow_fb').css('background-color', 'rgb(245, 208, 208)');
        }
    );
});

//image to base64 encoding


//gigantic genre array
var gigantic_genre_array = [
	"two step",
	"twostep",
    "2step",
    "8-bit",
    "Acid",
    "Acid house",
    "Acid jazz",
    "Acid punk",
    "Acoustic",
    "Adventure metal",
    "African",
    "Alpine",
    "Alpunk",
    "Alternative",
    "Alternative rock",
    "Ambient",
    "Ambient industrial",
    "Ambient psy",
    "Americana",
    "Anarcho-punk",
    "Anthem trance",
    "Anti-folk",
    "Aquacrunk",
    "Arabian metal",
    "Arena rock",
    "Aria",
    "Art rock",
    "Art song",
    "Art-pop",
    "Asian American jazz",
    "Ataricore",
    "Atmospheric",
    "Atmospheric sludge metal",
    "Australian aboriginal",
    "Avant-garde",
    "Avant-garde metal",
    "Avant-pop",
    "Avant-progressive rock",
    "Bass & drum",
    "Battle metal",
    "Black metal",
    "Bluegrass",
    "Blues",
    "Booty bass",
    "Booty house",
    "Breakbeat",
    "Chillout",
    "Chinese opera",
    "Chip",
    "Chip tune",
    "Chipstyle",
    "Choppage",
    "Choral",
    "Comedy",
    "Cover",
    "Dance",
    "Dark metal",
    "Death industrial",
    "Death metal",
    "Detroit bass",
    "Detroit techno",
    "Deutschrock",
    "Devotional",
    "Dhrupad",
    "Digital",
    "Diluted gabber",
    "Disco",
    "Disco house",
    "Dixieland",
    "Dodecaphonic",
    "Doo wop",
    "Doom",
    "Doom metal",
    "Doom/death metal",
    "Doo-wop",
    "Downbeat",
    "Downtempo",
    "Dream",
    "Dream trance",
    "Drill and bass",
    "Drone",
    "Drum",
    "Drum and bass",
    "Drum solo",
    "Drumfunk",
    "Dub",
    "Dubstep",
    "Duet",
    "Early electronic",
    "Early music",
    "Easy listening",
    "Edits",
    "Electro",
    "Electro industrial",
    "Electroclash",
    "Electrofunk",
    "Electronic",
    "Electronic body music",
    "Electronic dance music",
    "Electronic grindcore",
    "Electroswing",
    "Elegy",
    "Elektro",
    "Emo",
    "Emocore",
    "Enka",
    "Epic metal",
    "Epic trance",
    "Eski",
    "Ethereal",
    "Ethnic",
    "Etude",
    "Eurobeat",
    "Eurodance",
    "Euro-house",
    "Europop",
    "Euro-techno",
    "Euro-trance",
    "Experimental",
    "Experimental rock",
    "Field recording",
    "Film",
    "Flamenco",
    "Folk",
    "Funk",
    "Funky",
    "Funky house",
    "Fusion",
    "Garage",
    "Garage-house",
    "Ghettotech",
    "Glam metal",
    "Glam rock",
    "Glitch",
    "Grime",
    "Grindcore",
    "Grindwhore",
    "Groove metal",
    "Grunge",
    "Grungecore",
    "Gstanzl",
    "Guiju",
    "Guoyue",
    "Gypsy",
    "Gypsy jazz",
    "Gypsy punk",
    "Hair metal",
    "Hair rock",
    "Hamburger Schule",
    "Happy gabber",
    "Happy hardcore",
    "Hard bop",
    "Hard dance",
    "Hard house",
    "Hard rock",
    "Hard trance",
    "Hardcore",
    "Hardcore/sXe",
    "Hardcore emo",
    "Hardcore trance",
    "Hardstep",
    "Hardstyle",
    "Harsh noise",
    "Hatecore",
    "Heavy metal",
    "Hellektro",
    "Heterophonic",
    "HI NRG",
    "Hick rock",
    "Hillbilly",
    "Hindustani classical",
    "Hip-hop",
    "Hip-hopera",
    "Hiphouse",
    "Hipjazz",
    "Horror glam punk",
    "Horror punk",
    "Horrorcore",
    "House",
    "Hua\'er",
    "Humorcore",
    "Humour",
    "Humppa",
    "Hyangak",
    "Hymn",
    "Ibiza goth",
    "Illbient",
    "Impressionist",
    "Improvisation",
    "Indie",
    "Indie pop",
    "Indie rock",
    "Indietronica",
    "Industrial",
    "Industrial metal",
    "Industrial noise",
    "Insect electronica",
    "Instrumental",
    "Instrumental pop",
    "Instrumental rock",
    "Insurgent country",
    "Intelligent dance music",
    "Intelligent drum and bass",
    "Intelligent jungle",
    "Intergalactic punk rock hip-hop",
    "Interpretive",
    "Italo",
    "Italo Disco",
    "Jamgrass",
    "Javanese",
    "Jazz",
    "Jazz blues",
    "Jazz fusion",
    "Jazz rap",
    "Jazz rock",
    "Jazz vintage",
    "Jazz-funk",
    "Jazzstep",
    "Jeongak",
    "Jewish",
    "Jive",
    "J-metal",
    "Joik",
    "J-pop",
    "J-rap",
    "J-rock",
    "J-trance",
    "J-urban",
    "Jtek",
    "Juke house",
    "Jumpstyle",
    "Jump-Up",
    "Jungle",
    "Junkanoo",
    "Juoiggus",
    "Kabuki",
    "Kantrum",
    "Karaoke",
    "Karnatak",
    "Khoomei",
    "Khyal",
    "Klezmer",
    "Kompa",
    "Kouta",
    "Kozmigroov",
    "K-pop",
    "K-rap",
    "K-rock",
    "K-urban",
    "Krautrock",
    "Kuaiban",
    "Kunqu",
    "Ländler",
    "Latin",
    "Latin freestyle",
    "Latin jazz",
    "Latin pop",
    "Library",
    "Lied(er)",
    "Lift music",
    "Liquid funk",
    "Lo-fi",
    "Lo-fi country",
    "Lounge",
    "Loungecore",
    "Lu",
    "Luk thung",
    "M.O.R.",
    "Madrigal",
    "Malhun",
    "Mambo",
    "March",
    "Mariarchi",
    "Martial",
    "Mashup",
    "Mass",
    "Math metal",
    "Math rock",
    "Mathcore",
    "Mazurka",
    "M-Base",
    "Mechanical Death",
    "Mediaeval",
    "Meditative",
    "Mele",
    "Melodic black metal",
    "Melodic death metal",
    "Melodic rock",
    "Melodic trance",
    "Mento",
    "Merengue",
    "Metal",
    "Metalcore",
    "Mexican rock",
    "Miami bass",
    "Microhouse",
    "Microtonal",
    "Middle Eastern",
    "Military",
    "Mincecore",
    "Minimal techno",
    "Minimalist",
    "Minsogak",
    "Modal jazz",
    "Modern classical",
    "Moombahton",
    "Mor lam",
    "Motet",
    "Motown sound",
    "MPB",
    "Murder metal",
    "Música Popular Brasileira",
    "Musical",
    "Musique concrète",
    "Muzak",
    "N.S.B.M.",
    "Nashville sound",
    "National folk",
    "Native American",
    "Native American metal",
    "Nederhop",
    "Negerpunk",
    "Neo progressive",
    "Neo soul",
    "Neoclassical metal",
    "Neoclassicist",
    "Neofolk",
    "Neotraditional",
    "Nerdcore hip-hop",
    "Neue Deutsche Härte",
    "Neue Deutsche Welle",
    "Neurofunk",
    "New Age",
    "New jack swing",
    "New metal",
    "New romantic",
    "New school breaks",
    "New Wave",
    "New Wave Of British Heavy Metal",
    "New Wave Of Swedish Death Metal",
    "New-school metallic hardcore",
    "Newgrass",
    "Nightcore",
    "Nightstep",
    "Nintendocore",
    "Niyabinghi",
    "No depression",
    "No wave",
    "Nocturne",
    "Noise",
    "Noise pop",
    "Noise rock",
    "Noisecore",
    "Norteño",
    "Northern soul",
    "Novelty",
    "Nu funk",
    "Nu gabber",
    "Nu Italo",
    "Nu jazz",
    "Nu punk",
    "Nu school breaks",
    "Nu soul",
    "Nu tango",
    "Nu-metal",
    "Octet",
    "Oi",
    "Old school hip hop",
    "Old school progressive electronic",
    "Oldies",
    "Oldskool",
    "Old-time",
    "Opera",
    "Operetta",
    "Oratorio",
    "Orchestral",
    "Oriental metal",
    "Pagan",
    "Pagan metal",
    "Pingju",
    "Pipe & drum",
    "Pirate metal",
    "Pirate rock",
    "Pleng phua cheewit",
    "Plutonium rock",
    "Political",
    "Polka",
    "Polsk Punk",
    "Pop",
    "Pop punk",
    "Pop/funk",
    "Pop-folk",
    "Porn groove",
    "Porngrind",
    "Porno gore",
    "Post-black metal",
    "Post-emo indie rock",
    "Post-emo style rock",
    "Post-grunge",
    "Post-hardcore",
    "Post-industrial",
    "Post modern bovine smut funk",
    "Post-punk",
    "Post-rock",
    "Postromantic",
    "Post-thrash metal",
    "Power ballad",
    "Power electronics",
    "Power metal",
    "Power noise",
    "Power pop",
    "Powergrind",
    "Pranks",
    "Prelude",
    "Primus",
    "Progressive",
    "Progressive country",
    "Progressive death metal",
    "Progressive folk",
    "Progressive house",
    "Progressive metal",
    "Progressive rock",
    "Progressive sludge",
    "Progressive trance",
    "Psybient",
    "Psychedelic",
    "Psychedelic noise",
    "Psychedelic rock",
    "Psychobilly",
    "Psycore",
    "Psytekk",
    "Psy-trance",
    "Pubrock",
    "Punk",
    "Punk cabaret",
    "Punk country",
    "Punk hardcore",
    "Punk oi",
    "Punk pop",
    "Punk rock",
    "Punkgrass",
    "Purple sound",
    "Pyjama funk",
    "Qawwali",
    "Quan họ",
    "Quartet",
    "Queercore",
    "Quickstep",
    "Quintet",
    "R.A.C.",
    "Ragga",
    "RaggaJungle",
    "Ragtime",
    "Raï",
    "Ranchera",
    "Rap",
    "Rap opera",
    "Rave",
    "Recitative",
    "Red dirt",
    "Reggae",
    "Reggaeton",
    "Regressive country",
    "Religious",
    "Rembetiko",
    "Renaissance",
    "Retro",
    "Revival",
    "Rhapsody",
    "Rhythm",
    "Rhythm and bass",
    "Rhythm and blues",
    "Rhythmic noise",
    "Rhythmic soul",
    "Riot grrrl",
    "Robot hip hop",
    "Rock",
    "Rock and roll",
    "Rock in Opposition",
    "Rockabilly",
    "Rocksteady",
    "Rococo",
    "Romantic",
    "Romantic doom metal",
    "Roots country",
    "Roots rock",
    "Rumba",
    "Rural contemporary",
    "Sacred steel",
    "Sadcore",
    "Salsa",
    "Samba",
    "Satire",
    "Scat",
    "Schlager",
    "Schrammelmusik",
    "Schranz",
    "Screamo",
    "Seasonal",
    "Serial",
    "Serialism",
    "Sextet",
    "Scenecore",
    "Shibuya-kei",
    "Shoegaze",
    "Shomyo",
    "Shona",
    "Showtunes",
    "Sichuan",
    "Sickcore",
    "Ska",
    "Ska noise",
    "Ska punk",
    "Skacore",
    "Skiffle",
    "Slack-key",
    "Slamgrass",
    "Slamming Gore Groove",
    "Slow jam",
    "Slow rock",
    "Slowcore",
    "Sludge metal",
    "Smooth jazz",
    "Soca",
    "Sogak",
    "Son",
    "Sonata",
    "Soul",
    "Soul jazz",
    "Sound clip",
    "Soundtrack",
    "Southern gospel",
    "Southern rock",
    "Southern soul",
    "Space",
    "Space rock",
    "Speech",
    "Speed garage",
    "Speed metal",
    "Speedbass",
    "Speedcore",
    "Speedwood",
    "Spiritual",
    "Square dance",
    "Stadium rock",
    "Stoner doom",
    "Stoner metal",
    "Stoner rock",
    "Straight Edge",
    "Street bass",
    "Street punk",
    "String pop",
    "SubIndie",
    "Sublow",
    "Suicide metal",
    "Suicide rock",
    "Surf rock",
    "Swamp rock",
    "Swing",
    "Symphonic",
    "Symphonic black metal",
    "Symphonic poem",
    "Symphonic rock",
    "Symphony",
    "Synthpop",
    "Synthtron",
    "Taiko",
    "Tango",
    "Tartan techno",
    "Tech",
    "Tech hardcore",
    "Tech-house",
    "Techmospheric",
    "Technical death",
    "Techno",
    "Techno rock",
    "Techno-industrial",
    "Techstep",
    "Tejano",
    "Terror",
    "Terror EBM",
    "Terrorcore",
    "Tex-Mex",
    "Theatrical",
    "Theme",
    "Theme and variations",
    "Third Stream",
    "Thrang",
    "Thrash metal",
    "Threnody",
    "Throat singing",
    "Toccata",
    "Tone poem",
    "Traditional",
    "Traditional Chinese",
    "Trailer",
    "Trance",
    "Trancecore",
    "Trancestep",
    "Trap",
    "Trashcan Americana",
    "Tribal",
    "Trio",
    "Trip-hop",
    "Troll metal",
    "Tropicália",
    "Tropicalismo",
    "True Scottish Pirate Metal",
    "Turbo-folk",
    "Turntablism",
    "Tuvan",
    "Twang core",
    "Twee",
    "Twee pop",
    "Twelve-tone",
    "Two step",
    "UK garage",
    "Unblack metal",
    "Uplifting trance",
    "Uptempo",
    "Urban",
    "Vallenato",
    "Vedic metal",
    "Victoriandustrial",
    "Viking metal",
    "Visual kei",
    "Vocal",
    "Vocal house",
    "Vocal-trance",
    "Vomitcore",
    "Waltz",
    "Wedding",
    "Weirdo",
    "West coast",
    "Western",
    "Western swing",
    "White metal",
    "Wizard rock",
];
