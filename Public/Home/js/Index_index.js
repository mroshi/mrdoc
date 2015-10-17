MRDOC.Index = function() {
    var directory = $('#doc_tree_directory .easyui-tree'),
        tabs = $('.easyui-layout > .center .easyui-tabs'),
        search = $('#doc_tree_search ul'),
        hashOpenTime = 0;
    return {
        getTabId: function(dirid) {
            return 'doc_tab_' + dirid;
        },
        isExistTab: function(dirid) {
            return $("#" + MRDOC.Index.getTabId(dirid)).length > 0 ? true : false;
        },
        addTabWithContent: function(dirid, text) {
            if (MRDOC.Index.isExistTab(dirid)) {
                var index = tabs.tabs('getTabIndex', $("#" + MRDOC.Index.getTabId(dirid)));
                tabs.tabs('select', index);
            } else {
                $.ajax({
                    url: MRDOC.config.url.getArticle,
                    type: 'post',
                    dataType: 'json',
                    data: {
                        dirid: dirid
                    },
                    success: function(data) {
                        if (data.success) {
                            tabs.tabs('add', {
                                id: MRDOC.Index.getTabId(dirid),
                                title: text,
                                closable: true,
                                content: data.success.content,
                            });
                        }
                        if (data.error) MRDOC.function.error(data.error);
                    },
                    error: function(a, b, c) {
                        MRDOC.function.error('获取文章失败！');
                    }
                });
            };
        },
        addTabWithFrame: function(dirid, text) {
            if (MRDOC.Index.isExistTab(dirid)) {
                var index = tabs.tabs('getTabIndex', $("#" + MRDOC.Index.getTabId(dirid)));
                tabs.tabs('select', index);
            } else {
                var url = MRDOC.config.url.showArticle.substring(0, MRDOC.config.url.showArticle.length - 1) + dirid;
                tabs.tabs('add', {
                    id: MRDOC.Index.getTabId(dirid),
                    title: text,
                    closable: true,
                    content: '<iframe src="' + url + '" frameborder="0" width="99%" height="99%"></iframe>',
                });
                $('#' + MRDOC.Index.getTabId(dirid)).find('iframe').css({
                    'width': '100%',
                    'height': '100%'
                });
                MRDOC.Index.addHash(dirid);
            };
        },
        search: function(keyword) {
            if (!keyword) {
                MRDOC.function.warning('请输入关键字！');
                return;
            };
            search.tree({
                url: MRDOC.config.url.search,
                method: 'post',
                queryParams: {
                    keyword: keyword,
                    docid: MRDOC.config.docid
                }
            });
        },
        addHash: function(dirid) {
            var url = window.location.origin + (window.location.port ? ':' + window.location.port : '') + window.location.pathname;
            window.location.href = url + '#' + dirid;
        },
        openTabByHash: function(id) {
            setTimeout(function() {
                var node = directory.tree('find', id);
                hashOpenTime++;
                if (hashOpenTime >= 50) return;
                if (node && node.dirid && node.text) MRDOC.Index.addTabWithFrame(node.dirid, node.text);
                else MRDOC.Index.openTabByHash(id);
            }, 100);
        },
        _init: function() {
            directory.tree({
                onDblClick: function(node) {
                    directory.tree('toggle', node.target);
                },
                onClick: function(node) {
                    MRDOC.Index.addTabWithFrame(node.dirid, node.text);
                },
            });
            search.tree({
                onClick: function(node) {
                    MRDOC.Index.addTabWithFrame(node.dirid, node.text);
                },
                onLoadSuccess: function(node, data) {
                    if (data.length <= 0) MRDOC.function.message('没搜索到相应数据！');
                    if (data.error) MRDOC.function.error(data.error);
                    if (data.warning) MRDOC.function.warning(data.warning);
                }
            });
            $(document).ready(function() {
                var dirid = window.location.hash.substring(1);
                if (dirid && dirid != -1) {
                    MRDOC.Index.openTabByHash(dirid);
                } else {
                    MRDOC.Index.addTabWithFrame(-1, '关于');
                }
            });
            tabs.tabs({
                onSelect: function(title, index) {
                    var tab = tabs.tabs('getTab', index);
                    MRDOC.Index.addHash($(tab).attr('id').substring(8));
                }
            });
        }
    };
}();
MRDOC.Index._init();