
//server.js
'use strict'
//dipendenze

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var mysql = require('mysql');
const spawn = require('child_process').spawn;
var registeredStub = [];



//istanze
var app = express();

var router = express.Router();
//porta (default=3001)

var port = process.env.API_PORT || 3001;
//configurazione api
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Credentials', 'true');
 res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
 res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
 res.setHeader('Cache-Control', 'no-cache');
 next();
});

router.get('/', function(req, res) {
 res.json({ message: 'API Initialized!'});
});

//utilizzo configurazione router
app.use('/api', router);
//starts server
 app.listen(port, function() {

 console.log('api running on port '+ port );
});


router.route('/ngsi')
 .post(function(req, res) {
	console.log(req.body.edge_gateway_type + " " +req.body.edge_gateway_uri);
    var args = [];
	console.log("Snap kind : "+req.body.kind);

	/*if (registeredStub[req.body.contextbroker] !== undefined || registeredStub[req.body.contextbroker] !== "")  res.json({ message: 'stub already active for ORION context broker ' + req.body.contextbroker});
	else
	{*/
		registeredStub.push(req.body.contextbroker);
	//	args= ['./snap4cityBroker/ngsi2IoTDirectory_IntelligentRetrieval.js',
		args= ['./snap4cityBroker/ngsi2IoT_clean.js',
			req.body.contextbroker,
			req.body.ip,
			req.body.user,
			req.body.al,
			req.body.model,
			req.body.edge_gateway_type,
			req.body.edge_gateway_uri,
			req.body.organization,
			req.body.path,
			req.body.kind,
			req.body.apikey
		];


	    console.log("args: "+args);
		console.log("port: "+ req.body.port + "apiker "+ req.body.apikey);
	   //const spawn = require('child_process').spawn;
/*
	   const child_ngsi = spawn('node',args);
	
		child_ngsi.stdout.on('data', (data) => {
			var str = data.toString();
			var str2 = "";
			for(var i = 0; i < str.length; i++){
				var c = str.charAt(i);
				if(c.match(/[a-z]/i)){
					str2 = str2+c;
				}
			}

			if(str2.localeCompare("fatto")==0){
				request.state
				console.log("finalmente");
				res.status(200).send();
			}
		});
	
	  // res.json({ message: 'activated stub for ORION'});
	 //  }  
*/
	   const child_ngsi = spawn('node',args, {
			  //  detached: true,
			   stdio: 'inherit'
	   });
	   // child.unref();

});

router.route('/amqp')
 .post(function(req, res) {
    console.log("entrato amqp");

		// console.log(req.body.contextbroker + " " +req.body.ip + " " +req.body.port);
		var args = [];
		registeredStub.push(req.body.contextbroker);

		args= ['./snap4cityBroker/amqp2IoTDirectory_cbRetrieval.js',
			req.body.contextbroker,
			req.body.ip,
			req.body.port,
			req.body.user,
			req.body.al,
			req.body.model,
			req.body.edge_gateway_type,
			req.body.edge_gateway_uri
		];
	   // console.log(args);
//	   const spawn = require('child_process').spawn;

	   const child_amqp = spawn('node',args, {
			  //  detached: true,
			   stdio: 'inherit'
	   });
	   // child.unref();

	 res.json({ message: 'activated stub for AMQP'});

});

router.route('/mqtt')
 .post(function(req, res) {
    console.log("entrato MQTT T");
     console.log("edge gateway "+req.body.edge_gateway_type+ " " +req.body.ip + " " +req.body.port);
			registeredStub.push(req.body.contextbroker);
			var args = [];
			args= ['./snap4cityBroker/mqtt2IoTDirectory_cbRetrieval.js',
				req.body.contextbroker, 
				req.body.ip,
				req.body.port,
				req.body.user,
				req.body.al,
				req.body.model,
				req.body.edge_gateway_type,
				req.body.edge_gateway_uri
				];
		   // console.log(args);
		   // const spawn = require('child_process').spawn;

		   const child_mqtt = spawn('node',args, {
			  //     detached: true,
				   stdio: 'inherit'
		   });
		   // child.unref();
		   res.json({ message: 'activated stub for MQTT'});
		   
});
router.route('/trainingTree')
 .post(function(req, res) {
    console.log("entrato training");
			registeredStub.push(req.body.contextbroker);
			
			var args = [];
			var predPrecentage =0.0;
			args= ['./R/tree.R','--save'];
						
			var r_comm = '/usr/bin/Rscript';
			var rspawn = spawn(r_comm,args);
	
			rspawn.stdout.on('data', function (data) {
				predPrecentage = data.toString();
			    console.log('PREDICTED '+predPrecentage);
						   res.json(predPrecentage);

			});

			rspawn.stderr.on('data', function (data) {
			  console.log('STDERR: \n');
			  console.log(data.toString());
			});

			rspawn.on('close', function (code) {
			  console.log('child process exited with code ' + code);
			});
		   // child.unref();
		   
});
router.route('/predictDeviceType')
 .post(function(req, res) {
    console.log("entrato training");
			registeredStub.push(req.body.contextbroker);
			
			var args = [];
			var predicted="";
			args= ['./R/devType.R','--save'];
			
			console.log("jsondev "+req.body.jsonDev);
			
			var r_comm = '/usr/bin/Rscript';
			var rspawn = spawn(r_comm,args);
	
			rspawn.stdout.on('data', function (data) {
				predicted = data.toString();
			    console.log('STOUXXT: \n'+predicted);
				res.json(predicted);
			});
			rspawn.stderr.on('data', function (data) {
			  console.log('STDERR: \n');
			  console.log(data.toString());
			});

			rspawn.on('close', function (code) {
				console.log('child process exited with code ' + code);
			});
			
			var stdin = process.openStdin();

			stdin.addListener("data", function(data) {
			  rspawn.stdin.write(req.body.jsonDev);
			});
		   
});
router.route('/status')
 .get(function(req, res) {
 console.log("entrato status");
 res.json({ message: JSON.stringify(registeredStub)});
});
