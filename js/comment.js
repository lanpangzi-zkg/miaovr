var comment=(function(c){
    var config={};
    var $comments_list=null;
    var $comment_body=null;
    var nameId="";
    var textArea="";
    var commentBox="";
    var isPagination=true;
    var $doc=null;
    var docHeight=0;
    var docScrollTop=0;
    var timeout=null;
    var bottomHeight=0;
    var winHeight=0;
    var length=2;
    var pageParam="";
    var pageNum=1;
    c.init=function(config_params){
        config=config_params;
        nameId=config.nameId;
        textArea=config.textArea||".commment-body";
        commentBox=config.commentBox||"#c-comment-box";
        $comments_list=$(commentBox);
        isPagination=config.isPagination||true;
        if(!isPagination){
          bottomHeight=$(".footer").height();
          $doc=$(document);
          winHeight=$(window).height();
          $doc.scroll(function(){ 
            clearTimeout(timeout);
            timeout=setTimeout(function(){
              docHeight=$doc.height();//可见高度  
              docScrollTop =$doc.scrollTop();//滚动高度  
              console.log(docHeight-bottomHeight);
              if(docScrollTop+winHeight>=docHeight-bottomHeight){
                console.log("arrive bottom");
              }
            },1000);
          });
        }else{
          console.log("分页");
        }
        //发布评论
        $(".btn-publish").on("click",function(e){
          if(!Base.isLogin()){
            LoginValid.init("login-form",function(data){
              $(".login-mask").click();
            });
            Base.showLoginBox();
            return;
          }
          e.preventDefault();
          var btn=$(this);
          var comment=$(".commment-body").val();
          if(!comment){
             Base.showAlert("请输入点评内容","error");
             $(""+textArea).focus();
             return;
          }
          btn.attr("disabled","disabled").addClass("btn-disabled");
          var _param={"comment":comment,
            "from_uuid":$.cookie("uuid")};
          for(var k in queryParam){
            _param[k]=queryParam[k];
          }  
          Base.queryData(config.publish,"POST",_param,function(data){
            if(Base.isSuccess(data)){
              Base.showAlert("点评成功");
              console.log(data);
              $(".commment-body").val("");
              //c.queryComment();
            }else{
              Base.showAlert(data.error_msg,"error");
            }
            btn.removeAttr("disabled").removeClass("btn-disabled");
          },function(err){
            Base.showAlert(err);
            btn.removeAttr("disabled").removeClass("btn-disabled");
          });
        });
        //显示与隐藏回复输入框
        $comments_list.delegate(".btn-show-reply","click",function(e){
          e.preventDefault();
          if(!Base.isLogin()){
            LoginValid.init("login-form",function(data){
              $(".login-mask").click();
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
          var reply_content=_btn.parent().siblings(".reply-content");
          var reply=reply_content.val();
          if(!reply){
            Base.showAlert("请填写回复内容","error");
            reply_content.focus();
            return;
          }
          _btn.attr("disabled","disabled").addClass("btn-disabled");

          var _param={"comment":reply,
            "from_uuid":$.cookie("uuid"),
            "to_commentId":_btn.attr("reply-id")};
          for(var k in queryParam){
            _param[k]=queryParam[k];
          }
          Base.queryData(config.reply,"POST",_param,function(data){
            if(Base.isSuccess(data)){
              Base.showAlert("回复成功");
              c.queryComment();
            }else{
              Base.showAlert(data.error_msg,"error");
            }
            reply_content.val("");
            _btn.removeAttr("disabled").removeClass("btn-disabled");
          },function(err){
            reply_content.val("");
            Base.showAlert(err);
            _btn.removeAttr("disabled").removeClass("btn-disabled");
          });        
        });
    };
    //查询评论
    c.queryComment=function(page){
        if(isPagination){
          if($(commentBox).find("li").length>0){
            $(commentBox).empty();
          }
        }
        var _page=page||1;
        pageParam="?offset="+length*(_page-1)+"&length="+length;
        Base.queryData(config.query+pageParam,"POST",queryParam,function(data){
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
            Base.showAlert(err);
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
        var answer_list=[];//回复
        for (var i=0; i<list_length; i++){
            temp_result=list[i];
            if(temp_result.to_commentId){
                answer_list.push(temp_result);
                continue;
            }
            addItemComment(temp_result);
        }
        for(var i=0;i<answer_list.length;i++){
          temp_result=answer_list[i];
          var $to_commentItem=$parentBox.find("#"+temp_result.to_commentId);
          $(addReplyItem(temp_result)).appendTo($to_commentItem.find(".comment-main"));
        }
        $parentBox.find(".mask-loading").fadeOut();
    };

    function addReplyItem(data){
      var commentItem="<div class='comment-item reply-item' id='"+data.commentId+"'>"+
        "<div class='quote-box-start'>"+
           "<span class='quote-icon front-quote inb'></span>"+
        "</div><div class='reply-content'>"+
        "<div class='user-icon'><img src='"+getCommentIcon(data)+"' onerror='userImgErr(this)' class='img-responsive'/></div>"+
        "<div class='comment-main'>"+
          "<div class='user-info'>"+
            "<span class='user-name'>"+getCommentName(data)+"</span>"+
            "<span class='floor'>0#</span>"+
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
        return "";
      }
    }
    function getCommentName(data){
      if("nickname" in data){
          return data.nickname;
      }else if("user" in data){
          return data.user.nickname;
      }else{
        return data.from_uuid;
      }
    }
    function addItemComment(data){
        var commentItem="<li class='comment-item' id='"+data.commentId+"'>"+
          "<div class='user-icon'><img src='"+getCommentIcon(data)+"' onerror='userImgErr(this)' class='img-responsive'/></div>"+
          "<div class='comment-main'>"+
            "<div class='user-info'>"+
              "<span class='user-name'>"+getCommentName(data)+"</span>"+
              "<span class='floor'>0#</span>"+
            "</div>"+
            "<div class='user-comment'>"+data.comment+"</div>"+
          "</div>"+
          "<div class='reply-box'>"+
             "<a class='btn-show-reply inb' role-id='"+data.commentId+"' href='javascript:void(0);'></a>"+
          "</div>"+
        "</li>";
        $(commentItem).appendTo($comments_list);
    }
    return c;
})(comment||{});