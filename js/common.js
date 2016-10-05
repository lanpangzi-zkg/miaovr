var Base=(function($,b){
    function vlidateType(){

    }
    var config={
        basePath:"http://127.0.0.1:8080/miaovr/queryApi"
    };
    b.queryData=function(method,requestType,param,successCallBack,failCallBack){
        var _param=param||{};
        _param.method=method;
        $.ajax({
            url:config.basePath,
            type:requestType||"GET",
            data:_param,
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
          if(i<mn){
            temp=list[i];
            temp_box=$(childrenBoxs[i]);
            for(var k in searchItems){
                temp_child=temp_box.find(searchItems[k]);
                if(k==="img"){
                    temp_child.attr("src",temp[resultItems[k]]);
                }else if(k==="txt"){
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
            vnum++;
          }else{
            i=j;
          }
        }
        if(vnum<mn){
          for (var i=vnum;i<mn;i++) {
            $(childrenBoxs[i]).css("display","none");
          };
        }
        $parentBox.children(".mask-loading").fadeOut();
    };
    b.saveData=function(){

    };
    b.updateData=function(){

    };

    return b;
})($,Base||{});
