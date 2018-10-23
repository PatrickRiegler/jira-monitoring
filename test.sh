cd JiraMonitoringNodeJS
lambda-local -p OR -P ~/.aws/credentials -l index.js -h handler -e event.json -t 10 
lambda-local -p OR -P ~/.aws/credentials -l env.js -h handler -e event.json -t 10 

