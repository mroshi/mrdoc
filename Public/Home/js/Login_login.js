MRDOC.Login = function() {
    var win = $('#doc_window'),
        form = $('#doc_form'),
        brand = $('#doc_brand'),
        account = $('#doc_account'),
        password = $('#doc_passowrd'),
        verify = $('#doc_verify'),
        submit = $('#doc_submit'),
        mask = $('#doc_mask');
    return {
        setVerifyIcon: function() {
            verify.textbox('getIcon', 0).css('background', 'url(' + MRDOC.config.url.verifyIcon + '/' + new Date().getTime() + ')');
        },
        login: function() {
            var accountVal = account.textbox('getValue').trim(),
                passwordVal = password.textbox('getValue').trim(),
                verifyVal = verify.textbox('getValue').trim();
            if (!accountVal) {
                account.textbox('textbox').focus();
                MRDOC._function.warning('请输入帐号!');
                return;
            }
            if (!passwordVal) {
                password.textbox('textbox').focus();
                MRDOC._function.warning('请输入密码!');
                return;
            }
            if (!verifyVal) {
                verify.textbox('textbox').focus();
                MRDOC._function.warning('请输入验证码!');
                return;
            }

            submit.linkbutton('disable');
            $(submit).find('span span span').html('登录中 ...');

            $.ajax({
                url: MRDOC.config.url.login,
                type: 'post',
                dataType: 'json',
                data: {
                    account: accountVal,
                    password: passwordVal,
                    verify: verifyVal
                },
                success: function(data) {
                    if (data.success) window.location.href = data.success;
                    if (data.error) {
                        MRDOC._function.error(data.error);
                        submit.linkbutton('enable');
                        $(submit).find('span span span').html('登录');
                        MRDOC.Login.setVerifyIcon();
                    };
                },
                error: function(a, b, c) {
                    MRDOC._function.error('请求失败！');
                    submit.linkbutton('enable');
                    $(submit).find('span span span').html('登录');
                    MRDOC.Login.setVerifyIcon();
                }
            });
        },
        inputKeydownSubmit: function(e) {
            if (e.keyCode == 13) $(submit).click();
        },
        _init: function() {
            win.window({
                width: 440,
                height: 350,
                title: ' ',
                collapsible: false,
                minimizable: false,
                maximizable: false,
                closable: false,
                resizable: false,
                modal: true
            });
            account.textbox({
                iconCls: 'icon-man',
                iconWidth: 38
            });
            password.textbox({
                iconCls: 'icon-lock',
                iconWidth: 38
            });
            verify.textbox({
                iconCls: ' ',
                iconWidth: 150
            });

            verify.textbox('getIcon', 0).on('click', MRDOC.Login.setVerifyIcon);
            submit.linkbutton({
                onClick: MRDOC.Login.login
            });
            $(account.textbox('textbox')).on('keydown', MRDOC.Login.inputKeydownSubmit);
            $(password.textbox('textbox')).on('keydown', MRDOC.Login.inputKeydownSubmit);
            $(verify.textbox('textbox')).on('keydown', MRDOC.Login.inputKeydownSubmit);

            $(document).ready(function() {
                MRDOC.Login.setVerifyIcon();
                mask.fadeOut();
                account.textbox('textbox').focus();
            });
        }
    };
}();
MRDOC.Login._init();