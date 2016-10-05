var server=require("./server");
var handleRequest=require("./handleRequest");
var requestConfig={
    "readResouce":handleRequest.readResouce,
    "/miaovr/views/playvr.html":handleRequest.page,
    "/miaovr/views/vrtv.html":handleRequest.page,
    "/miaovr/views/vrinfo.html":handleRequest.page,
    "/miaovr/views/community.html":handleRequest.page,
    "/miaovr/views/vrgame.html":handleRequest.page,
    "/miaovr/index.html":handleRequest.page,
    "/miaovr/queryApi":handleRequest.queryApi
};
server.run(requestConfig);