<?php
namespace Home\Controller;
use Think\Controller;

class IndexController extends Controller {
    /**
     * 主页
     */
    public function index() {
        if (IS_GET) {
            $ipaddress = get_client_ip();
            $data      = M('visitor')->where(array('ipaddress' => $ipaddress))->order('timestamp desc')->find();
            if (!$data || time() - intval($data['timestamp']) > 3600) {
                // 同个IP一小时内重复访问不记录
                $agent                   = new \Common\Org\Util\UserAgent('http://' . $_SERVER['HTTP_HOST']);
                $visitor                 = array();
                $visitor['ipaddress']    = $ipaddress; // IP地址
                $visitor['timestamp']    = time(); // 访问时间
                $visitor['is_browser']   = $agent->is_browser(); // 是否浏览器
                $visitor['is_robot']     = $agent->is_robot(); // 是否机器人
                $visitor['is_mobile']    = $agent->is_mobile(); // 是否移动设备
                $visitor['is_referral']  = $agent->is_referral(); // 是否从另一个网站链接过来的
                $visitor['browser']      = $agent->browser(); // 浏览器名称
                $visitor['robot']        = $agent->robot(); // 机器人名称
                $visitor['mobile']       = $agent->mobile(); // 移动设备名称
                $visitor['referrer']     = $agent->referrer(); // 来源页面URL
                $visitor['agent_string'] = $agent->agent_string(); // UserAgent字符串
                $visitor['platform']     = $agent->platform(); // 操作平台名称
                $visitor['version']      = $agent->version(); // 浏览器版本号
                M('visitor')->data($visitor)->add();
            }
        }
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
     * 文章展示页面
     */
    public function showArticle() {
        if (!$dirid = I('dirid', '')) {
            exit('参数有误！');
        }
        $this->article = M('article')->where(array('dirid' => $dirid))->find();
        $this->display();
    }
    /**
     * 搜索
     */
    public function search() {
        if (!($keyword = I('keyword', '')) || !($docid = I('docid', '')) || !IS_AJAX || !IS_POST) {
            $this->ajaxReturn(array('error' => '非法请求！'), 'json');
        }

        $now = time();
        if (session('search_lock') && session('search_lock') > $now) {
            $this->ajaxReturn(array('warning' => '您的请求过于频繁，请稍后再试！'), 'json');
        }
        if (session('search_time')) {
            if ($now - session('search_time') <= 1) {
                session('search_t1', session('search_t1') ? session('search_t1') + 1 : 1);
            } else {
                session('search_t1', 1);
            }
            if ($now - session('search_time') <= 2) {
                session('search_t2', session('search_t2') ? session('search_t2') + 1 : 1);
            } else {
                session('search_t2', 1);
            }
            if ($now - session('search_time') <= 3) {
                session('search_t3', session('search_t3') ? session('search_t3') + 1 : 1);
            } else {
                session('search_t3', 1);
            }
            if ($now - session('search_time') <= 4) {
                session('search_t4', session('search_t4') ? session('search_t4') + 1 : 1);
            } else {
                session('search_t4', 1);
            }
            if ($now - session('search_time') <= 5) {
                session('search_t5', session('search_t5') ? session('search_t5') + 1 : 1);
            } else {
                session('search_t5', 1);
            }

            if (session('search_t1') >= 3) {
                session('search_lock', $now + 30);
            }
            if (session('search_t2') >= 5) {
                session('search_lock', $now + 60);
            }
            if (session('search_t3') >= 10) {
                session('search_lock', $now + 180);
            }
            if (session('search_t4') >= 15) {
                session('search_lock', $now + 300);
            }
            if (session('search_t5') >= 20) {
                session('search_lock', $now + 3600);
            }
        }
        session('search_time', time());

        $where['docid']      = $docid;
        $where['contentTxt'] = array('like', '%' . $keyword . '%');
        $article             = M('article')->where($where)->select();

        $diridList = array();
        foreach ($article as $a) {
            $diridList[] = $a['dirid'];
        }
        if (!$diridList) {
            $this->ajaxReturn(array(), 'json');
        }

        $dir = M('directory')->where(array('dirid' => array('in', $diridList)))->select();

        // 使用dirid作为数组索引
        // 并添加id元素，值与dirid相同
        $tmp = array();
        foreach ($dir as $value) {
            $value['id']          = $value['dirid'];
            $tmp[$value['dirid']] = $value;
        }
        $dir = $tmp;

        $this->ajaxReturn(array_values($dir), 'json');
    }
}