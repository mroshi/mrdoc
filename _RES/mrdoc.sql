/*
Navicat MySQL Data Transfer

Source Server         : default
Source Server Version : 50621
Source Host           : localhost:3306
Source Database       : mrdoc

Target Server Type    : MYSQL
Target Server Version : 50621
File Encoding         : 65001

Date: 2015-10-16 19:43:11
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for doc_article
-- ----------------------------
DROP TABLE IF EXISTS `doc_article`;
CREATE TABLE `doc_article` (
  `artid` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '文章ID',
  `content` text NOT NULL COMMENT '文章内容',
  `contentTxt` text NOT NULL COMMENT '文章内容（纯文本）',
  `dirid` int(11) NOT NULL COMMENT '所属目录ID',
  `docid` int(11) NOT NULL COMMENT '所属文档ID',
  PRIMARY KEY (`artid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='文章信息';

-- ----------------------------
-- Records of doc_article
-- ----------------------------

-- ----------------------------
-- Table structure for doc_directory
-- ----------------------------
DROP TABLE IF EXISTS `doc_directory`;
CREATE TABLE `doc_directory` (
  `dirid` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '目录ID',
  `pid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '父级目录ID（0表示根目录）',
  `lv` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '目录层级（从0开始）',
  `sort` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '排序号（从0开始）',
  `text` varchar(255) NOT NULL DEFAULT '' COMMENT '目录名称',
  `docid` int(10) unsigned NOT NULL COMMENT '所属文档ID',
  PRIMARY KEY (`dirid`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='目录信息';

-- ----------------------------
-- Records of doc_directory
-- ----------------------------
INSERT INTO `doc_directory` VALUES ('1', '0', '0', '0', '默认目录', '1');
INSERT INTO `doc_directory` VALUES ('2', '0', '0', '0', '默认目录', '2');
INSERT INTO `doc_directory` VALUES ('3', '0', '0', '0', '默认目录', '3');

-- ----------------------------
-- Table structure for doc_document
-- ----------------------------
DROP TABLE IF EXISTS `doc_document`;
CREATE TABLE `doc_document` (
  `docid` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '文档ID',
  `title` varchar(255) NOT NULL DEFAULT '' COMMENT '文档标题',
  `keywords` varchar(255) NOT NULL DEFAULT '' COMMENT '文档关键词',
  `description` varchar(255) NOT NULL DEFAULT '' COMMENT '文档描述',
  PRIMARY KEY (`docid`),
  UNIQUE KEY `title` (`title`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='文档信息';

-- ----------------------------
-- Records of doc_document
-- ----------------------------
INSERT INTO `doc_document` VALUES ('1', 'PHP', 'PHP', 'PHP');
INSERT INTO `doc_document` VALUES ('2', 'JAVASCRIPT', 'JAVASCRIPT', 'JAVASCRIPT');
INSERT INTO `doc_document` VALUES ('3', 'MYSQL', 'MYSQL', 'MYSQL');

-- ----------------------------
-- Table structure for doc_user
-- ----------------------------
DROP TABLE IF EXISTS `doc_user`;
CREATE TABLE `doc_user` (
  `uid` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `account` varchar(32) NOT NULL COMMENT '用户帐号',
  `password` char(32) NOT NULL DEFAULT 'e10adc3949ba59abbe56e057f20f883e' COMMENT '用户密码（默认123456的md5值）',
  `realname` varchar(32) NOT NULL DEFAULT '' COMMENT '真实姓名',
  `status` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '用户状态（0:未激活  1:正常  2:已停用  3:已删除）',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `account` (`account`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='用户信息';

-- ----------------------------
-- Records of doc_user
-- ----------------------------
INSERT INTO `doc_user` VALUES ('1', 'mroshi', 'c1c74a431186f8ff310c1b4b32dcf2e4', '超级管理员', '1');

-- ----------------------------
-- Table structure for doc_visitor
-- ----------------------------
DROP TABLE IF EXISTS `doc_visitor`;
CREATE TABLE `doc_visitor` (
  `vid` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '访客ID',
  `ipaddress` varchar(15) NOT NULL DEFAULT '0.0.0.0' COMMENT '访客IP地址',
  `timestamp` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '访问时间（时间戳）',
  `is_browser` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否浏览器',
  `is_robot` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否机器人',
  `is_mobile` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否移动设备',
  `is_referral` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否从另一个网站链接过来的',
  `browser` varchar(50) NOT NULL DEFAULT '' COMMENT '浏览器名称',
  `robot` varchar(50) NOT NULL DEFAULT '' COMMENT '机器人名称',
  `mobile` varchar(50) NOT NULL DEFAULT '' COMMENT '移动设备名称',
  `referrer` varchar(255) NOT NULL DEFAULT '' COMMENT '来源页面URL',
  `agent_string` varchar(255) NOT NULL DEFAULT '' COMMENT 'UserAgent字符串',
  `platform` varchar(50) NOT NULL DEFAULT '' COMMENT '操作平台名称',
  `version` varchar(50) NOT NULL DEFAULT '' COMMENT '浏览器版本号',
  PRIMARY KEY (`vid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='访客信息';

-- ----------------------------
-- Records of doc_visitor
-- ----------------------------
