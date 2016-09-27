var Base=(function($,b){
    var config={
        basePath1:"http://api2.app.miaomiaotv.cn:8080/miaomiaotv/",
        basePath2:"",
        auth:"Basic OTczZmU5MDMtMzdiMy05MTMyLTlkYWEtMmQyNzRjNjYxODZhOjVmOGE5ZjJk"
    };
    b.queryData=function(method,requestType,param,successCallBack,failCallBack){
        $.ajax({
            url:config.basePath1+method,
            type:requestType||"GET",
            data:param,
            dataType:"json",
            success:function(data){
                if(typeof successCallBack=="function"){
                    failCallBack(data);
                }
            },
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", config.auth);
            },
            error:function(){
                if(typeof failCallBack=="function"){
                    failCallBack();
                }
            }
        });
    };
    b.saveData=function(){

    };
    b.updateData=function(){

    };
    return b;
})($,Base||{});
