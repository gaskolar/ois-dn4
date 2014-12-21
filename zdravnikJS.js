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
function dodajMeritveVitalnihZnakov() {
	sessionId = getSessionId();

	var ehrId = $("#dodajVitalnoEHR").val();
	var datumInUra = $("#dodajVitalnoDatumInUra").val();
	var telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
	var telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();
	var telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
	var sistolicniKrvniTlak = $("#dodajVitalnoKrvniTlakSistolicni").val();
	var diastolicniKrvniTlak = $("#dodajVitalnoKrvniTlakDiastolicni").val();
	var nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();
	var merilec = $("#dodajVitalnoMerilec").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: merilec
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    	console.log(res.meta.href);
		        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
	}
}


function kreirajEHRzaBolnika() {
	sessionId = getSessionId();

	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var datumRojstva = $("#kreirajDatumRojstva").val();

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#kreirajSporocilo").html("<span class='obvestilo label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "'.</span>");
		                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                    //$("#preberiEHRid").val(ehrId);
		                }
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
	}
}

function preveriBolnika(ime,priimek) {
    sessionId = getSessionId();
    var searchData = [
        {key: "firstNames", value: "*"},
        {key: "lastNames", value: "*"}
        //{key: "ehrId", value: "*"}
    ];
    $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
    });
    $.ajax({
        url: baseUrl + "/demographics/party/query",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(searchData),
        success: function (res) {
            for (i in res.parties) {
                var party = res.parties[i];
                var ehrId;
                for (j in party.partyAdditionalInfo) {
                    if (party.partyAdditionalInfo[j].key === 'ehrId') {
                        ehrId = party.partyAdditionalInfo[j].value;
                        break;
                    }
                }
                
                if(typeof party.firstNames === 'undefined' || typeof party.lastNames === 'undefined'){
                    continue;
                }
                if(party.firstNames.localeCompare(ime)==0 && party.lastNames.localeCompare(priimek)==0){
                    $("#izpis").append('returnam : true<br>');
                    return true;
                }
                
            }
            $("#izpis").append('Preverjam: '+party.firstNames + ' ' + party.lastNames+ '<br>');
            return false;
        }
    });
    return false;
}


function preveriBolnike() {
    sessionId = getSessionId();
    var searchData = [
        {key: "firstNames", value: "*"},
        {key: "lastNames", value: "*"}
        //{key: "ehrId", value: "*"}
    ];
    $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
    });
    $.ajax({
        url: baseUrl + "/demographics/party/query",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(searchData),
        success: function (res) {
            for (i in res.parties) {
                var party = res.parties[i];
                var ehrId;
                for (j in party.partyAdditionalInfo) {
                    if (party.partyAdditionalInfo[j].key === 'ehrId') {
                        ehrId = party.partyAdditionalInfo[j].value;
                        break;
                    }
                }
                if(typeof party.firstNames === 'undefined' || typeof party.lastNames === 'undefined'){
                    continue;
                }
                //$("#izpis").append('Preverjam: '+party.firstNames + ' ' + party.lastNames+ '<br>');
                var st1 = 0;
                var st2 = 0;
                var st3 = 0;
                if(party.firstNames.localeCompare("Miha")==0 && party.lastNames.localeCompare("Agon")==0){
                    $("#izpis").append(party.firstNames + ' ' + party.lastNames + ' (ehrId = ' + ehrId + ')<br>');
                    st1++;
                }else if(party.firstNames.localeCompare("Andreja")==0 && party.lastNames.localeCompare("Čipels")==0){
                    $("#izpis").append(party.firstNames + ' ' + party.lastNames + ' (ehrId = ' + ehrId + ')<br>');
                    st2++;
                }else if(party.firstNames.localeCompare("Franci")==0 && party.lastNames.localeCompare("Ecrs")==0){
                    $("#izpis").append(party.firstNames + ' ' + party.lastNames + ' (ehrId = ' + ehrId + ')<br>');
                    st3++;
                }
                
            }   
            if(st1!=0&&st2!=0&&st3!=0)
                return true;
            return false;
        }
    });
}



function dodajZaFrancija(){
    var num = 30;//manj od 30
    var teze = genereirajNaklucneTeze(90,1,num);
    var visine = genereirajNaklucneVisine(170,169.5,num);
    var temp = genereirajNaklucneTemp(36.5,0.5,num);
    var sis = genereirajNaklucnePresure(120,8,num);
    var dis = genereirajNaklucnePresure(80,6,num);
    var kisik = genereirajNaklucneKisike(7,num);
    for(var i = 0;i<num;i++){
        var datum = "2014-1-"+(i+1)+"T09:00Z";
        console.log(datum);
        console.log(franci,datum,String(visine[i]),String(teze[i]),String(temp[i]),String(sis[i]),String(dis[i]),String(kisik[i]),"sam");
        dodajMeritevVitalnihZnakov(franci,datum,String(visine[i]),String(teze[i]),String(temp[i]),String(sis[i]),String(dis[i]),String(kisik[i]),"sam");
        
    }
    
}

function dodajZaAndrejo(){
    var num = 30;//manj od 30
    var teze = genereirajNaklucneTeze(70,1,num);
    var visine = genereirajNaklucneVisine(180,180,num);
    var temp = genereirajNaklucneTemp(36.5,0.5,num);
    var sis = genereirajNaklucnePresure(115,5,num);
    var dis = genereirajNaklucnePresure(70,4,num);
    var kisik = genereirajNaklucneKisike(4,num);
    for(var i = 0;i<num;i++){
        var datum = "2014-1-"+(i+1)+"T09:00Z";
        console.log(datum);
        console.log(andreja,datum,String(visine[i]),String(teze[i]),String(temp[i]),String(sis[i]),String(dis[i]),String(kisik[i]),"sam");
        dodajMeritevVitalnihZnakov(andreja,datum,String(visine[i]),String(teze[i]),String(temp[i]),String(sis[i]),String(dis[i]),String(kisik[i]),"sam");
        
    }
    
}

function dodajZaMiho(){
    var num = 30;//manj od 30
    var teze = genereirajNaklucneTeze(55,0.7,num);
    var visine = genereirajNaklucneVisine(160,161,num);
    var temp = genereirajNaklucneTemp(36.5,0.5,num);
    var sis = genereirajNaklucnePresure(110,3,num);
    var dis = genereirajNaklucnePresure(65,3,num);
    var kisik = genereirajNaklucneKisike(3,num);
    for(var i = 0;i<num;i++){
        var datum = "2014-1-"+(i+1)+"T09:00Z";
        console.log(datum);
        console.log(miha,datum,String(visine[i]),String(teze[i]),String(temp[i]),String(sis[i]),String(dis[i]),String(kisik[i]),"nekdo");
        dodajMeritevVitalnihZnakov(miha,datum,String(visine[i]),String(teze[i]),String(temp[i]),String(sis[i]),String(dis[i]),String(kisik[i]),"nekdo");
        
    }
    
}

function dodajZaTest(){
    var num = 10;//manj od 30
    var teze = genereirajNaklucneTeze(70,1,num);
    var visine = genereirajNaklucneVisine(160,161,num);
    var temp = genereirajNaklucneTemp(36.5,0.5,num);
    var sis = genereirajNaklucnePresure(110,3,num);
    var dis = genereirajNaklucnePresure(65,3,num);
    var kisik = genereirajNaklucneKisike(4,num);
    for(var i = 0;i<num;i++){
        var datum = "2014-1-"+(i+1)+"T09:00Z";
        console.log(datum);
        console.log(testid,datum,String(visine[i]),String(teze[i]),String(temp[i]),String(sis[i]),String(dis[i]),String(kisik[i]),"nekdo");
        dodajMeritevVitalnihZnakov(testid,datum,String(visine[i]),String(teze[i]),String(temp[i]),String(sis[i]),String(dis[i]),String(kisik[i]),"nekdo");
        
    }
    
}

function dodajMeritevVitalnihZnakov(ehrId,dinu,tv,tt,ttemp,skt,dkt,nksk,merilec) {
	sessionId = getSessionId();

//	var ehrId = $("#dodajVitalnoEHR").val();
//	var datumInUra = $("#dodajVitalnoDatumInUra").val();
//	var telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
//	var telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();
//	var telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
//	var sistolicniKrvniTlak = $("#dodajVitalnoKrvniTlakSistolicni").val();
//	var diastolicniKrvniTlak = $("#dodajVitalnoKrvniTlakDiastolicni").val();
//	var nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();
//	var merilec = $("#dodajVitalnoMerilec").val();

    $.ajaxSetup({
        headers: {"Ehr-Session": sessionId}
    });
    var podatki = {
        "ctx/language": "en",
        "ctx/territory": "SI",
        "ctx/time": dinu,
        "vital_signs/height_length/any_event/body_height_length": tv,
        "vital_signs/body_weight/any_event/body_weight": tt,
        "vital_signs/body_temperature/any_event/temperature|magnitude": ttemp,
        "vital_signs/body_temperature/any_event/temperature|unit": "°C",
        "vital_signs/blood_pressure/any_event/systolic": skt,
        "vital_signs/blood_pressure/any_event/diastolic": dkt,
        "vital_signs/indirect_oximetry:0/spo2|numerator": nksk
    };
    var parametriZahteve = {
        "ehrId": ehrId,
        templateId: 'Vital Signs',
        format: 'FLAT',
        committer: merilec
    };
    $.ajax({
        url: baseUrl + "/composition?" + $.param(parametriZahteve),
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(podatki),
        success: function (res) {
            console.log(res.meta.href);
        },
        error: function(err) {
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });
	
}

function genereirajNaklucneTeze(start,pm,n){
    var data = new Array();
    for (i = 0; i < n; i++){
        data[i] = 0.002*(i*i)+((Math.random()*pm*2)-pm)+start;
        //data[i] = Math.floor(data[i]);
    } 
    
    return data;
}
function genereirajNaklucneTemp(start,pm,n){
    var data = new Array();
    for (i = 0; i < n; i++){
        data[i] = ((Math.random()*pm*2)-pm)+start;
        //data[i] = Math.floor(data[i]);
    }
    return data;
}
function genereirajNaklucneVisine(start,end,n){
    var data = new Array();
    var dv = (end-start)/n; 
    var pm = 0.1;
    for (i = 0; i < n; i++){
        data[i] = ((Math.random()*pm*2)-pm)+start+(i*dv);
       // data[i] = Math.floor(data[i]);
    }
        //data[i] = 1;
    return data;
}
function genereirajNaklucnePresure(start,pm,n){
    var data = new Array();
    for (i = 0; i < n; i++){
        data[i] = ((Math.random()*pm*2)-pm)+start;
        //data[i] = Math.floor(data[i]);
    }
    return data;
}
function genereirajNaklucneKisike(pm,n){
    var data = new Array();
    var start = 100;
    for (i = 0; i < n; i++) { 
        var y = start-((Math.random()*pm));
        data[i] = y;
        //data[i] = Math.floor(data[i]);
    } 
    return data;
}

//var vis;
var lineData = [];
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
    $("#grafdiv").html('<svg id="visualisation" width="300" height="180"></svg>');
    InitChart();
}

$(window).resize(function(){
    $("#visualisation").width($("#grafdiv").width());
});

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
		var podatki = $(this).val().split(",");
		$("#kreirajIme").val(podatki[0]);
		$("#kreirajPriimek").val(podatki[1]);
		$("#kreirajDatumRojstva").val(podatki[2]);
	});
    
    $('#preberiPredlogoBolnikaZaEHR').change(function() {
		var podatki = $(this).val();
		$("#preberiEHR").val(podatki);
	});
    
     $('#preberiObstojeciEHRid').change(function() {
		var podatki = $(this).val();
		$("#preberiEHRid").val(podatki);
	});
    $('#preberiObstojeciVitalniZnak').change(function() {
		var podatki = $(this).val();
		$("#dodajVitalnoEHR").val(podatki);
	});
    
     $('#myButton').on('click', function () {
        var $btn = $(this).button('loading');
        //preveriBolnike();
        //osveziGraf();
        dodajZaMiho();
         dodajZaAndrejo();
         dodajZaFrancija();
        $btn.button('reset');
     });
    
     InitChart();
});