<?php
namespace Home\Controller;
use Think\Controller;

class AdminController extends Controller {

    public function _initialize() {
        if (!isLogin()) {
            $this->redirect('login/login');
        }
    }

    /**
     * 更新目录排序：从指定的排序号开始，排序号加一（包含开始的排序号）
     * @param  integer|string $pid   指定父级目录ID
     * @param  integer|string $start 指定的开始更新的排序号
     * @return integer               受影响条数
     */
    private function updateDirSort($pid, $start) {
        $where['pid']  = $pid;
        $where['sort'] = array('egt', $start);
        return M('directory')->where($where)->setInc('sort');
    }
    /**
     * 删除指定目录，并递归删除其子目录
     * @param integer $dirid 目录ID
     */
    private function removeWholeDir($dirid) {
        M('directory')->where(array('dirid' => $dirid))->delete();
        if ($child = M('directory')->where(array('pid' => $dirid))->select()) {
            foreach ($child as $c) {
                $this->removeWholeDir($c['dirid']);
            }
        };
    }
    /**
     * 递归更新指定目录的所有子目录层级
     * @param integer $pid 指定目录ID
     * @param integer $lv  层级
     */
    private function updateDirLv($pid, $lv) {
        $dir = M('directory')->where(array('pid' => $pid))->select();
        if ($dir) {
            foreach ($dir as $d) {
                $new['dirid'] = $d['dirid'];
                $new['lv']    = $lv;
                M('directory')->data($new)->save();
                $this->updateDirLv($d['dirid'], $lv + 1);
            }
        }
    }

    /**
     * 后台主页
     */
    public function index() {
        $this->doc = M('document')->where(array('docid' => I('docid', 1)))->find();
        $this->display();
    }
    /**
     * 获取指定文档的目录
     */
    public function getDir() {
        if (!($docid = I('docid', '')) || !IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }

        $dir = M('directory')->where(array('docid' => $docid))->order('lv desc,pid,sort')->select();

        // 使用dirid作为数组索引
        // 并添加id元素，值与dirid相同
        $tmp = array();
        foreach ($dir as $value) {
            $value['id']          = $value['dirid'];
            $tmp[$value['dirid']] = $value;
        }
        $dir = $tmp;

        // 按层级嵌套数组
        foreach ($tmp as $key => $value) {
            if ($value['pid']) {
                if (isset($dir[$value['pid']])) {
                    $dir[$value['pid']]['children'][] = $dir[$key];
                }
                unset($dir[$key]);
            }
        }

        $this->ajaxReturn(array_values($dir), 'json');
    }
    /**
     * 添加一个目录
     */
    public function addDir() {
        if (!IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }

        $pid    = I('pid', -1); // 父级目录ID
        $previd = I('previd', -1); // 上一个目录ID
        $text   = I('text', -1); // 目录名称
        $docid  = I('docid', -1); // 所属文档ID
        if (-1 === $pid || -1 === $previd || -1 === $text || -1 === $docid) {
            $this->ajaxReturn(array('error' => '参数有误！'), 'json');
        }

        $parent = M('directory')->where(array('dirid' => $pid))->find();
        $prev   = M('directory')->where(array('dirid' => $previd))->find();
        $doc    = M('document')->where(array('docid' => $docid))->find();
        if ('0' != $pid && !$parent) {
            $this->ajaxReturn(array('error' => '父级目录不存在！'), 'json');
        }
        if ('0' != $previd && !$prev) {
            $this->ajaxReturn(array('error' => '指定的上一个目录不存在！'), 'json');
        }
        if (!$doc) {
            $this->ajaxReturn(array('error' => '所属文档不存在！'), 'json');
        }

        $dir = array();
        if ('0' == $pid) {
            $dir['pid'] = '0';
            $dir['lv']  = '0';
        } else {
            $dir['pid'] = $pid;
            $dir['lv']  = $parent['lv'] + 1;
        }
        if ('0' == $previd) {
            $dir['sort'] = '0';
            $this->updateDirSort($pid, '0');
        } else {
            $dir['sort'] = $prev['sort'] + 1;
            $this->updateDirSort($pid, $prev['sort'] + 1);
        }
        $dir['text']  = $text;
        $dir['docid'] = $docid;

        if ($dirid = M('directory')->data($dir)->add()) {
            $new = M('directory')->where(array('dirid' => $dirid))->find();
            $this->ajaxReturn(array('success' => $new), 'json');
        } else {
            $this->ajaxReturn(array('error' => '添加失败！'), 'json');
        }
    }
    /**
     * 删除一个目录，并删除其子目录
     */
    public function removeDir() {
        if (!IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }

        if (!$dirid = I('dirid', '')) {
            $this->ajaxReturn(array('error' => '参数有误！'), 'json');
        }

        if (!$dir = M('directory')->where(array('dirid' => $dirid))->find()) {
            $this->ajaxReturn(array('success' => '目录不存在或已被删除！'), 'json');
        }

        $this->removeWholeDir($dirid);
        $this->ajaxReturn(array('success' => '删除成功！'), 'json');
    }
    /**
     * 重命名目录
     */
    public function renameDir() {
        if (!IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }

        if (!($dirid = I('dirid', '')) || !($text = I('text', ''))) {
            $this->ajaxReturn(array('error' => '参数有误！'), 'json');
        }

        if (!M('directory')->where(array('dirid' => $dirid))->count()) {
            $this->ajaxReturn(array('error' => '目录不存在或已被删除！'), 'json');
        }

        $dir = array(
            "dirid" => $dirid,
            "text"  => $text,
        );
        if (M('directory')->data($dir)->save()) {
            $this->ajaxReturn(array('success' => '重命名成功！'), 'json');
        } else {
            $this->ajaxReturn(array('error' => '重命名失败！'), 'json');
        }
    }
    /**
     * 移动一个目录
     */
    public function dropDir() {
        if (!IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }

        $sourceid = I('sourceid', '');
        $targetid = I('targetid', '');
        $point    = I('point', '');
        if (!$sourceid || !$targetid || !$point) {
            $this->ajaxReturn(array('error' => '参数有误！'), 'json');
        }

        $source = M('directory')->where(array('dirid' => $sourceid))->find();
        $target = M('directory')->where(array('dirid' => $targetid))->find();
        if (!$source) {
            $this->ajaxReturn(array('error' => '源目录不存在！'), 'json');
        }
        if (!$target) {
            $this->ajaxReturn(array('error' => '目标目录不存在！'), 'json');
        }

        $new = $source;
        if ('top' == $point) {
            $new['pid']  = $target['pid'];
            $new['lv']   = $target['lv'];
            $new['sort'] = $target['sort'];
            $this->updateDirSort($target['pid'], $target['sort']);
        } elseif ('bottom' == $point) {
            $new['pid']  = $target['pid'];
            $new['lv']   = $target['lv'];
            $new['sort'] = $target['sort'] + 1;
            $this->updateDirSort($target['pid'], $target['sort'] + 1);
        } elseif ('append' == $point) {
            $new['pid']  = $target['dirid'];
            $new['lv']   = $target['lv'] + 1;
            $sort        = M('directory')->where(array('pid' => $target['dirid']))->max('sort');
            $new['sort'] = $sort ? $sort + 1 : 0;
        }

        if (M('directory')->data($new)->save()) {
            $this->updateDirLv($sourceid, $new['lv'] + 1);
            $new = M('directory')->where(array('dirid' => $sourceid))->find();
            $this->ajaxReturn(array('success' => $new), 'json');
        } else {
            $this->ajaxReturn(array('error' => '移动目录失败！'), 'json');
        }
    }
    /**
     * 获取指定目录文章
     */
    public function getArticle() {
        if (!IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }
        if (!$dirid = I('dirid', '')) {
            $this->ajaxReturn(array('error' => '参数有误！'), 'json');
        }

        if ($article = M('article')->where(array('dirid' => $dirid))->find()) {
            $this->ajaxReturn(array('success' => $article), 'json');
        } else {
            $this->ajaxReturn(array('error' => '指定文章不存在！'), 'json');
        }
    }
    /**
     * 保存文章
     */
    public function saveArticle() {
        if (!IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }

        $dirid      = I('dirid', '');
        $content    = I('content', '');
        $contentTxt = I('contentTxt', '');
        if (!$dirid) {
            $this->ajaxReturn(array('error' => '参数有误！'), 'json');
        }
        if (!$dir = M('directory')->where(array('dirid' => $dirid))->find()) {
            $dir['docid'] = 0;
        }
        $content    = htmlspecialchars_decode($content);
        $contentTxt = htmlspecialchars_decode($contentTxt);
        $docid      = $dir['docid'];

        if ($article = M('article')->where(array('dirid' => $dirid))->find()) {
            $article['content']    = $content;
            $article['contentTxt'] = $contentTxt;
            $article['docid']      = $docid;
            $result                = M('article')->data($article)->save();
            if (is_integer($result) && $result > 0) {
                $this->ajaxReturn(array('success' => '保存成功！'), 'json');
            } elseif (is_integer($result) && 0 == $result) {
                $this->ajaxReturn(array('message' => '无改动！'), 'json');
            } else {
                $this->ajaxReturn(array('error' => '保存失败！'), 'json');
            }
        } else {
            $article = array(
                "dirid"      => $dirid,
                "content"    => $content,
                "contentTxt" => $contentTxt,
                "docid"      => $docid,
            );
            if (M('article')->data($article)->add()) {
                $this->ajaxReturn(array('success' => '保存成功！'), 'json');
            } else {
                $this->ajaxReturn(array('error' => '保存失败！'), 'json');
            }
        }
    }
    /**
     * 显示文档操作界面
     */
    public function document() {
        $this->display();
    }
    /**
     * 获取文档
     */
    public function getDocs() {
        if (!IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }

        $page  = intval(I('page', '1'));
        $rows  = intval(I('rows', '10'));
        $docs  = M('document')->limit(($page - 1) * $rows, $rows)->select();
        $docs  = $docs ? $docs : array();
        $total = M('document')->count();

        $this->ajaxReturn(array('rows' => $docs, 'total' => $total), 'json');
    }
    /**
     * 添加文档
     */
    public function saveDoc() {
        if (!IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }

        $data = array(
            "title"       => I('title', ''),
            "keywords"    => I('keywords', ''),
            "description" => I('description', ''),
        );
        if (!$data['title']) {
            $this->ajaxReturn(array('error' => '名称不能为空！'), 'json');
        }

        if ($docid = M('document')->data($data)->add()) {
            if (!M('directory')->where(array('docid' => $docid))->find()) {
                $data = array(
                    'pid'   => '0',
                    'lv'    => '0',
                    'sort'  => '0',
                    'text'  => '默认目录',
                    'docid' => $docid,
                );
                M('directory')->data($data)->add();
            }
            $this->ajaxReturn(array('success' => '保存成功！'), 'json');
        } else {
            $this->ajaxReturn(array('error' => '保存失败！'), 'json');
        }
    }
    /**
     * 编辑文档
     */
    public function updateDoc() {
        if (!IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }
        if (!$docid = I('docid', '')) {
            $this->ajaxReturn(array('error' => '参数有误！'), 'json');
        }
        if (!$doc = M('document')->where(array('docid' => $docid))->find()) {
            $this->ajaxReturn(array('error' => '文档不存在或已被删除！'), 'json');
        }

        $new = array(
            "docid"       => $doc['docid'],
            "title"       => I('title', $doc['title']),
            "keywords"    => I('keywords', $doc['keywords']),
            "description" => I('description', $doc['description']),
        );
        if (!$new['title']) {
            $this->ajaxReturn(array('error' => '名称不能为空！'), 'json');
        }

        if (M('document')->data($new)->save()) {
            $this->ajaxReturn(array('success' => '保存成功！'), 'json');
        } else {
            $this->ajaxReturn(array('error' => '保存失败！'), 'json');
        }
    }
    /**
     * 删除文档
     */
    public function destroyDoc() {
        if (!IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }
        if (!$docid = I('docid', '')) {
            $this->ajaxReturn(array('error' => '参数有误！'), 'json');
        }
        if (!$doc = M('document')->where(array('docid' => $docid))->find()) {
            $this->ajaxReturn(array('error' => '文档不存在或已被删除！'), 'json');
        }

        if (M('document')->where(array('docid' => $docid))->delete()) {
            $this->ajaxReturn(array('success' => '删除成功！'), 'json');
        } else {
            $this->ajaxReturn(array('error' => '删除失败！'), 'json');
        }
    }
    /**
     * 访客
     */
    public function visitor() {
        if (IS_POST && IS_AJAX) {
            $page    = intval(I('page', '1'));
            $rows    = intval(I('rows', '10'));
            $visitor = M('visitor')->order('timestamp desc')->limit(($page - 1) * $rows, $rows)->select();
            $visitor = $visitor ? $visitor : array();
            $total   = M('visitor')->count();
            foreach ($visitor as $k => $v) {
                $visitor[$k]['timestamp']   = date('Y-m-d H:i:s', $v['timestamp']);
                $visitor[$k]['is_referral'] = $v['is_referral'] ? '是' : '否';
                if ($v['is_browser']) {
                    $visitor[$k]['device']     = '浏览器';
                    $visitor[$k]['deviceName'] = $v['browser'];
                } elseif ($v['is_robot']) {
                    $visitor[$k]['device']     = '机器人';
                    $visitor[$k]['deviceName'] = $v['robot'];
                } elseif ($v['is_mobile']) {
                    $visitor[$k]['device']     = '移动设备';
                    $visitor[$k]['deviceName'] = $v['mobile'];
                } else {
                    $visitor[$k]['device']     = ' ';
                    $visitor[$k]['deviceName'] = ' ';
                }
            }
            $this->ajaxReturn(array('rows' => $visitor, 'total' => $total), 'json');
        } elseif (IS_GET) {
            $this->display();
        }
    }

}