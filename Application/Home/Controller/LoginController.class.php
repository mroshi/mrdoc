<?php
namespace Home\Controller;
use Think\Controller;

class LoginController extends Controller {

    public function login() {
        if (IS_AJAX && IS_POST) {
            $verify = new \Think\Verify();
            if (!$verify->check(I('post.verify'))) {
                $this->ajaxReturn(array('error' => '验证码错误！'), 'json');
            }

            $user = M('user')->where(array('account' => I('post.account')))->find();
            if (!$user || md5(I('post.password')) != $user['password']) {
                $this->ajaxReturn(array('error' => '帐号密码错误！'), 'json');
            }

            if (C('SUPERADMIN_ACCOUNT') != $user['account']) {
                switch ($user['status']) {
                    case 0:
                        $this->ajaxReturn(array('error' => '该帐号未激活！'), 'json');
                        break;
                    case 2:
                        $this->ajaxReturn(array('error' => '该帐号已停用！'), 'json');
                        break;
                    case 3:
                        $this->ajaxReturn(array('error' => '帐号密码错误！'), 'json');
                        break;
                }
            }

            session('user.uid', $user['uid']);
            session('user.account', $user['account']);
            session('user.realname', $user['realname']);

            $this->ajaxReturn(array('success' => U('admin/index')), 'json');
        } else {
            if (isLogin()) {
                $this->redirect('admin/index');
            }
            $this->display();
        }
    }

    public function verify() {
        $config = array(
            'length'   => 4,
            'imageW'   => 150,
            'imageH'   => 35,
            'fontSize' => 16,
        );
        $verify = new \Think\Verify($config);
        $verify->entry();
    }

    public function logout() {
        session_unset();
        session_destroy();
        $this->redirect('login/login');
    }
}