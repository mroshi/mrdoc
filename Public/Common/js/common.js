window.MRDOC = window.MRDOC || {};
MRDOC._function = function() {
    return {
        error: function(msg) {
            $.messager.show({
                title: '<b style="color:red;">错误</b>',
                msg: msg,
                timeout: 0,
                showType: 'slide'
            });
        },
        success: function(msg) {
            $.messager.show({
                title: '<b style="color:#4cae4c;">成功</b>',
                msg: msg,
                timeout: 2000,
                showType: 'slide'
            });
        },
        warning: function(msg) {
            $.messager.show({
                title: '<b style="color:#f0ad4e;">警告</b>',
                msg: msg,
                timeout: 3000,
                showType: 'slide'
            });
        },
        message: function(msg) {
            $.messager.show({
                title: '<b style="color:#31b0d5;">消息</b>',
                msg: msg,
                timeout: 2000,
                showType: 'slide'
            });
        }
    };
}();