var miaovr = angular.module("miaovr", ["RongWebIMWidget"]);

miaovr.controller("main", ["$scope","WebIMWidget",function($scope,
  WebIMWidget) {

  $scope.show = function() {
    if(!$scope.isCss){
      $("#rong-conversation").css("position","fixed");
      //$("#rong-conversation-list").css("position","fixed");
    }
    WebIMWidget.show();
  }

  $scope.hidden = function() {
    WebIMWidget.hidden();
  }

  $scope.server = WebIMWidget;
  $scope.targetId="";
  $scope.isInit=false;
  $scope.isCss=false;
  $scope.targetType=1;
  $scope.setconversation=function(){
    if(!$scope.targetId){
      $scope.targetId=$("#to_uuid").val();
    }
    WebIMWidget.setConversation(WebIMWidget.EnumConversationType.PRIVATE,$scope.targetId, "聊聊");
  }

  $scope.initChat=function(){
    WebIMWidget.init({
      appkey: "0vnjpoadnwlpz",
      token: $.cookie("IM_token"),
      displayConversationList:false,
      conversationListPosition:WebIMWidget.EnumConversationListPosition.right,
      style:{
          right:0,
          bottom:0
      },
      displayMinButton:false,
      onSuccess:function(id){
        $scope.isInit=true;
        $scope.show();
        console.log("uuid:"+id);//当前用户uuid
      },
      onError:function(error){
        $scope.isInit=true;
        console.log("error:"+error);
        for(var k in error){
          console.log(k+":"+error[k]);
        }
        Base.showAlert(error,"error");
      }
    });
  }
  $scope.onShow=function(){
     if($.cookie("IM_token")){
        if($scope.isInit){
          $scope.setconversation();
          $scope.show();
        }else{
          $scope.initChat();
        }
     }else{
        LoginValid.init("login-form",function(data){
          $(".login-mask").click();
          $scope.initChat();
        });
        Base.showLoginBox();
        $scope.hidden();
     }
  }
  WebIMWidget.setUserInfoProvider(function(targetId,obj){
    if(targetId===Base.getUUID()){
      obj.onSuccess({name:"我",userId:targetId,
        portraitUri:$("#main-navbar .header-user-icon").attr("src")});
    }else{
      obj.onSuccess({name:""+$(".aside-box .note-author").html(),userId:$scope.targetId,
        portraitUri:$("#thumbAvatar").attr("src")});
    }
  });
  WebIMWidget.onClose=function(){
    console.log("已关闭");
  }
}]);
