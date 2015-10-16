MRDOC.Tree = function() {
    var tree = $('#doc_tree .easyui-tree');
    return {
        getSelected: function() {
            return tree.tree('getSelected');
        },
        before: function() {
            var node = MRDOC.Tree.getSelected();
            if (!node) {
                MRDOC.function.error('无法获取选中的目录！<br/>Error: MRDOC.Tree.before');
                return;
            };
            var prev = tree.tree('getNode', $(node.target).parent().prev().find('div.tree-node'));
            var id = -(new Date().getTime());
            tree.tree('insert', {
                before: node.target,
                data: {
                    id: id,
                    pid: node.pid,
                    previd: (prev ? prev.id : '0'),
                    text: "新建目录",
                    docid: node.docid
                }
            });
            tree.tree('beginEdit', tree.tree('find', id).target);
        },
        after: function() {
            var node = MRDOC.Tree.getSelected();
            var id = -(new Date().getTime());
            if (!node) {
                MRDOC.function.error('无法获取选中的目录！<br/>Error: MRDOC.Tree.after');
                return;
            };
            tree.tree('insert', {
                after: node.target,
                data: {
                    id: id,
                    pid: node.pid,
                    previd: node.id,
                    text: "新建目录",
                    docid: node.docid
                }
            });
            tree.tree('beginEdit', tree.tree('find', id).target);
        },
        append: function() {
            var node = MRDOC.Tree.getSelected();
            if (!node) {
                MRDOC.function.error('无法获取选中的目录！<br/>Error: MRDOC.Tree.append');
                return;
            };
            var prev = tree.tree('getNode', $(node.target).next().children().last().find('div.tree-node'));
            var id = -(new Date().getTime());
            tree.tree('append', {
                parent: node.target,
                data: {
                    id: id,
                    pid: node.id,
                    previd: (prev ? prev.id : '0'),
                    text: "新建目录",
                    docid: node.docid
                }
            });
            tree.tree('beginEdit', tree.tree('find', id).target);
        },
        add: function(node) {
            $.ajax({
                url: MRDOC.config.url.addDir,
                type: 'post',
                dataType: 'json',
                data: {
                    pid: node.pid,
                    previd: node.previd,
                    text: node.text,
                    docid: node.docid,
                },
                success: function(data) {
                    if (data.success) {
                        var newData = data.success;
                        tree.tree('update', {
                            target: node.target,
                            id: newData.dirid,
                            dirid: newData.dirid,
                            pid: newData.pid,
                            lv: newData.lv,
                            sort: newData.sort,
                            text: newData.text,
                            docid: newData.docid,
                        });
                    };
                    if (data.error) {
                        MRDOC.function.error(data.error + '<br/>Error: MRDOC.Tree.add');
                    };
                },
                error: function(a, b, c) {
                    MRDOC.function.error('添加目录失败！<br/>Error: MRDOC.Tree.add');
                    tree.tree('remove', node.target);
                }
            });
        },
        remove: function() {
            var node = MRDOC.Tree.getSelected();
            if (!node) {
                MRDOC.function.error('无法获取选中的目录！<br/>Error: MRDOC.Tree.remove');
                return;
            };
            $.messager.confirm(' ', 'Remove "' + node.text + '"?', function(r) {
                if (r && r == true) {
                    $.ajax({
                        url: MRDOC.config.url.removeDir,
                        type: 'post',
                        dataType: 'json',
                        data: {
                            dirid: node.id
                        },
                        success: function(data) {
                            if (data.success) {
                                tree.tree('remove', node.target)
                            };
                            if (data.error) {
                                MRDOC.function.error(data.error + '<br/>Error: MRDOC.Tree.remove');
                            };
                        },
                        error: function(a, b, c) {
                            MRDOC.function.error('删除目录失败！<br/>Error: MRDOC.Tree.remove');
                        }
                    });
                }
            });
        },
        rename: function() {
            var node = MRDOC.Tree.getSelected();
            if (!node) {
                MRDOC.function.error('无法获取选中的目录！<br/>Error: MRDOC.Tree.rename');
                return;
            };
            tree.tree('beginEdit', node.target);
        },
        renameDir: function(node) {
            $.ajax({
                url: MRDOC.config.url.renameDir,
                type: 'post',
                dataType: 'json',
                data: {
                    dirid: node.dirid,
                    text: node.text,
                },
                success: function(data) {
                    if (data.error) {
                        MRDOC.function.error(data.error + '<br/>Error: MRDOC.Tree.renameDir');
                    };
                },
                error: function(a, b, c) {
                    MRDOC.function.error('重命名失败！<br/>Error: MRDOC.Tree.renameDir');
                }
            });
        },
        expandAll: function() {
            tree.tree('expandAll');
        },
        collapseAll: function() {
            tree.tree('collapseAll');
        },
        dropDir: function(target, source, point) {
            var deny = true;
            $.ajax({
                url: MRDOC.config.url.dropDir,
                async: false,
                type: 'post',
                dataType: 'json',
                data: {
                    targetid: tree.tree('getNode', target).dirid,
                    sourceid: source.dirid,
                    point: point,
                },
                success: function(data) {
                    if (data.success) {
                        var newData = data.success;
                        tree.tree('update', {
                            target: source.target,
                            pid: newData.pid,
                            lv: newData.lv,
                            sort: newData.sort,
                        });
                    };
                    if (data.error) {
                        MRDOC.function.error(data.error + '<br/>Error: MRDOC.Tree.dropDir');
                        deny = false;
                    };
                },
                error: function(a, b, c) {
                    MRDOC.function.error('移动失败！<br/>Error: MRDOC.Tree.dropDir');
                    deny = false;
                }
            });
            return deny;
        },
        _init: function() {
            tree.tree({
                onBeforeEdit: function(node) {
                    setTimeout(function() {
                        $(node.target).find('input').select();
                    }, 10);
                },
                onAfterEdit: function(node) {
                    if (node.id < 0) {
                        MRDOC.Tree.add(node);
                    } else {
                        MRDOC.Tree.renameDir(node);
                    }
                },
                onCancelEdit: function(node) {
                    if (node.id < 0) {
                        tree.tree('remove', node.target);
                    }
                },
                onBeforeDrop: function(target, source, point) {
                    return MRDOC.Tree.dropDir(target, source, point);
                },
                onDblClick: function(node) {
                    tree.tree('toggle', node.target);
                },
                onClick: function(node) {
                    MRDOC.Tabs.add(node.dirid, node.text);
                },
            });
        }
    };
}();
MRDOC.Tabs = function() {
    var tabs = $('.easyui-layout > .center .easyui-tabs');
    return {
        getTabId: function(dirid) {
            return 'doc_tab_' + dirid;
        },
        getUeidByTabid: function(tabid) {
            return tabid + '_ue';
        },
        getDiridByTabid: function (tabid) {
            return tabid.substring(8);
        },
        getUeId: function(dirid) {
            var tabid = MRDOC.Tabs.getTabId(dirid);
            return MRDOC.Tabs.getUeidByTabid(tabid);
        },
        exists: function(key) {
            return $("#" + MRDOC.Tabs.getTabId(key)).length > 0 ? true : false;
        },
        add: function(dirid, text) {
            if (MRDOC.Tabs.exists(dirid)) {
                var index = tabs.tabs('getTabIndex', $("#" + MRDOC.Tabs.getTabId(dirid)));
                tabs.tabs('select', index);
            } else {
                tabs.tabs('add', {
                    id: MRDOC.Tabs.getTabId(dirid),
                    title: text,
                    closable: true,
                    content: '<script id="' + MRDOC.Tabs.getUeId(dirid) + '" type="text/plain"></script>',
                });
            };
        },
        addFrame: function(name, text) {
            if (MRDOC.Tabs.exists("frame_" + name)) {
                var index = tabs.tabs('getTabIndex', $("#" + MRDOC.Tabs.getTabId("frame_" + name)));
                tabs.tabs('select', index);
            } else {
                var url = MRDOC.config.url.baseFrame.substring(0, MRDOC.config.url.baseFrame.length - 9) + name;
                tabs.tabs('add', {
                    id: MRDOC.Tabs.getTabId("frame_" + name),
                    title: text,
                    closable: true,
                    content: '<iframe src="' + url + '" frameborder="0" width="100%" height="99%"></iframe>',
                });

                // 刷新样式 特殊处理
                var a = $('#' + MRDOC.Tabs.getTabId("frame_" + name));
                a.width(a.width()-1);
            };
        },
        resizeUe: function() {
            var curtab = tabs.tabs('getSelected'),
                tabid = $(curtab).attr('id');
            if (!curtab) return;
            if (tabid.substring(0, 14) == 'doc_tab_frame_') return;

            var curueid = MRDOC.Tabs.getUeidByTabid($(curtab).attr('id'));
            var curue = UE.getEditor(curueid);
            if (!curue) return;

            var ueToolbarHeight = $(curtab).find('div:first-child > .edui-editor > .edui-editor-toolbarbox').height();
            var ueBottombarHeight = $(curtab).find('div:first-child > .edui-editor > .edui-editor-bottomContainer').height();
            if (!ueToolbarHeight || !ueBottombarHeight) return;

            curue.setHeight($(curtab).height() - ueToolbarHeight - ueBottombarHeight);
        },
        addSaveBtn: function(tabid) {
            var ueid = MRDOC.Tabs.getUeidByTabid(tabid),
                dirid = MRDOC.Tabs.getDiridByTabid(tabid),
                toolbar = $("#" + ueid + ' > .edui-editor > .edui-editor-toolbarbox > .edui-editor-toolbarboxouter > .edui-editor-toolbarboxinner > .edui-toolbar');
            toolbar.prepend("<div class='doc-icon-save' onclick=\"MRDOC.Tabs.saveDoc('" + dirid + "', '" + ueid + "')\"></div>");
        },
        saveDoc: function(dirid, ueid) {
            $.ajax({
                url: MRDOC.config.url.saveArticle,
                type: 'post',
                dataType: 'json',
                data: {
                    dirid: dirid,
                    content: UE.getEditor(ueid).getContent(),
                    contentTxt: UE.getEditor(ueid).getContentTxt()
                },
                success: function(data) {
                    if (data.success) MRDOC.function.success(data.success);
                    if (data.message) MRDOC.function.message(data.message);
                    if (data.error) MRDOC.function.error(data.error);
                },
                error: function(a, b, c) {
                    MRDOC.function.error('保存失败！');
                }
            });
        },
        _init: function() {
            tabs.tabs({
                onAdd: function(title, index) {
                    var tab = tabs.tabs('getTab', index),
                        tabid = $(tab).attr('id'),
                        ueid = MRDOC.Tabs.getUeidByTabid(tabid);

                    if (tabid.substring(0, 14) == 'doc_tab_frame_') return;

                    var ue = UE.getEditor(ueid, {
                            autoHeightEnabled: false
                        });
                    ue.ready(function() {
                        MRDOC.Tabs.resizeUe();
                        $.ajax({
                            url: MRDOC.config.url.getArticle,
                            type: 'post',
                            dataType: 'json',
                            data: {
                                dirid: MRDOC.Tabs.getDiridByTabid(tabid)
                            },
                            success: function(data) {
                                if (data.success) ue.setContent(data.success.content);
                            },
                            error: function(a, b, c) {
                                MRDOC.function.error('获取文章失败！');
                            }
                        });
                        MRDOC.Tabs.addSaveBtn(tabid);
                    });
                },
                onBeforeClose: function(title, index) {
                    var tab = tabs.tabs('getTab', index),
                        tabid = $(tab).attr('id');
                    if (tabid.substring(0, 14) == 'doc_tab_frame_') return;

                    var tab = tabs.tabs('getTab', index),
                        ueid = MRDOC.Tabs.getUeidByTabid($(tab).attr('id')),
                        ue = UE.getEditor(ueid);
                    ue.destroy();
                }
            });
            $(window).resize(function() {
                setTimeout(function() {
                    MRDOC.Tabs.resizeUe();
                }, 100);
            });
        }
    };
}();
MRDOC.Tree._init();
MRDOC.Tabs._init();