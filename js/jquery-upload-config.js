$(function () {
    var uploadData=null;
    $("#btn-upload").on("click",function(){
        if(uploadData&&uploadData.files.length>0){
           console.log(uploadData);
           console.log("uploading...");
           $(this).text("上传中...").attr("disabled","disabled");
           getProgress().css("display","block");
           $addFileBox.children("input").removeClass("inb");
           uploadData.submit();
        }
    });
    $("#btn-delete").on("click",function(){
        if(uploadData&&uploadData.files.length>0){
           uploadData.files.splice(0,1);
           clearUpload();
        }
    });
    $addFileBox=null;
    $progress=null;
     $('#fileupload').fileupload({
        dataType: 'json',
        maxFileSize: 99900,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        progressall: function (e, data) {
            var _progress = parseInt(data.loaded / data.total * 100, 10);
            $progress.css(
                'width',
                _progress + '%'
            );
        },
        add: function (e, data) {
            uploadData=data;
            var addFiles=data.files;
            if(addFiles.length>0){
                file=addFiles[0];
                if(!$addFileBox){
                    $addFileBox=$("#add-file");
                }
                $addFileBox.css("display","block");
                $addFileBox.children("input").addClass("inb");
                $addFileBox.children(".file-name").html(file.name);
                $addFileBox.children(".file-size").html(Math.ceil(file.size/1024)+"KB");
                $addFileBox.children(".file-type").html(file.type);
            }
        },
        done: function (e, data) {
            var _result=data.result;
            if(_result.status=="1"&&_result.error_code=="0"){
                Base.showAlert("上传成功");
                $("#thumb_avatar").attr("src",_result.thumb_avatar);
                $("#upload_avatar").attr("src",_result.avatar);
                $("#main-navbar .header-user-icon").attr("src",_result.thumb_avatar);
            }else{
                Base.showAlert(_result.error_msg||"上传错误,请重新选择文件","error");
            }
            console.log(e);
            console.log(data);
            clearUpload();
        }
    });
    function getProgress(){
        if(!$progress){
           $progress= $(".file-upload-progress");
        }
        return $progress;
    }
    function clearUpload(){
        $addFileBox.css("display","none");
        getProgress().css({"display":"none","width":"0%"});
        $addFileBox.children(".file-name").html("");
        $addFileBox.children(".file-size").html("");
        $addFileBox.children(".file-type").html("");
        $addFileBox.children("#btn-delete").text("上传").removeAttr("disabled");
    }
});