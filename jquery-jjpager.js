(function($){
    $.fn.blPager = function(options) {
        var defaults = {
            url : '#',                      //页面请求url
            pageNo : 1,                     //当前页码
            pageSize : 10,                  //每页显示数量
            totalRecords : 0,               //总记录数
            async : false,                  //是否使用ajax
            contentContainerId : 'content', //ajax请求内容容器
            param : {},                     //请求参数
            autoLoadFirst : false,          //默认false
            success : null                  //异步请求成功的回调函数
        };
        var config = $.extend(defaults, options);
        config.pageNo = config.pageNo < 1 ? 1 : config.pageNo;
        config.pageSize = config.pageSize < 1 ? 10 : config.pageSize;
        config.totalRecords = config.totalRecords < 0 ? 0 : config.totalRecords;
        config.totalPage = config.totalRecords % config.pageSize == 0 ? config.totalRecords / config.pageSize : config.totalRecords / config.pageSize + 1;
        config.totalPage = Math.floor(config.totalPage);
        var c = this;
        function getUrl(pageNo){
            var url = config.url;
            var separator = '?';
            if (config.url.indexOf('?') > 0) {
                separator = '&';
            }
            url += separator + "pageNo=" + pageNo + "&pageSize=" + config.pageSize;
            if (config.async) {
                return 'javascript:;';
            } else {
                $.each(config.param, function(key, value) {
                    url += '&' + key + '=' + value;
                });
                return url;
            }
        }

        $.extend($.fn, {"setTotalRecords" : function(totalRecords){config.totalRecords = totalRecords;config.totalPage = config.totalRecords % config.pageSize == 0 ? config.totalRecords / config.pageSize : config.totalRecords / config.pageSize + 1;config.totalPage = Math.floor(config.totalPage);},
            setPageNo : function(pageNo){config.pageNo = pageNo; if (pageNo < config.totalPage) {config.pageNo = config.totalPage;} }});
        /**跳转到指定页码**/
        function go_page(){
            var pn = $.trim(c.find("input[class='ym']").val());
            config.pageNo = /[0-9]{1,4}/.test(pn) && pn > 0 && pn <= config.totalPage ? parseInt(pn) : config.pageNo;
            if (config.async) {
                init(c);
                ajaxLoadContent();
            } else {
                window.location.href = getUrl(config.pageNo);
            }
        }
        /**异步加载内容**/
        function ajaxLoadContent() {
            config.param = $.extend(config.param, {"pageNo":config.pageNo, "pageSize" : config.pageSize});
            $.post(config.url,config.param, function(data){
                if (config.success &&  typeof(config.success) == 'function') {
                    config.success(data);
                } else {
                    $('#' + config.contentContainerId).html(data);
                }
                if (data) {init(c);}
            });
        }

        /**初始化分页插件**/
        function init(container) {
            var link_prev = '', link_next = '';
            if (config.pageNo > 1) {
                link_prev = '<a href="' + getUrl(config.pageNo - 1) + '" name="_prev">上一页</a>';
            } else {
                link_prev = '<span class="disabled">上一页</span>';
            }


            if (config.pageNo < config.totalPage) {
                link_next = '<a href="' + getUrl(config.pageNo + 1) + '" name="_next">下一页</a>';
            } else {
                link_next = '<span class="disabled">下一页</span>';
            }

            var suffix_totalPage = '&nbsp;&nbsp;<span class="f12">共'+ config.totalPage +'页</span>';
            var suffix_goPage = '&nbsp;&nbsp;<span class="f12">到&nbsp;<input class="ym" maxlength="4" type="text" value="'+ config.pageNo +'" />&nbsp;' +
                '页&nbsp;<a href="javascript:;" name="go_page">确定</a>';
            var nullvalue = '<span>...</span>';
            var pageHtml = '';
            if (config.totalPage <= 6) {
                for (var i = 1; i <= config.totalPage; i++) {
                    if (config.pageNo == i) {
                        pageHtml += '<span class="curr">' + i + '</span>';
                    } else {
                        pageHtml += '<a href="' + getUrl(i) + '" page="' + i + '">' + i + '</a>';
                    }
                }
            } else {
                if (config.pageNo < 6) {
                    for (var i = 1; i < 6; i++) {
                        if (config.pageNo == i) {
                            pageHtml += '<span class="curr">' + i + '</span>';
                        } else {
                            pageHtml += '<a href="' + getUrl(i) + '" page="' + i + '">' + i + '</a>';
                        }
                    }
                    pageHtml += nullvalue + '<a href="' + getUrl(config.totalPage) + '" page="' + config.totalPage + '">' + config.totalPage + '</a>';
                } else {
                    var start = config.pageNo - 2, end = config.pageNo + 2;
                    if (end > config.totalPage) {
                        end = config.totalPage;
                        start = end - 4;
                        if (config.pageNo - start < 2) {
                            start = start - 1;
                        }
                    } else if (end + 1 == config.totalPage) {
                        end = config.totalPage;
                    }

                    pageHtml += '<a href="' + getUrl(1) + '" page="1">1</a>' + '<a href="' + getUrl(2) + '" page="2">2</a>' + nullvalue;

                    for (var i = start; i <= end; i++) {
                        if (config.pageNo == i) {
                            pageHtml += '<span class="curr">' + i + '</span>';
                        } else {
                            pageHtml += '<a href="' + getUrl(i) + '" page="' + i + '">' + i + '</a>';
                        }
                    }
                    if (end != config.totalPage) {
                        pageHtml += nullvalue;
                    }
                }
            }
            container.addClass("jjpager");
            //至少有一条数据才显示分页插件
            if (config.totalPage && config.totalPage > 0) {
               container.html(link_prev + pageHtml + link_next + suffix_totalPage + suffix_goPage);
            }
            if (config.async) {
                c.find("a[name!='go_page']").click(function () {
                    if ($(this).attr("page")) {
                        config.pageNo = parseInt($(this).attr("page"));
                    } else if ($.trim($(this).attr("name")) == "_prev") {
                        config.pageNo = config.pageNo - 1;
                    } else if ($.trim($(this).attr("name")) == "_next") {
                        config.pageNo = config.pageNo + 1;
                    } else {
                        config.pageNo = $.trim($(this).attr("page")) != "" ? parseInt($.trim($(this).attr("page"))) : config.pageNo;
                    }
                    ajaxLoadContent();

                });
                if (config.autoLoadFirst) {
                    config.autoLoadFirst = false;
                    ajaxLoadContent();
                }
            }
            c.find("a[name='go_page']").click(function(){
                go_page();
            });
            c.find("input[class='ym']").keydown(function(event){
                if (event.keyCode == 13) {
                    go_page();
                }
            });
        }
        init(this);
        return this;
    }
})(jQuery);
