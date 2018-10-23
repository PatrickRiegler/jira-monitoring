rm JiraMonitoringNodeJS.zip 
cd JiraMonitoringNodeJS
echo "zipping..."
zip -q -X -r ../JiraMonitoringNodeJS.zip *
cd .. 
echo "uploading..."
aws lambda update-function-code --function-name JiraMonitoringNodeJS --zip-file fileb://JiraMonitoringNodeJS.zip --profile OR

echo
echo "----------------"


