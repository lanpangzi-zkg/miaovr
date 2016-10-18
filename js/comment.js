var comment=(function(c){
    var config={};
    var $comments_list=null;
    var $comment_body=null;
    var nameId="";
    var textArea="";
    var commentBox="";
    c.init=function(config_params){
        config=config_params;
        nameId=config.nameId;
        textArea=config.textArea||".commment-body";
        commentBox=config.commentBox||"#c-comment-box";
        //发布评论
        $(".btn-publish").on("click",function(e){
          e.preventDefault();
          var btn=$(this);
          var comment=$(".commment-body").val();
          if(!comment){
             Base.showAlert("请输入点评内容","error");
             $(""+textArea).focus();
             return;
          }
          btn.attr("disabled","disabled").addClass("btn-disabled");
          Base.queryData(config.publish,"POST",
            {"comment":comment,
            "from_uuid":"bb90efc3-27c4-240c-b5ba-4561e3faf3e2",
             "forumId":config.id},function(data){
            console.log("提交评论");
            console.log(data);
            if(Base.isSuccess(data)){
              Base.showAlert("点评成功");
              c.queryComment();
            }else{
              Base.showAlert(data.error_msg,"error");
            }
            btn.removeAttr("disabled").removeClass("btn-disabled");
          },function(err){
            Base.showAlert(err);
            btn.removeAttr("disabled").removeClass("btn-disabled");
          });
        });
        $comments_list=$(".comments-list");
        //显示与隐藏回复输入框
        $comments_list.delegate(".btn-show-reply","click",function(){
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
          var paramObj={"comment":reply,
            "from_uuid":"bb90efc3-27c4-240c-b5ba-4561e3faf3e2",
            "to_commentId":_btn.attr("reply-id"),
            nameId:config.id};

          Base.queryData(config.reply,"POST",paramObj,function(data){
            if(Base.isSuccess(data)){
              Base.showAlert("回复成功");
              //addReplyComment(paramObj);
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
    c.queryComment=function(){
        if($(commentBox).find("li").length>0){
          $(commentBox).empty();
        }
        Base.queryData(config.query,"POST",{"forumId":config.id},function(data){
            console.log("查询评论信息");
            console.log(data);
            if(Base.isSuccess(data)){
              if(data.list_result.length<1){
                  $comments_list.find(".mask-loading").fadeOut();
              }else{
                handleCommentItem(data);                
              }
            }else{
              Base.showAlert(data.error_msg,"error");
            }
          },function(err){
            Base.showAlert(err);
        });
    };
    function handleCommentItem(data){
        var $parentBox=$(".comments-box");
        $parentBox.find("img").on("error",function(){
          var _this=$(this);
          _this.attr("src",_this.attr("role-err"));
          _this.off("error");
        });
        var temp_result=null;
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
            addItemComment(temp_result);
        }
        $parentBox.find(".mask-loading").fadeOut();
    }
    function replyMainModule(commentId){
      return "<div class='reply-main'>"
          +"<textarea class='reply-content'></textarea>"
          +"<div class='btn-reply-group'>"
            +"<input type='button' value='提交' class='btn-reply' reply-id='"+commentId+"'>"
          +"</div>"
        +"</div>";
    }
    function addItemComment(data){
        var commentItem="<li class='comment-item'>"+
          "<div class='user-icon'></div>"+
          "<div class='comment-main'>"+
            "<div class='user-info'>"+
              "<span class='user-name'>"+data.from_uuid+"</span>"+
              "<span class='floor'>0#</span>"+
            "</div>"+
            "<div class='user-comment'>"+data.comment+"</div>"+
          "</div>"+
          "<div class='reply-box'>"+
             "<input type='button' class='btn-show-reply btn' role-id='"+data.commentId+"' value='回复'/>"+
          "</div>"+
        "</li>";
        $(commentItem).appendTo($comments_list);
    }
    return c;
})(comment||{});