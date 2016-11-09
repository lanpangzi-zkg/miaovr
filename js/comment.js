var comment=(function(c){
    var config={};
    var $comments_list=null;
    var $comment_body=null;
    var nameId="";
    var textArea="";
    var commentBox="";
    var timeout=null;
    var bottomHeight=0;
    var winHeight=0;
    var pagePerNum=4;
    var pageParam="";
    var pageNum=1;
    var commentsLength=0;
    var allNum=0;
    var loginCallBack=null;
    c.init=function(config_params){
        config=config_params;
        nameId=config.nameId;
        textArea=config.textArea||".commment-body";
        commentBox=config.commentBox||"#c-comment-box";
        $comments_list=$(commentBox);
        $comment_body=$(textArea);
        if("loginCallBack" in config_params){
          loginCallBack=config_params.loginCallBack;
        }
        Base.isLogin();
        $comment_body.on("click",function(){
          var $_this=$(this);
          if($_this.val()=="请输入评论内容"){
            $_this.val("");
          }
          $_this.css("color","#000");
        }).on("blur",function(){
          var $_this=$(this);
          if(!$_this.val()){
            $_this.val("请输入评论内容");
            $_this.css("color","#ccc");
          }
        });
        //发布评论
        $(".btn-publish").on("click",function(e){
          if(!Base.isLogin()){
            LoginValid.init("login-form",function(data){
              $(".login-mask").click();
              if(typeof loginCallBack==="function"){
                loginCallBack();
              }
            });
            Base.showLoginBox();
            return;
          }
          e.preventDefault();
          var btn=$(this);
          var comment=$comment_body.val();
          if(!comment||comment=="请输入评论内容"){
             Base.showAlert("请输入点评内容","error");
             $(""+textArea).focus();
             return;
          }
          comment=Base.xssCheck(comment);
          btn.attr("disabled","disabled").addClass("btn-disabled");
          var _param={"comment":comment,
            "from_uuid":Base.getUUID()};
          for(var k in queryParam){
            _param[k]=queryParam[k];
          }  
          Base.excuteAjax(config.publish,"POST",_param,function(data){
            if(Base.isSuccess(data)){
              Base.showAlert("点评成功");
              $comment_body.val("");
              commentsLength++;
              allNum++;
              var fList=$comments_list.find(".comment-item")[0];
              var nf=$(addItemComment(data.result,commentsLength));
              if(fList){
                nf.insertBefore($(fList));
              }else{
                nf.appendTo($comments_list);
                $(".pagination-box").css("display","block");
              }
              if(!commentsLength%pagePerNum==0){
                c.initPagination();
                $comments_list.find(".comment-item").removeClass("jp-hidden").css("display","none");
                if(fList){
                  $(fList).removeClass({"display":"list-item","opacity":"1"});
                }
                nf.removeClass({"display":"list-item","opacity":"1"});
                $(".pagination-box a").eq(1).click();
              }
            }else{
              Base.showAlert(data.error_msg,"error");
            }
            btn.removeAttr("disabled").removeClass("btn-disabled");
          },function(err){
            Base.showAlert(err,"error");
            btn.removeAttr("disabled").removeClass("btn-disabled");
          });
        });
        //显示与隐藏回复输入框
        $comments_list.delegate(".btn-show-reply","click",function(e){
          e.preventDefault();
          if(!Base.isLogin()){
            LoginValid.init("login-form",function(data){
              $(".login-mask").click();
              if(typeof loginCallBack==="function"){
                loginCallBack();
              }
            });
            Base.showLoginBox();
            return;
          }
          var _this=$(this);
          var reply_main=_this.parent().find(".reply-main");
          if(reply_main.length<1){
            reply_main=$(replyMainModule(_this.attr("role-id")));
            reply_main.insertAfter(_this);
          }
          if(reply_main.css("display")!=="block"){
            _this.val("取消回复");
            reply_main.css("display","block");
          }else{
            _this.val("回复");
            reply_main.css("display","none");
          }
        });
        //回复
        $comments_list.delegate(".btn-reply","click",function(){
          var _btn=$(this);
          var $reply_content=_btn.parent().siblings(".reply-to-comment");
          var reply=$reply_content.val();
          if(!reply){
            Base.showAlert("请填写回复内容","error");
            $reply_content.focus();
            return;
          }
          reply=Base.xssCheck(reply);
          _btn.attr("disabled","disabled").addClass("btn-disabled");
          var to_commentId=_btn.attr("reply-id");
          var _param={"comment":reply,
            "from_uuid":Base.getUUID(),
            "to_commentId":to_commentId};
          for(var k in queryParam){
            _param[k]=queryParam[k];
          }
          Base.excuteAjax(config.reply,"POST",_param,function(data){
            if(Base.isSuccess(data)){
              Base.showAlert("回复成功");
              var $par=$comments_list.find("#"+to_commentId);
              var $targetBox=$par.find(".comment-main");
              allNum++;
              $(addReplyItem(data.result,allNum)).appendTo($targetBox);
            }else{
              Base.showAlert(data.error_msg,"error");
            }
            $reply_content.val("");
            $reply_content.parent().css("display","none");
            _btn.removeAttr("disabled").removeClass("btn-disabled");
          },function(err){
            $reply_content.val("");
            Base.showAlert(err,"error");
            _btn.removeAttr("disabled").removeClass("btn-disabled");
          });        
        });
    };
    c.displayData=function(comments){
      c.handleCommentItem(comments);
      c.initPagination();
    }
    //查询评论
    c.queryComment=function(page){
        if(isPagination){
          if($(commentBox).find("li").length>0){
            $(commentBox).empty();
          }
        }
        var _page=page||1;
        pageParam="?offset="+pagePerNum*(_page-1)+"&length="+pagePerNum;
        Base.excuteAjax(config.query+pageParam,"POST",queryParam,function(data){
            console.log("查询评论信息");
            console.log(data);
            if(Base.isSuccess(data)){
              if(data.list_result.length<1){
                  $comments_list.find(".mask-loading").fadeOut();
              }else{
                c.handleCommentItem(data);               
              }
              pageNum=_page;
            }else{
              Base.showAlert(data.error_msg,"error");
            }
            $(".comments-box").find(".mask-loading").fadeOut();
          },function(err){
            Base.showAlert(err,"error");
        });
    };
    c.handleCommentItem=function(data){
        var $parentBox=$(".comments-box");
        $parentBox.find("img").on("error",function(){
          var _this=$(this);
          _this.attr("src",_this.attr("role-err"));
          _this.off("error");
        });
        var temp_result=null;
        var list=[];
        if(Object.prototype.toString.call(data)=="[object Array]"){
          list=data;
        }else if("list_result" in data){
          list=data.list_result;
        }
        var list_length=list.length;
        allNum=list_length;
        var answer_list=[];//回复
        for (var i=0; i<list_length; i++){
            temp_result=list[i];
            if(temp_result.to_commentId){
                answer_list.push({"floor":i,"data":temp_result});
                continue;
            }
            commentsLength++;
            $(addItemComment(temp_result,i)).appendTo($comments_list);
        }
        for(var i=0;i<answer_list.length;i++){
          temp_result=answer_list[i];
          var $to_commentItem=$parentBox.find("#"+temp_result.data.to_commentId);
          $(addReplyItem(temp_result.data,temp_result.floor)).appendTo($to_commentItem.find(".comment-main"));
        }
        $parentBox.find(".mask-loading").fadeOut();
    };
    c.initPagination=function (){
        $(".pagination-box").jPages({
          containerID  : "c-comment-box",
          previous:"上一页",
          next:"下一页",
          perPage      : pagePerNum,
          startPage    : 1,
          startRange   : 1,
          midRange     : 5,
          endRange     : 1,
          minHeight:false
        });
    };
    function addReplyItem(data,floor){
      var commentItem="<div class='comment-item reply-item' id='"+data.commentId+"'>"+
        "<div class='quote-box-start'>"+
           "<span class='quote-icon front-quote inb'></span>"+
        "</div><div class='reply-content'>"+
        "<div class='user-icon'><img src='"+getCommentIcon(data)+"' onerror='userImgErr(this)' class='img-responsive'/></div>"+
        "<div class='comment-main'>"+
          "<div class='user-info'>"+
            "<span class='user-name' id='u-"+data.commentId+"'>"+getCommentName(data)+"</span>"+
            "<span class='floor'>"+floor+"#</span>"+
          "</div>"+
          "<div class='user-comment'>"+data.comment+"</div>"+
        "</div>"+
        "<div class='reply-box'>"+
           "<a' class='btn-show-reply inb' role-id='"+data.commentId+"' href='javascript:void(0);'></a>"+
        "</div></div>"+
        "<div class='quote-box-end'>"+
          "<span class='quote-icon back-quote inb'></span>"+
        "</div>"+
      "</div>";
      return commentItem;
    }

    function replyMainModule(commentId){
      return "<div class='reply-main'>"
          +"<textarea class='reply-to-comment'></textarea>"
          +"<div class='btn-reply-group'>"
            +"<input type='button' value='提交' class='btn-reply' reply-id='"+commentId+"'>"
          +"</div>"
        +"</div>";
    }
    function getCommentIcon(data){
      if("thumbAvatar" in data){
        return data.thumbAvatar;
      }else{
        return "../images/common/default.png";
      }
    }
    var allNickNames={};
    function getCommentName(c){
      if("nickname" in c){
          return c.nickname;
      }else if("user" in c){
          return c.user.nickname;
      }else{
        var from_uuid=c.from_uuid;
        if(from_uuid in allNickNames){
          return allNickNames[from_uuid];
        }else{
          Base.excuteAjax("/user/friend_detail","POST",{"uuid":c.from_uuid},function(data){
              if(Base.isSuccess(data)){
                var nn=data.result.nickname;
                allNickNames[from_uuid]=nn;
                $("#u-"+c.commentId).html(nn);
                $("#"+c.commentId).find("img").attr("src",data.result.thumbAvatar);
              }
            });
          return "瞄瞄用户";
        }
      }
    }
    function addItemComment(data,floor){
        var commentItem="<li class='comment-item' id='"+data.commentId+"'>"+
          "<div class='user-icon'><img src='"+getCommentIcon(data)+"' onerror='userImgErr(this)' class='img-responsive'/></div>"+
          "<div class='comment-main'>"+
            "<div class='user-info'>"+
              "<span class='user-name' id='u-"+data.commentId+"'>"+getCommentName(data)+"</span>"+
              "<span class='floor'>"+floor+"#</span>"+
            "</div>"+
            "<div class='user-comment'>"+data.comment+"</div>"+
          "</div>"+
          "<div class='reply-box'>"+
             "<a class='btn-show-reply inb' role-id='"+data.commentId+"' href='javascript:void(0);'></a>"+
          "</div>"+
        "</li>";
        return commentItem;
    }
    return c;
})(comment||{});