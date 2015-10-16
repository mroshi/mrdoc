MRDOC.Visitor = function() {
    var datagrid = $('#datagrid'),
        container = $('.doc-container');
    return {
        resize: function() {
            var windowH = $(window).height(),
                containerMT = parseInt(container.css('margin-top')),
                containerMB = parseInt(container.css('margin-bottom'));
            datagrid.datagrid('resize', {
                height: (windowH - containerMT - containerMB) + 'px'
            });
        },
        setPaginationText: function() {
            datagrid.datagrid('getPager').pagination({
                beforePageText: '页码',
                afterPageText: '共 {pages} 页',
                displayMsg: "第 {from} 到 {to} 条，共 {total} 条",
            });
        },
        _init: function() {
            $(window).resize(function() {
                setTimeout(function() {
                    MRDOC.Visitor.resize();
                }, 50);
            });
            $(document).ready(function() {
                setTimeout(function() {
                    MRDOC.Visitor.resize();
                }, 50);
            });
            datagrid.datagrid({
                onLoadSuccess: function(data) {
                    MRDOC.Visitor.setPaginationText();
                }
            });
        },
    };
}();
MRDOC.Visitor._init();