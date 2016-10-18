var Base=(function($,b){
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
          temp_result=list[i];
          if(!mn){//不限制
            if(childrenBoxs.length<=i){
                temp_box= $(childrenBoxs[0]).clone(true); 
                $parentBox.append(temp_box);
            }else{
                temp_box=$(childrenBoxs[i]);
            }
            handleResultItem(temp_result,temp_box,searchItems,resultItems);
          }else{//限制显示条数
             if(i<mn){
                temp_box=$(childrenBoxs[i]);
                handleResultItem(temp_result,temp_box,searchItems,resultItems);
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
        "id":/^[0-9a-zA-Z-]+$/
    }
    b.searchParam=function(key,type){
        var search_param=window.location.search;
        var value=null;
        if(!search_param.match((/^(\?)[\w]+(=)[\w-]+/))||!searchMatch[type]){
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
                temp_child.html(handleText(temp_child,temp,resultItems[k]));
            }else if(k==="role-id"){
                temp_child.attr("role-id",temp[resultItems[k]]);
            }else if(k==="href"){
                if(temp_child.attr("role-base")){
                    temp_child.attr("href",temp_child.attr("role-base")+temp[resultItems[k]]);
                }else{
                    temp_child.attr("href",temp_child.attr("href")+temp[resultItems[k]]);
                }
            }else if(k==="title"){
                 temp_child.attr("title",temp[resultItems[k]]);
            }else{
                return;
            }             
        }
    }
    function handleText(ele,data,txt){
        var result=data[txt];
        if(txt==="publish_time"){
            result=b.formatDate(data[txt]);
        }else if(txt==="duration"){
            result=b.formatTime(data[txt]);
        }
        var limit=ele.attr("role-limit");
        if(limit){
            result=result.length>limit?result.slice(0,limit)+"...":result
        }
        return result;
    }
    b.isLogin=function(){
        uuid=$.cookie("uuid");
        if(uuid){
            return true;
        }else{
            // b.showAlert("请先登录","error");
            return false;
        }
    };
    var loginMask=null;
    var loginBox=null;
    var uname=null;
    var pass=null;
    b.showLoginBox=function(){
        if(!loginMask){
            loginMask=$("<div class='login-mask'></div>");
            loginMask.on("click",function(){
                $(this).fadeOut();
                loginBox.fadeOut();
            });
            loginMask.appendTo($("body"));
        }
        if(!loginBox){
            loginBox=$(".a-login-box");
        }
        if(!uname){
            uname=$("#uname");
        }
        if(!pass){
            pass=$("#pass");
        }
        uname.val("");
        pass.val("");
        loginMask.height($(document).height());
        loginMask.fadeIn();
        loginBox.fadeIn();
    };
    b.setBtnDisabled=function(selector){
        var btn=$(selector);
        if(btn.length>0){
             btn.attr("disabled","disabled").addClass("btn-disabled");  
             return btn; 
        }
    };
    b.setBtnEnabled=function(selector){
        var btn=$(selector);
        if(btn.length>0){
             btn.removeAttr("disabled","disabled").removeClass("btn-disabled");   
             return btn;
        }
    };
    b.formatDate=function(longtime){
        var date=new Date(longtime);
        return date.getFullYear()+"-"+
        handleDate(date.getMonth())+
        "-"+handleDate(date.getDate());
    };
    b.formatTime=function(longtime){
        if(!longtime){
           return "00:00"; 
        }
        var allSeconds=parseInt(longtime)/1000;
        var result="";
        var minutes=Math.floor(allSeconds/60);
        var hour=Math.floor(allSeconds/3600);
        var seconds=Math.floor(allSeconds%60);
        if(hour>0){
            console.log(hour);
            result=handleDate(hour)+":"+handleDate(minutes)+":"+handleDate(seconds);
        }else{
            result=handleDate(minutes)+":"+handleDate(seconds);
        }
        return result;
    };
    //统一处理错误
    b.errorBack=function(msg){
        
    };
    var genderObj={"1":"男","2":"女"};
    b.handleGender=function(gender){
        if(!gender){
            return "暂无";
        }else if(gender=="1"){
            return "男";
        }else if(gender=="2"){
            return "女";
        }else{
            return "";
        }
    }
    b.handleComments=function(data){
        var $parentBox=$(".comments-box");
        $parentBox.find("img").on("error",function(){
          var _this=$(this);
          _this.attr("src",_this.attr("role-err"));
          _this.off("error");
        });
        var temp_result=null;
        var temp_box=null;
        var vnum=0;
        var temp_child=null;
        var list=data.list_result;
        var list_length=list.length;
        var answer_list=[];
        for (var i=0; i<list_length; i++){
            temp_result=list[i];
            if(temp_result.to_commentId){
                answer_list.push(temp_result);
                console.log("yes");
                continue;
            }
            temp_box=addComment(temp_result);
        }
        $parentBox.find(".mask-loading").fadeOut();
    };
    //根据回复信息找到该回复的评论
    function searchReplyComment(comments,to_commentId){
        var parComment=null;
        for(var i=0,j=comments.length;i<j;i++){
            if(comments[i].commentId==to_commentId){//找到评论
                console.log(comments[i].comment);
                parComment=comments[i];
                i=j;
            }
        }
        return parComment;
    }
    function test(commentData){
        return "<div></div>";
    }
    function handleDate(t){
        return ("0"+t).slice(-2);
    }
    return b;
})($,Base||{});
