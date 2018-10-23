var aws = require('aws-sdk');  
aws.config.region = 'eu-central-1'; //Change this to the region you like
var ec2 = new aws.EC2({
   region: 'eu-west-1',
   profileName: 'OR',
   profilePath: '~/.aws/credentials'
});  
var ses = new aws.SES({
   region: 'eu-west-1',
   profileName: 'OR',
   profilePath: '~/.aws/credentials'
});

const keyForInstanceTagVerify = "verify"; //looks for string yes
const keyForInstanceTagVerifyUrl = "verifyUrl"; //looks for string yes
const keyForInstanceTagVerifyEmail = "verifyEmail"; //looks for string yes
const keyForInstanceTagVerifyEmailCC = "verifyEmailCC"; //looks for string yes


function verifyService(verifyUrl, instanceid, name, verifyEmail, verifyEmailCC, data) {
                    var request = require('request');
                    const util = require('util');
                    request(verifyUrl, function (error, response, body) {
                        console.log("-------------------------------")
                        console.log("instance: " + name)
                        if (!error && response.statusCode == 200) {
                            console.log("ok: " + response.statusCode)

                        } else {
                            console.log("error: " + error + " --- " + response.statusCode)
                            console.log("starting instance...:" + name)
                            var params = {
                                InstanceIds: [instanceid],
                                DryRun: false
                            };
                            /*
                            ec2.describeInstanceStatus(params, function (err, data) {
                                if (err) {
                                    console.log("instance '" + instanceid + "' with name '" + name + "' not available")
                                }
                                console.log(data)
                                console.log(util.inspect(data, false, null))
                                console.log(data.InstanceState)
                                console.log(data.InstanceStatus)
                            });
                            */
                            sendMail(verifyEmail, verifyEmailCC, instanceid, name);
                            //restartService(instanceid, name, data);

                    }
                        console.log("")
                    })
}

function restartService(instanceid, name, data) {
        console.log("restarting : " + name)
        console.log("restarting : " + instanceid)
                            var params = {
                                InstanceIds: [instanceid],
                                DryRun: false
                            };
                            ec2.stopInstances(params, function(err, data) {
                                if (err) {
                                    console.log("instance could not be stopped...")
                                    console.log(err)
                                    return false;
                                }
                                console.log("instance stopped...")
                                return true;
                            });
                            setTimeout(function() {
                                ec2.startInstances(params, function(err, data) {
                                    if (err) {
                                        console.log("instance could not be started...")
                                        console.log(err)
                                        return false;
                                    }
                                    console.log("instance started...")
                                    return true;
                                });
                            }, 60000);

}


function sendMail(verifyEmail, verifyEmailCC, instanceid, name) {
    var eParams = {
        Destination: {
            ToAddresses: (verifyEmail!="") ? verifyEmail.split(",") : "patrick.riegler@intdev.ch".split(","),
            CcAddresses: (verifyEmailCC!="") ? verifyEmailCC.split(",") : "patrick.riegler@intdev.ch".split(",")
        },
        Message: {
            Body: {
                Text: {
                    Data: "Die Instanz wurde automatisch neu gestartet\nyour Big Brother"
                }
            },
            Subject: {
                Data: "restarting instance: " + name + " --- with id: " + instanceid
            }
        },
        Source: "jira@oskar-ruegg.com"
    };
    console.log('===SENDING EMAIL===');
    var email = ses.sendEmail(eParams, function(err, data){
        if(err) console.log(err);
        else {
            console.log("===EMAIL SENT===");
            // console.log(data);
        }
    });
}


exports.handler = (event, context, callback) => {
    var instanceparams = {
        Filters: [{
            Name: 'tag:' + keyForInstanceTagVerify,
            Values: [
                'true'
            ]
        }]
    };
    
    ec2.describeInstances(instanceparams, function(err, data) {
 console.log(err)
 console.log(data)
 console.log(data.Reservations)

        if (err) console.log(err, err.stack);
        else {
            for (var i in data.Reservations) {
 console.log("here")
    
                for (var j in data.Reservations[i].Instances) {
 console.log("here2")
                    var instanceid = data.Reservations[i].Instances[j].InstanceId;
                    var name = "", verifyUrl = "";
                    for (var k in data.Reservations[i].Instances[j].Tags) {
                        if (data.Reservations[i].Instances[j].Tags[k].Key == 'Name') {
                            name = data.Reservations[i].Instances[j].Tags[k].Value;
                        }
                        if(data.Reservations[i].Instances[j].Tags[k].Key == keyForInstanceTagVerifyUrl){
                            verifyUrl = data.Reservations[i].Instances[j].Tags[k].Value;
                        }
                        if(data.Reservations[i].Instances[j].Tags[k].Key == keyForInstanceTagVerifyEmail){
                            verifyEmail = data.Reservations[i].Instances[j].Tags[k].Value;
                        }
                        if(data.Reservations[i].Instances[j].Tags[k].Key == keyForInstanceTagVerifyEmailCC){
                            verifyEmailCC = data.Reservations[i].Instances[j].Tags[k].Value;
                        }
                    }
                    verifyService(verifyUrl, instanceid, name, verifyEmail, verifyEmailCC, data);

                }
            }
        }

    });
    callback(null, 'Script Successful');
};
