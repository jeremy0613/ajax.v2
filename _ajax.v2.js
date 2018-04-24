 /** 
 * _Ajax.v2.js
 * Ajax@
 * 
 * @author Jeremy Heminger <jheminger@tstwater.com> <contact@jeremyheminger.com>
 * @copyright   
 * @version 1.x
 * 
 * @binding jQuery
 * @deprecated false
 * */
class Ajax2 {
    /** 
     * @param {Object} $ must be jQuery
     * @param {String} path to the Ajax controller - default is /url/
     * @param {String} path to templates - default is /edibase/templates
     * @return {Void}
     * */
    constructor($,url,templates) {
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        this.url = (undefined === url ? '/get/' : url);
        this.templates = (undefined === templates ? '/edibase/templates/' : templates);

        setInterval(function() {
            Ajax.get('checkforupdates',{});
        },1000000);
    }
    /**
     * runs an ajax call and waits form promise finally running a callback
     * @param {String}
     * @param {Object}
     * @param {Function}
     * */
    get(method,data,callback) {
        let p = this.getData(method,data);
        this.dataResult(p,callback);
    }
    /**
     * gets the data from the server
     * @param {String}
     * @param {Object}
     * @returns {Object}
     * */
    getData(method,data) {
        let post = {
            data:data,
            cpage:currentPage
        };
        return $.ajax({
            url         :this.url+method,
            data        :post,
            type        :"post",
            dataType:   "json"
        });
    }
    /**
     * gets the result from the promise
     * @param {Object}
     * @param {Function}
     * */
    dataResult(p, callback) {
        p.success( function(data){
            /**
            * Whenever an Ajax event occurs this will check for a request from the server to update.
            * This will allow a remote update to the latest version.
            * */
            if(data.update == 1)
                $('#updatemessage').addClass('show');
            if(data.update == 2)
                window.location.reload();
            
            if(data.success == 1) {
                if (typeof callback === "function") {
                    callback(data.message);
                }
            } else {
                if (typeof data.errors !== 'undefined') {
                    var errors = "";
                    $.each(data.errors,function(k,v){
                        errors+=v+"\n";
                    });
                    alert("An error occured :: "+errors);
                }
            } 
        });
        p.error( function(xhr, ajaxOptions, thrownError){
            if(419 == xhr.status) {
                // this handles when the session has timed out
                window.location.reload();
            }else{
                var error_text = 'An Error occurred...';
                if ( typeof xhr !== 'undefined') {
                    console.log('xhr error :: '+xhr.status);
                }
                if ( typeof thrownError !== 'undefined') {
                    console.log('thrownError :: '+thrownError);
                }
                alert(error_text); 
            }
        });    
    }
    /** 
     * gets an HTML file from the server an creates a DOM object that can be manipulated and added to the document
     * @param {String} name the name of the file (without extension - expects *.html)
     * @param {Function}
     * * */
    getHTMLTemplate(name,callback) {
        // make the path
        name = this.templates+'/'+name+'.html';
        let p = $.ajax({url:name});
        p.success(function(data){
            var hooks = {};

            var nodes = $(data).filter(function(){ return $(this).is('.hook')});

            $(nodes).each(function(){
                hooks[$(this).attr("id")] = $(this);   
            });

            if (typeof callback === "function") {
                callback(hooks);
            }
        });
        p.error( function(xhr, ajaxOptions, thrownError){
            var error_text = 'An Error occurred...';
            if ( typeof xhr !== 'undefined') {
                console.log('xhr error :: '+xhr.status);
            }
            if ( typeof thrownError !== 'undefined') {
                console.log('thrownError :: '+thrownError);
            }
            alert(error_text);
        });
    }
}