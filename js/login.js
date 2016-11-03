var LoginValid=(function(){
  var _mobile=null;
  var _pass=null;
  var _errTips=null;
  var count=60;
  var offset=25;
  var errTipsLeft=0;
  var validateEleArr=[];
  var validateType={
    "mobile":/^[1]\d{10}$/,
    "pass":/^\w{6,16}$/
  };
  var vdlidateFun={
    "mobile":validateMobile,
    "pass":validatePass
  };
  var submitUrl="";
  var loginSuccessCallBack=null;
  function init(formId,callBack){
    var validate_form=$("#"+formId);
    if(validate_form.length<1){
      throw "初始化表单失败";
    }
    loginSuccessCallBack=callBack;
    submitUrl=validate_form.attr("action");
    var inputs=validate_form.find("input");
    var temp_input=null;
    for(var i=0,j=inputs.length;i<j;i++){
      temp_input=$(inputs[i]);
      var _type=temp_input.attr("role-type");
      if(_type){
        validateEleArr.push({"ele":temp_input,"type":_type});
      }
      if(_type in validateType){
        temp_input.on("change",validateElement);
      }
    }
    $("#btn-login").on("click",function(e){
      e.preventDefault();
      e.stopPropagation();
      if(validateForm()){//校验通过
        $(this).attr("disabled","disabled").addClass("disabled").val("登录中...");
        Base.excuteAjax(submitUrl,"POST",
          {"account":getMobileEle().val(),
           "password":getPassEle().val(),
           "source":"1"
          },function(data){
            console.log(data);
            enSubmitBtn();
            if(!Base.isSuccess(data)){
              Base.showAlert(data.error_msg,"error");
            }else{
              $.cookie("access_token",data.access_token);
              $.cookie("uuid",data.uuid);
              Base.setUUID(data.uuid);
              $.cookie("IM_token",data.IM_token);
              if(typeof loginSuccessCallBack=="function"){
                $("#main-navbar .header-login").css("display","none");
                var userStatus=$("#main-navbar .user-status");
                userStatus.css("display","inherit");
                userStatus.find(".header-user-name").html(data.nickname);
                userStatus.find("img").attr("src",data.avatar);
                loginSuccessCallBack(data);
              }else{
                if($("#remember").is(":checked")){
                  $.cookie("uname", getMobileEle().val());
                }
                window.location.href="./userCenter.html";
              }
            }
          },function(err){  
            Base.showAlert("登录失败:"+err,"error");
            enSubmitBtn();
        });
      }else{
        return false;
      }
    });
  }
  function enSubmitBtn(){
    $("#btn-login").removeAttr("disabled","disabled").removeClass("disabled").val("登录");
  }
  function validateElement(){
    var _ele=$(this);
    var eleType=_ele.attr("role-type");
    if(eleType in validateType){
      var _id=_ele.attr("id");
      if(!_ele.val().match(validateType[eleType])){
        errTips(_id,$(this).attr("role-err"));
        return false;
      }else{
        errTips(_id,null);
        return true;
      }
    }
  }
  function validateMobile(){
    var _mobile=getMobileEle();
    var _id=_mobile.attr("id");
    if(!_mobile.val().match(validateType.mobile)){
      return errTipsFail(_id,_mobile.attr("role-err"));
    }else{
      return errTipSuccess(_id);
    }
  }
  function validatePass(){
    var _pass=getPassEle();
    var _id=_pass.attr("id");
    if(!_pass.val().match(validateType.pass)){
      return errTipsFail(_id,_pass.attr("role-err"));
    }else{
      return errTipSuccess(_id);
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
  function validateForm(){
    var temp_ele=null;
    var val_ele=null;
    var validateResult=true;
    var vFn=null;
    for(var i=0,j=validateEleArr.length;i<j;i++){
      temp_ele=validateEleArr[i].ele;
      vFn=vdlidateFun[validateEleArr[i].type];//验证函数
      if(typeof vFn==="function"){
        val_ele=temp_ele.val();
        if(isEmpty(val_ele)){//判断非空
          errTips(temp_ele.attr("id"),temp_ele.attr("role-null"));
          validateResult=false;
        }else{
          validateResult=vFn.call(null);
        }
      }
      if(!validateResult){
          i=j;
      }
    }
    return validateResult;
  }
  function isEmpty(s){
    if(!s){
      return true;
    }else{
      return false;
    }
  }
  function getMobileEle(){
    if(!_mobile){
      _mobile=$("#uname");
    }
    return _mobile;
  }
  function getPassEle(){
    if(!_pass){
      _pass=$("#pass");
    }
    return _pass;
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
      return;
    }
  }
  return {
    init:init
  };
})();