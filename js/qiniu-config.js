function initUpload(){
    chooseFile=null;
    upImage=null;
    uploader1 = Qiniu.uploader({
    runtimes: 'html5,flash,html4',
    browse_button: 'pickfiles-image',
    container: "upload-image-c",
    max_file_size: '100mb',
    max_retries: 0,    
    flash_swf_url: 'http://jssdk.demo.qiniu.io/bower_components/plupload/js/Moxie.swf',
    dragdrop: true,
    chunk_size: '4mb',
    unique_names: false, 
    save_key: false,  
    multi_selection: false,
    domain:"vrnew",
    filters : {
        max_file_size : '100mb',
        prevent_duplicates: true,
        mime_types: [
            {title : "Image files", extensions : "jpg,jpeg,gif,png"} 
        ]
    },
    uptoken_func: function(file){
        var uploadToken="";
        $.ajax({
            url:"http://127.0.0.1:8080/miaovr/queryApi",
            type:"POST",
            async: false,
            data:{"description":$("#title-image").val(),
              "fromUuid":Base.getUUID(),
              "isVod":false,
              "method":"/news/upLoadToken"},
            dataType:"json",
            success:function(data){
                if(Base.isSuccess(data)){
                    uploadToken=data.result.uploadToken;
                }else{
                    Base.showAlert(data.error_msg,"error");
                }
            },
            error:function(err){
                Base.showAlert(err);
            }
        });
        return uploadToken;
    },
    get_new_uptoken: true,
    auto_start: false,
    log_level: 5,
    init: {
        'FilesAdded': function(up, files) {
            plupload.each(files, function(file) {
                chooseFile=file;
                upFile=up;
                showFileDisplay("upload-image-c",file);
            });
        },
        'BeforeUpload': function(up, file) {
            showUploadMask();
        },
        'UploadProgress': function(up, file) {
            console.log(file.percent + "%");
            setUploadProgress(file.percent);
        },
        'UploadComplete': function() {
            hideUploadMask();
            hideFileDisplay("upload-image-c");
            $("#title-image").val("");
            Base.setBtnEnabled("#btn-upload-image");
        },
        'FileUploaded': function(up, file, info) {
        },
        'Error': function(up, err, errTip) {
            console.log("-----image err-----");
            console.log(err);
            hideUploadMask();
            hideFileDisplay("upload-image-c");
            Base.showAlert(errTip,"error");
            Base.setBtnEnabled("#btn-upload-image");
        }
        }
    });

    uploader1.bind('FileUploaded', function() {
        Base.showAlert("文件上传成功");
    });

    var Q2 = new QiniuJsSDK();
    uploader2 = Q2.uploader({
    runtimes: 'html5,flash,html4',
    browse_button: 'pickfiles-video',
    container: "upload-video-c",
    max_file_size: '500mb',
    max_retries: 0,    
    flash_swf_url: 'http://jssdk.demo.qiniu.io/bower_components/plupload/js/Moxie.swf',
    dragdrop: true,
    chunk_size: '4mb',
    unique_names: false, 
    save_key: false,  
    multi_selection: false,
    domain:"vrnew",
    filters : {
        max_file_size : '500mb',
        prevent_duplicates: true,
        mime_types: [
            {title : "Video files", extensions : "flv,avi,wmv,mov,rmvb,mkv,video/mp4,mp4"}
        ]
    },
    uptoken_func: function(){
        var uploadToken="";
        $.ajax({
            url:"http://127.0.0.1:8080/miaovr/queryApi",
            type:"POST",
            async: false,
            data:{"description":$("#title-video").val(),
              "fromUuid":Base.getUUID(),
              "isVod":false,
              "method":"/news/upLoadToken"},
            dataType:"json",
            success:function(data){
                if(Base.isSuccess(data)){
                    uploadToken=data.result.uploadToken;
                }else{
                    Base.showAlert(data.error_msg,"error");
                }
            },
            error:function(err){
                Base.showAlert(err);
            }
        });
        return uploadToken;
    },
    get_new_uptoken: true,
    auto_start: false,
    log_level: 5,
    init: {
        'FilesAdded': function(up, files) {
                plupload.each(files, function(file) {
                chooseFile=file;
                upFile=up;
                showFileDisplay("upload-video-c",file);
            });
        },
        'BeforeUpload': function(up, file) {
            showUploadMask();
        },
        'UploadProgress': function(up, file) {
            setUploadProgress(file.percent);
        },
        'UploadComplete': function() {
            hideUploadMask();
            hideFileDisplay("upload-video-c");
            $("#title-video").val("");
            Base.setBtnEnabled("#btn-upload-video");
        },
        'FileUploaded': function(up, file, info) {
        },
        'Error': function(up, err, errTip) {
            hideUploadMask();
            console.log("-----video err-----");
            console.log(err);
            hideFileDisplay("upload-video-c");
            Base.showAlert(errTip,"error");
            Base.setBtnEnabled("#btn-upload-video");
        }
        }
    });

    uploader2.bind('FileUploaded', function() {
        Base.showAlert("文件上传成功");
    });
}
var $uploadMask=null;
function showUploadMask(){
    if(!$uploadMask){
        $uploadMask=$(".upload-mask");
    }
    $uploadMask.css("height",$(document).height()).fadeIn();
}
function hideUploadMask(){
    $uploadMask.fadeOut();
}
function hideFileDisplay(parentId){
    upFile.removeFile(chooseFile);
    chooseFile=null;
    $("#"+parentId+" #percent").val("0%");
    $("#"+parentId+" .file-display").fadeOut();
}
function showFileDisplay(parentId,file){
    var fileDis=$("#"+parentId).children(".file-display");
    fileDis.find(".file-name").html(file.name);
    fileDis.find(".file-type").html(file.type);
    fileDis.find(".file-size").html(file.size+"k");
    fileDis.fadeIn();
}
var $percentDisplay=null;
function setUploadProgress(percent){
    if(!$percentDisplay){
        $percentDisplay=$(".upload-mask #percent");
    }
    $percentDisplay.html(percent + "%");
}