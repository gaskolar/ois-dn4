var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

//<!--Miha   08721848-81c5-4708-9832-d79f63c26dd1-->
//<!--Andeja 402e0f47-bfca-435e-8b5b-10df228d80bc-->
//<!--Franci 986bc91e-2b49-403d-bf00-6633f40b20a5-->
//<!--Test   df0b3f2d-f13f-4c60-ac3c-8fda49989a03-->

var miha =    "08721848-81c5-4708-9832-d79f63c26dd1";
var andreja = "402e0f47-bfca-435e-8b5b-10df228d80bc";
var franci =  "986bc91e-2b49-403d-bf00-6633f40b20a5";
var testid =  "df0b3f2d-f13f-4c60-ac3c-8fda49989a03";

var dataZaGraf = [];

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function InitChart() {
    $("#visualisation").width($("#grafdiv").width());
   var vis = d3.select("#visualisation"),
    WIDTH = $("#grafdiv").width(),
    HEIGHT = 150,
    MARGINS = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 50
    },
    xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(dataZaGraf, function (d) {
        return d.x;
      }),
      d3.max(dataZaGraf, function (d) {
        return d.x;
      })
    ]),

    yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(dataZaGraf, function (d) {
        return d.y-4;
      }),
      d3.max(dataZaGraf, function (d) {
        return d.y+4;
      })
    ]),
    xAxis = d3.svg.axis()
      .scale(xRange)
      .tickSize(5)
      .tickSubdivide(true),

    yAxis = d3.svg.axis()
      .scale(yRange)
      .tickSize(5)
      .orient("left")
      .tickSubdivide(true);

        
  vis.append("svg:g")
    
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
    .call(xAxis);

  vis.append("svg:g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (MARGINS.left) + ",0)")
    .call(yAxis);
  
  var lineFunc = d3.svg.line()
  .x(function(d) {
    return xRange(d.x);
  })
  .y(function(d) {
    return yRange(d.y);
  })
  .interpolate('linear');
    
  vis.append('svg:path')
  .attr('d', lineFunc(dataZaGraf))
  .attr('stroke', 'blue')
  .attr('stroke-width', 2)
  .attr('fill', 'none');
}

function osveziGraf(){
    d3.select("#visualisation")
       .remove();
    $("#grafdiv").html('<svg id="visualisation" width="300" height="200"></svg>');
    InitChart();
}

function preberiMeritveVitalnihZnakov() {
	sessionId = getSessionId();	

	var ehrId = $("#preberiEHR").val();
	var tip = $("#preberiTip").val();

	if (!ehrId || ehrId.trim().length == 0 || !tip || tip.trim().length == 0) {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje podatkov za <b>'" + tip + "'</b> bolnika <b>'" + party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
                $.ajax({
                    url: baseUrl + "/view/" + ehrId + "/" + tip,
                    type: 'GET',
                    headers: {"Ehr-Session": sessionId},
                    success: function (res) {
                        if (res.length > 0) {
                          
                            for (var i in res) {
                                if(tip.localeCompare("weight") ==0){
                                    dataZaGraf[i] = {'x':i,'y':res[i].weight};
                                    console.log(dataZaGraf[i]);
                                }else if(tip.localeCompare("body_temperature") ==0){
                                    dataZaGraf[i] = {'x':i,'y':res[i].temperature};
                                    console.log(dataZaGraf[i]);
                                }else if(tip.localeCompare("blood_pressure") ==0){
                                    dataZaGraf[i] = {'x':i,'y':res[i].systolic};
                                    console.log(dataZaGraf[i]);
                                }else if(tip.localeCompare("height") ==0){
                                    dataZaGraf[i] = {'x':i,'y':res[i].height};
                                    console.log(dataZaGraf[i]);
                                }else if(tip.localeCompare("spO2") ==0){
                                    dataZaGraf[i] = {'x':i,'y':res[i].spO2};
                                    console.log(dataZaGraf[i]);
                                }
                                //results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].weight + " " 	+ res[i].unit + "</td>";
                            }
                            osveziGraf();
                        } else {
                            $("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
                        }
                    },
                    error: function() {
                        $("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
                        console.log(JSON.parse(err.responseText).userMessage);
                    }
                });
				
	    	},
	    	error: function(err) {
	    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
		});
	}
}

function preberiEHRodBolnika() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#preberiSporocilo").html("<span class='obvestilo label label-success fade-in'>Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.</span>");
				console.log("Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.");
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}	
}


$(document).ready(function() {
	$('#preberiPredlogoBolnika').change(function() {
		$("#kreirajSporocilo").html("");
		var podatki = $(this).val();
		$("#preberiEHR").val(podatki);
	});
});