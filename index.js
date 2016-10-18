var server=require("./server");
var handleRequest=require("./handleRequest");
var requestConfig={
    "readResouce":handleRequest.readResouce,
    "/miaovr/views/login.html":handleRequest.page,
    "/miaovr/views/qiniu-index.html":handleRequest.page,
    "/miaovr/views/upload.html":handleRequest.page,
    "/miaovr/views/visitUserHome.html":handleRequest.page,
    "/miaovr/views/detu.html":handleRequest.page,
    "/miaovr/views/comDetails.html":handleRequest.page,
    "/miaovr/views/history.html":handleRequest.page,
    "/miaovr/views/vrgameDetails.html":handleRequest.page,
    "/miaovr/views/vrtvChannel.html":handleRequest.page,
    "/miaovr/views/registerSuccess.html":handleRequest.page,
    "/miaovr/views/register.html":handleRequest.page,
    "/miaovr/views/userCenter.html":handleRequest.page,
    "/miaovr/views/playvr.html":handleRequest.page,
    "/miaovr/views/vrtv.html":handleRequest.page,
    "/miaovr/views/vrinfo.html":handleRequest.page,
    "/miaovr/views/community.html":handleRequest.page,
    "/miaovr/views/vrgame.html":handleRequest.page,
    "/miaovr/index.html":handleRequest.page,
    "/miaovr/queryApi":handleRequest.queryApi
};
server.run(requestConfig);