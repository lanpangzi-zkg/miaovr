function initUpload(){
    uploader1 = Qiniu.uploader({
    runtimes: 'html5,flash,html4',
    browse_button: 'pickfiles-image',
    container: "upload-image-c",
    max_file_size: '1000mb',
    max_retries: 1,    
    flash_swf_url: 'http://jssdk.demo.qiniu.io/bower_components/plupload/js/Moxie.swf',
    dragdrop: true,
    chunk_size: '4mb',
    unique_names: false, 
    save_key: false,  
    multi_selection: !(mOxie.Env.OS.toLowerCase()==="ios"),
    domain:"vrnew",
    uptoken_func: function(file){
        var uploadToken="";
        $.ajax({
            url:"http://127.0.0.1:8080/miaovr/queryApi",
            type:"POST",
            async: false,
            data:{"description":$("#title-image").val(),
              "fromUuid":"90c67b08-2128-ecc6-62a4-4eda8d3d7411",
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
                var progress = new FileProgress(file, 'fsUploadProgress');
                progress.setStatus("等待...");
                progress.bindUploadCancel(up);
            });
        },
        'BeforeUpload': function(up, file) {
            var progress = new FileProgress(file, 'fsUploadProgress');
            var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
            if (up.runtime === 'html5' && chunk_size) {
                progress.setChunkProgess(chunk_size);
            }
        },
        'UploadProgress': function(up, file) {
            var progress = new FileProgress(file, 'fsUploadProgress');
            var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
            progress.setProgress(file.percent + "%", file.speed, chunk_size);
        },
        'UploadComplete': function() {
            console.log("upload complete");
            Base.setBtnEnabled("#btn-upload-image");
        },
        'FileUploaded': function(up, file, info) {
            var progress = new FileProgress(file, 'fsUploadProgress');
            progress.setComplete(up, info);
        },
        'Error': function(up, err, errTip) {
            var progress = new FileProgress(err.file, 'fsUploadProgress');
            progress.setError();
            progress.setStatus(errTip);
            Base.setBtnEnabled("#btn-upload-image");
        }
        }
    });

    uploader1.bind('FileUploaded', function() {
        console.log('hello man,a file is uploaded');
    });

    var Q2 = new QiniuJsSDK();
    uploader2 = Q2.uploader({
    runtimes: 'html5,flash,html4',
    browse_button: 'pickfiles-video',
    container: "upload-video-c",
    max_file_size: '1000mb',
    max_retries: 1,    
    flash_swf_url: 'http://jssdk.demo.qiniu.io/bower_components/plupload/js/Moxie.swf',
    dragdrop: true,
    chunk_size: '4mb',
    unique_names: false, 
    save_key: false,  
    multi_selection: !(mOxie.Env.OS.toLowerCase()==="ios"),
    domain:"vrnew",
    uptoken_func: function(){
        var uploadToken="";
        $.ajax({
            url:"http://127.0.0.1:8080/miaovr/queryApi",
            type:"POST",
            async: false,
            data:{"description":$("#title-video").val(),
              "fromUuid":"90c67b08-2128-ecc6-62a4-4eda8d3d7411",
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
                var progress = new FileProgress(file, 'fsUploadProgress');
                progress.setStatus("等待...");
                progress.bindUploadCancel(up);
            });
        },
        'BeforeUpload': function(up, file) {
            var progress = new FileProgress(file, 'fsUploadProgress');
            var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
            if (up.runtime === 'html5' && chunk_size) {
                progress.setChunkProgess(chunk_size);
            }
        },
        'UploadProgress': function(up, file) {
            var progress = new FileProgress(file, 'fsUploadProgress');
            var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
            progress.setProgress(file.percent + "%", file.speed, chunk_size);
        },
        'UploadComplete': function() {
            console.log("video upload success");
            Base.setBtnEnabled("#btn-upload-video");
        },
        'FileUploaded': function(up, file, info) {
            var progress = new FileProgress(file, 'fsUploadProgress');
            progress.setComplete(up, info);
        },
        'Error': function(up, err, errTip) {
            var progress = new FileProgress(err.file, 'fsUploadProgress');
            progress.setError();
            progress.setStatus(errTip);
            Base.setBtnEnabled("#btn-upload-video");
        }
        }
    });

    uploader2.bind('FileUploaded', function() {
        console.log('hello man,a file is uploaded');
    });
}
