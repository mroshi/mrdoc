MRDOC.Document = function() {
    var datagrid = $('#datagrid'),
        toolbar = $('.doc-toolbar'),
        container = $('.doc-container'),
        dialog = $('#doc_dialog'),
        form = $('#doc_dialog form'),
        docid = form.find('input[name="docid"]'),
        title = form.find('input[name="title"]'),
        keywords = form.find('input[name="keywords"]'),
        description = form.find('input[name="description"]'),
        saveBtn = $('#doc_save_btn');
    return {
        resize: function() {
            var windowH = $(window).height(),
                toolbarH = toolbar.height(),
                toolbarMT = parseInt(toolbar.css('margin-top')),
                toolbarMB = parseInt(toolbar.css('margin-bottom')),
                containerMT = parseInt(container.css('margin-top')),
                containerMB = parseInt(container.css('margin-bottom'));
            datagrid.datagrid('resize', {
                height: (windowH - toolbarH - toolbarMT - toolbarMB - containerMT - containerMB) + 'px'
            });
        },
        setPaginationText: function() {
            datagrid.datagrid('getPager').pagination({
                beforePageText: '页码',
                afterPageText: '共 {pages} 页',
                displayMsg: "第 {from} 到 {to} 条，共 {total} 条",
            });
        },
        saveDoc: function(isSubmit) {
            if (isSubmit && isSubmit == true) {
                if (!title.textbox('getValue')) {
                    MRDOC._function.error('名称不能为空！');
                    return;
                };
                $.ajax({
                    url: MRDOC.config.url.saveUrl,
                    type: 'post',
                    dataType: 'json',
                    data: {
                        title: title.textbox('getValue'),
                        keywords: keywords.textbox('getValue'),
                        description: description.textbox('getValue'),
                    },
                    success: function(data) {
                        if (data.success) {
                            MRDOC._function.success(data.success)
                            MRDOC.Document.closeDialog();
                            form.form('clear');
                            datagrid.datagrid('reload');
                        };
                        if (data.error) MRDOC._function.error(data.error);
                    },
                    error: function(a, b, c) {
                        MRDOC._function.error('添加文档失败！');
                    }
                });
            } else {
                dialog.dialog('open').dialog('center').dialog('setTitle', '添加文档');
                form.form('clear');
                saveBtn.attr('onclick', 'javascript:MRDOC.Document.saveDoc(true);');
            }
        },
        updateDoc: function(isSubmit) {
            if (isSubmit && isSubmit == true) {
                if (!docid.val()) {
                    MRDOC._function.error('未知ID！');
                    return;
                };
                if (!title.textbox('getValue')) {
                    MRDOC._function.warning('名称不能为空！');
                    return;
                };
                $.ajax({
                    url: MRDOC.config.url.updateUrl,
                    type: 'post',
                    dataType: 'json',
                    data: {
                        docid: docid.val(),
                        title: title.textbox('getValue'),
                        keywords: keywords.textbox('getValue'),
                        description: description.textbox('getValue'),
                    },
                    success: function(data) {
                        if (data.success) {
                            MRDOC._function.success(data.success)
                            MRDOC.Document.closeDialog();
                            form.form('clear');
                            datagrid.datagrid('reload');
                        };
                        if (data.error) MRDOC._function.error(data.error);
                    },
                    error: function(a, b, c) {
                        MRDOC._function.error('编辑文档失败！');
                    }
                });
            } else {
                var row = datagrid.datagrid('getSelected');
                if (!row) {
                    MRDOC._function.warning('未选中任何数据！');
                    return ;
                };
                dialog.dialog('open').dialog('center').dialog('setTitle', '编辑文档（ID:' + row.docid + '）');
                docid.val(row.docid);
                title.textbox('setValue', row.title);
                keywords.textbox('setValue', row.keywords);
                description.textbox('setValue', row.description);
                saveBtn.attr('onclick', 'javascript:MRDOC.Document.updateDoc(true);');
            }
        },
        destroyDoc: function() {
            var row = datagrid.datagrid('getSelected');
            if (!row) {
                MRDOC._function.warning('未选中任何数据！');
                return;
            };
            $.messager.confirm('ID:' + row.docid, '确定删除吗?', function(r) {
                if (r) {
                    $.ajax({
                        url: MRDOC.config.url.destroyUrl,
                        type: 'post',
                        dataType: 'json',
                        data: {
                            docid: row.docid
                        },
                        success: function(data) {
                            if (data.success) {
                                MRDOC._function.success(data.success);
                                datagrid.datagrid('reload');
                            };
                            if (data.error) MRDOC._function.error(data.error);
                        },
                        error: function(a, b, c) {
                            MRDOC._function.error('删除文档失败！');
                        }
                    });
                }
            });
        },
        closeDialog: function () {
            dialog.dialog('close');
            form.form('clear');
        },
        _init: function() {
            $(window).resize(function() {
                setTimeout(function() {
                    MRDOC.Document.resize();
                }, 50);
            });
            $(document).ready(function() {
                setTimeout(function() {
                    MRDOC.Document.resize();
                }, 50);
            });
            datagrid.datagrid({
                onLoadSuccess: function(data) {
                    MRDOC.Document.setPaginationText();
                },
                onDblClickRow: function(index, row) {
                    datagrid.datagrid('selectRow', index);
                    MRDOC.Document.updateDoc();
                }
            });
        },
    };
}();
MRDOC.Document._init();