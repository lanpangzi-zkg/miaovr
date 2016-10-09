var Base=(function($,b){
    var config={
        basePath:"http://127.0.0.1:8080/miaovr/queryApi"
    };
    // var auth="Basic OTczZmU5MDMtMzdiMy05MTMyLTlkYWEtMmQyNzRjNjYxODZhOjVmOGE5ZjJk";
    // var accessToken="MVYybWJvVGVLdzdEa3FDVXFGNXpYVTltU3BGblIzR25rcGcvU2hJWEY5akxKUmdVUlRoRHVkS2lPMkJ4NlNNRA==";
    // var javaServerUrl="http://api2.app.miaomiaotv.cn:8080/miaomiaotv";
    // var phpServerUrl="http://api.app.miaomiaotv.cn";
    b.queryData=function(method,requestType,param,successCallBack,failCallBack){
        // var basePath=javaServerUrl;
        // if(method.match(".php?")){
        //     basePath=phpServerUrl+method;
        // }else{
        //     basePath=javaServerUrl+method;      
        // }
        var _param=param||{};
        _param.method=method;
        //_param.accessToken=accessToken;
        $.ajax({
            url:config.basePath,
            //url:basePath,
            type:requestType||"GET",
            data:_param,
            // headers: {
            // 'Authorization': auth,
            // }
            dataType:"json",
            success:function(data){
                if(typeof successCallBack=="function"){
                    successCallBack(data);
                }
            },
            error:function(err){
                if(typeof failCallBack=="function"){
                    failCallBack(err);
                }
            }
        });
    };
    b.handleResult=function(parentId,data,searchItems,resultItems,listName){
        var $parentBox=$("#"+parentId);
        $parentBox.find("img").on("error",function(){
          var _this=$(this);
          _this.attr("src",_this.attr("role-err"));
          _this.off("error");
        });
        var childrenBoxs=$parentBox.find(searchItems.childrenBox);
        var list=null;
        if(arguments.length>4){
            list=data[listName];
        }else{
            list=data.list_result;
        }
        delete searchItems.childrenBox;
        var mn=parseInt($parentBox.attr("role-mn"));
        var temp_result=null;
        var temp_box=null;
        var vnum=0;
        var temp_child=null;
        for (var i=0,j=list.length; i<j; i++){
          temp=list[i];
          if(!mn){//不限制
            if(childrenBoxs.length<i){
                temp_box= $(childrenBoxs[0]).clone(true); 
                $parentBox.append(temp_box);
            }else{
                temp_box=$(childrenBoxs[i]);
            }
            handleResultItem(temp,temp_box,searchItems,resultItems);
          }else{//限制显示条数
             if(i<mn){
                temp_box=$(childrenBoxs[i]);
                handleResultItem(temp,temp_box,searchItems,resultItems);
                vnum++;
              }else{
                i=j;
              }
          }      
        }
        if(vnum<mn){
          for (var i=vnum;i<mn;i++) {
            $(childrenBoxs[i]).css("display","none");
          };
        }
        $parentBox.find(".mask-loading").fadeOut();
    };
    b.isSuccess=function(data){
        return data.status=="1"&&data.error_code=="0";
    };
    var searchMatch={
        "number":/^[0-9]+$/,
        "id":/^[0-9a-zA-Z]+$/
    }
    b.searchParam=function(key,type){
        var search_param=window.location.search;
        var value=null;
        if(!search_param.match((/^(\?)[\w]+(=)[\w]+/))||!searchMatch[type]){
            return value;
        }
        var search_arr=search_param.slice(1).split("&");
        var temp_arr=[];
        for(var i=0,j=search_arr.length;i<j;i++){
            temp_arr=search_arr[i].split("=");
            if(temp_arr[0]==key&&temp_arr[1].match(searchMatch[type])){
                value=temp_arr[1];
                i=j;
            }
        }
        return value;
    };
    var alertBox=null;
    b.showAlert=function(msg,type){
        if(msg){
            if(!alertBox){
                alertBox=$("<div class='alertBox'></div>");
                alertBox.appendTo($("body"));
            }
            var className="success";
            if(type=="error"){
                className="error";
            }
            var temp=$("<div class='alert-tip "+className+"'>"+msg+"</div>");
            temp.appendTo(alertBox);
            temp.fadeIn("slow");
            setTimeout(deleteAlert.bind(temp),3000);
        }      
    };
    function deleteAlert(){
        $(this).fadeOut("slow",function(){
            $(this).remove();
        });
    }

    function handleResultItem(temp,temp_box,searchItems,resultItems){
        for(var k in searchItems){
            var temp_child=temp_box.find(searchItems[k]);
            if(k==="img"){
                temp_child.attr("src",temp[resultItems[k]]);
            }else if(k.indexOf("txt")>=0){
                temp_child.html(temp[resultItems[k]]);
            }else if(k==="role-id"){
                temp_child.attr("role-id",temp[resultItems[k]]);
            }else if(k==="href"){
                if(temp_child.attr("role-base")){
                    temp_child.attr("href",temp_child.attr("role-base")+temp[resultItems[k]]);
                }else{
                    temp_child.attr("href",temp[resultItems[k]]);
                }
            }else if(k==="title"){
                 temp_child.attr("title",temp[resultItems[k]]);
            }else{
                return;
            }             
        }
    }

    return b;
})($,Base||{});
