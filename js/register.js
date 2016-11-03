var RegisterValid=(function(){
  var _label=null;
  var _mobile=null;
  var _btn=null;
  var _errTips=null;
  var count=60;
  var offset=25;
  var errTipsLeft=0;
  var _code=null;
  var _pass=null;
  var _repass=null;
  var _agree=null;
  var validateEleArr=[];
  var validateType={
    "mobile":/^[1]\d{10}$/,
    "code":/^\d{6}$/,
    "pass":/^\w{6,16}$/
  };
  var vdlidateFun={
    "mobile":validateMobile,
    "pass":validatePass,
    "repass":validateRePass,
    "code":validateCode,
    "checkbox":validateAgree
  };
  var submitUrl="";
  function init(formId){
    var validate_form=$("#"+formId);
    if(validate_form.length<1){
      throw new error("初始化表单失败");
    }
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
      if(_type==="repass"){
        temp_input.on("blur",validateRePass);
      }
    }
    _btn=$(".wrapper #btn-send-code");
    _btn.on("click",function(){
      if(!_label){
        _label=$(this).siblings(".seconds-count");
      }
      sendCode();
    });
    $("#btn-register").on("click",function(e){
      e.preventDefault();
      if(validateForm()){//校验通过
        $(this).attr("disabled","disabled").addClass("disabled").val("注册中...");
        Base.excuteAjax(submitUrl,"POST",
          {"mobile":getMobileEle().val(),
           "verification_code":getCodeEle().val(),
           "source":"1"
          },function(data){
            console.log(data);
            if(Base.isSuccess(data)){
              window.location.href="./registerSuccess.html";
            }else{
              Base.showAlert(data.error_msg);
              enSubmitBtn();
            }
          },function(err){  
            Base.showAlert(err,"error");
            enSubmitBtn();
        });
      }else{
        return false;
      }
    });
  }
  function enSubmitBtn(){
    $("#btn-register").removeAttr("disabled","disabled").removeClass("disabled").val("注册");
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
    }else{
      if(eleType==="repass"){
        if(getPassEle().val()!==_ele.val()){
          errTips(_id,$(this).attr("role-err"));
          return false;
        }else{
          errTips(_id,null);
          return true; 
        }
      }
      if(eleType==="checkbox"){
        if(!_ele.is(":checked")){
          errTips(_id,$(this).attr("role-err"));
          return false;
        }else{
           errTips(_id,null);
           return true; 
        }
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
  function validateRePass(){
    var _repass=getRePassEle();
    var _id=_repass.attr("id");
    if(_repass.val()!==getPassEle().val()){
      errTips(_id,_repass.attr("role-err"));
      return false;
    }else{
      return errTipSuccess(_id);
    }
  }
  function validateCode(){
    var _code=getCodeEle();
    var _id=_code.attr("id");
    if(!_code.val().match(validateType.code)){
      return errTipsFail(_id,_code.attr("role-err"));
    }else{
      return errTipSuccess(_id);
    }
  }
  function validateAgree(){
    var _agree=getAgreeEle();
    var _id=_agree.attr("id");
    if(!_agree.is(":checked")){
      return errTipsFail(_id,_agree.attr("role-err"));
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
        if(validateEleArr[i].type==="checkbox"){
          validateResult=vFn.call(null);
        }else if(isEmpty(val_ele)){//判断非空
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
      _mobile=$("#mobile");
    }
    return _mobile;
  }
  function getCodeEle(){
    if(!_code){
      _code=$("#code");
    }
    return _code;
  }
  function getPassEle(){
    if(!_pass){
      _pass=$(".register-form #pass");
    }
    return _pass;
  }
  function getRePassEle(){
    if(!_repass){
      _repass=$(".register-form #repass");
    }
    return _repass;
  }
  function getAgreeEle(){
    if(!_agree){
      _agree=$(".register-form #agree");
    }
    return _agree;
  }
  function sendCode(){
    var mobile_val=getMobileEle().val();
    if(validateMobile(mobile_val)){
      _btn.attr("disabled","disabled").css("display","none");
      _label.css("display","block");
      setTimeout(changeSeconds,1000);
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
       _label.css("display","none");
       _btn.removeAttr("disabled").css("display","block");
    }
    _label.html(count+"秒");
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