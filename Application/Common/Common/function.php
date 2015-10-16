<?php
function p($obj) {
    echo '<pre>' . print_r($obj, true) . '</pre>';
}
function isLogin() {
    if (session('user.uid') && session('user.account')) {
        return true;
    } else {
        return false;
    }
}