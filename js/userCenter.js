$(document).ready(function(){
  if(!Base.isLogin()){
    window.location.href="./login.html";
    return;
  }
  Base.initHeaderUser();
  var access_token=$.cookie("access_token");
  Base.excuteAjax("/v1/account_information.php?access_token="+access_token,null,null,function(data){
    console.log(data);
    if(Base.isSuccess(data)){
      $("#w").fadeOut();
      $("#access_token").val(data.access_token);
      $("#nickname").html(data.nickname);
      $("#cur-nickname").html(data.nickname);
      $("#thumb_avatar").attr("src",data.thumb_avatar);
      $("#upload_avatar").attr("src",data.thumb_avatar);
    }else{
      Base.showAlert(data.error_msg,"error");
    }
  },function(err){
    Base.showAlert(err);
  });
  genderManage.init();
  $(".tabs li").on("click",function(){
      $(this).addClass("choose").siblings().removeClass("choose");
      var tab_id=$(this).attr("role-page");
      $("#"+tab_id).addClass("active-page").siblings().removeClass("active-page");
  });
  $(".aside-menu .menu").on("click",function(){
      var _this=$(this);
      var _id=_this.attr("role-page");
      _this.addClass("cur").siblings().removeClass("cur");
      $("#"+_id).addClass("cur").siblings().removeClass("cur");
      if(_id==="aside-page-3"&&!_this.attr("role-query")){
        Base.excuteAjax("/v1/mmcoin_count.php","POST",null,function(data){
          if(Base.isSuccess(data)){
            $("#user-score").html(data.coin_count);
            _this.attr("role-query","ok");
            $("#score-page-1").children(".mask-loading").fadeOut();
          }
        },function(err){  
          console.log(err);
          $("#score-page-1").children(".mask-loading").fadeOut();
        });
      }else if(_id==="aside-page-2"&&!_this.attr("role-query")){
          initMessage();
          _this.attr("role-query","ok");
      }else{
        return;
      }
  });

  $("#edit-nickname-b").on("click",function(){
    $(".tabs li").eq(3).click();
  });
  new UserForm().init("form-edit-nickname",function(data){
    if(Base.isSuccess(data)){
      $("#nickname").html(data.nickname);
      $("#cur-nickname").html(data.nickname);
      $.cookie("nickname",data.nickname);
      $("#new-nickname").val("");
      $("#aside-page-1>.tabs>li").eq(0).click();
      Base.showAlert("修改成功");
    }
  });
  new UserForm().init("form-change-pass");
  new UserForm().init("form-edit-phone");
  mobileCode.init();
});
var genderManage=(function(){
  var sexRadios=null;
  var curSex="";
  var chooseSex="";
  var userSexLabel="";
  var sexCollection={
    "1":"男",
    "2":"女"
  }
  function init(){
    curSex=$.cookie("gender");
    getUserSexLabel().html(sexCollection[curSex]);
    sexRadios=$("input:radio[name='sex']");
    //修改
    $("#edit-sex-b").on("click",function(){
      $(this).siblings(".radio-group").addClass("inb");
      $(this).removeClass("inb").css("display","none");
      if(curSex==="1"){
        $(sexRadios[0]).attr("checked","checked");
      }else{
        $(sexRadios[1]).attr("checked","checked");        
      }
    });
    //保存性别修改
    $(".btn-edit-sex").on("click",function(){
      $(this).parent().siblings("#edit-sex-b").addClass("inb");
      $(this).parent().removeClass("inb").css("display","none");
      var val=$("input:radio[name='sex']:checked").val();
      if(val==="男"){
        chooseSex="1";
      }else{
        chooseSex="2";
      }
      if(curSex==chooseSex){
        return;
      }else{
        Base.excuteAjax("/v1/account_gender.php","POST",
          {"gender":chooseSex},function(data){
            if(Base.isSuccess(data)){
              curSex=data.gender;
              $.cookie("gender",curSex);
              getUserSexLabel().html(sexCollection[curSex]);
              Base.showAlert("修改成功");
            }else{
              Base.showAlert(data.error_msg,"error");
            }
          },function(err){  
            Base.showAlert(err,"error");
        });
      }
    });
    $(".btn-cancel-sex").on("click",function(){
      $(this).parent().siblings("#edit-sex-b").addClass("inb");
      $(this).parent().removeClass("inb").css("display","none");
    });
  }
  function getUserSexLabel(){
    if(!userSexLabel){
      userSexLabel=$("#user-sex");
    }
    return userSexLabel;
  }
  return{
    init:init
  }
})();

function UserForm(){
  this.submitUrl="";
  this.validateEleArr=[];
  this.successCallBack=null;
  this.failCallBack=null;
  this.init=function(formId,pSuccessCallBack,pFailCallBack){
    var form=$("#"+formId);
    if(form.length<1){
      throw new error("初始化表单失败:"+formId);
    }
    this.successCallBack=pSuccessCallBack;
    this.failCallBack=pFailCallBack;
    this.submitUrl=form.attr("action");
    var inputs=form.find("input");
    var temp_input=null;
    for(var i=0,j=inputs.length;i<j;i++){
      temp_input=$(inputs[i]);
      var _type=temp_input.attr("role-type");
      if(_type&&"submit"!==_type){
        this.validateEleArr.push({"ele":temp_input,"type":_type});
      }
      if(_type in validateType){
        temp_input.on("change",validateElement);
      }
      if(_type==="repass"){
        temp_input.on("blur",validateElement);
      }
      if(_type==="submit"){
        temp_input.on("click",validateFun.submit.bind(this));
      }
    }
  }
}
var validateType={
  "mobile":/^[1]\d{10}$/,
  "code":/^\d{6}$/,
  "pass":/^\w{6,16}$/,
  "nickname":/^[\u4e00-\u9fa5-A-Za-z0-9]+$/
};
var validateFun={
  "mobile":validateElement,
  "pass":validateElement,
  "repass":validateElement,
  "code":validateElement,
  "nickname":validateElement,
  "submit":validateForm
};
var errTipsLeft=0;
var _errTips=null;
var offset=25;
function validateElement(){
  var _ele=$(this);
  var _ele_val=_ele.val();
  var _eleType=_ele.attr("role-type");
  var _id=_ele.attr("id");
  if(_eleType in validateType){
    if(isEmpty(_ele_val)){
      return errTipsFail(_id,_ele.attr("role-null"));
    }else if(!_ele_val.match(validateType[_eleType])){
      return errTipsFail(_id,_ele.attr("role-err"));
    }else{
      return errTipSuccess(_id);
    }
  }else if(_eleType==="repass"){
    var password_id=_ele.attr("role-repeat");
    if(isEmpty(_ele_val)){
      return errTipsFail(_id,_ele.attr("role-null"));
    }else if($("#"+password_id).val()!==_ele_val){
      return errTipsFail(_id,_ele.attr("role-err"));
    }else{
      return errTipSuccess(_id);
    }
  }
}
function validateForm(e){
  e.preventDefault();
  var validateEleArr=this.validateEleArr;
  var successCallBack=this.successCallBack;
  var failCallBack=this.failCallBack;
  var submitUrl=this.submitUrl;
  var temp_ele=null;
  var validateResult=true;
  var vFn=null;
  var dataObj={};
  for(var i=0,j=validateEleArr.length;i<j;i++){
    temp_ele=validateEleArr[i].ele;
    vFn=validateFun[validateEleArr[i].type];//验证函数
    if(typeof vFn==="function"){
      validateResult=vFn.call(temp_ele);
      if(validateResult){
        dataObj[temp_ele.attr("name")]=temp_ele.val();
      }
    }
    if(!validateResult){
      i=j;
    }
  }
  if(validateResult){//校验通过
    var _btn=$(this);
    dataObj.access_token=$.cookie("access_token");
    _btn.attr("disabled","disabled").addClass("disabled").val(_btn.attr("role-load"));
    Base.excuteAjax(submitUrl,"POST",dataObj,function(data){
        if(typeof successCallBack=="function"){
          successCallBack(data);
        }else{
          Base.showAlert("修改成功");
        }
        enSubmitBtn(_btn);
      },function(err){  
        if(typeof failCallBack=="function"){
          failCallBack(data);
        }else{
          alert(err);
          Base.showAlert(err,"error");
        }
        enSubmitBtn(_btn);
    });
  }
}
function errTipSuccess(id){
  errTips(id,null);
  return true;
}
function errTipsFail(id,msg){
  errTips(id,msg);
  return false;
}
function enSubmitBtn(btn){
  btn.removeAttr("disabled","disabled").removeClass("disabled").val(btn.attr("role-nor"));
}
function isEmpty(s){
  if(!s){
    return true;
  }else{
    return false;
  }
}
function hideErrTips(){
  _errTips.animate({"left":errTipsLeft+offset,"opacity":0},"normal");
}
function errTips(id,msg){
  var _target=$("#"+id);
  if(_target.length>0){
    if(msg){
      if(!_errTips){
        _errTips=$("<div class='err-tips'></div>");
        _errTips.appendTo($("body"));
      }
      _target.addClass("err-tip");
      _target.focus();
      _errTips.html(msg);
      errTipsLeft=_target.offset().left+_target.width()+(offset<<1);
      _errTips.css({
        "left":errTipsLeft,
        "top":_target.offset().top-_errTips.height()/2});
      if(_errTips.is(":animated")){
        _errTips.stop();
      }
      _errTips.animate({"left":errTipsLeft-offset,"opacity":1},"normal",function(){
        setTimeout(hideErrTips,2000);
      });
    }else{
      _target.removeClass("err-tip");          
    }
  }else{
    return false;
  }
}
var mobileCode=(function(){
  var mobile=null
  var btn_send_code=null;
  var seconds_label=null;
  var count=60;
  function sendCode(){
    var mobile_val=mobile.val();
    if(mobile_val.match(validateType.mobile)){
      btn_send_code.attr("disabled","disabled").css("display","none");
      seconds_label.addClass("inb");
      setTimeout(changeSeconds,1000);
      return;
      Base.excuteAjax("/v1/mobile_verification_send.php","POST",{"mobile":mobile_val},null,function(err){  
          console.log("sendCode err:"+err);
      });
    }else{
      errTips("mobile","请检查手机号码格式");
    }
  }
  function changeSeconds(){
    count--;
    if(count>0){
      setTimeout(arguments.callee,1000);
    }else{
      count=60;
       seconds_label.removeClass("inb");
       btn_send_code.removeAttr("disabled").css("display","block");
    }
    seconds_label.html(count+"秒");
  }
  function init(){
    mobile=$("#mobile");
    btn_send_code=$("#btn-send-code");
    seconds_label=$("#seconds-count");
    btn_send_code.on("click",function(){
      sendCode();
    });
  }
  return{
    init:init
  }
})();

function showAlertTip(msg){
  var alertArr=[];
  var alertBox=null;
  function addAlert(msg,type){
    var alert=$("<div class='alert-item'>"+msg+"</div>");
    if(!alertBox){
      $("<div id='alert-box'></div>").appendTo($("body"));
      alertBox=$("#alert-box");
    }
    alert.appendTo(alertBox);
    alertArr.push(alert);
  }
  function deleteAlert(){

  }
}