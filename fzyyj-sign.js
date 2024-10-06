/*
===================
[MITM]
hostname = fzyyj-signin.szcy-fintech.com

===================
【 QX  脚本配置 】 :
===================
[rewrite_local]
^https:\/\/fzyyj-signin\.szcy-fintech\.com\/fzyyj\/game\/signin url script-request-header https://raw.githubusercontent.com/fengyunjay2004/Lexus/refs/heads/main/fzyyj-sign.js

*/

const APIKey = "yy_10000";
const $ = new API(APIKey, true);

if ($request) GetHeaders();

function GetHeaders() {
  // 检查 URL 是否匹配目标请求
  if ($request.url.indexOf("https://fzyyj-signin.szcy-fintech.com/fzyyj/game/signin") !== -1) {
    
    // 提取 Cookie
    let cookie = $request.headers['Cookie'];
    if (cookie) {
      $.write(cookie, `sgs_Cookie`);                    // 保存 Cookie
      $.notify(`成功`, `Cookie 获取成功`, cookie);      // 通知 Cookie 获取成功
      $.info(`Cookie: ${cookie}`);                      // 输出 Cookie 到控制台
    } else {
      $.notify(`失败`, `未找到 Cookie`, `请检查请求头`);  // 如果未找到 Cookie，通知用户
    }
    
    // 提取 Authorization
    let authorization = $request.headers['Authorization'];
    if (authorization) {
      $.write(authorization, `authorization`);              // 保存 Authorization
      $.notify(`成功`, `Authorization 获取成功`, authorization); // 通知 Authorization 获取成功
      $.info(`authorization: ${authorization}`);             // 输出 Authorization 到控制台
    } else {
      $.notify(`失败`, `未找到 Authorization`, `请检查请求头`);  // 未找到 Authorization 时通知
    }
  }
}

// 动态添加时间戳到 URL
if ($request && $request.url) {
  let timestamp = new Date().getTime();   // 获取当前时间戳
  let newUrl = $request.url;

  // 检查 URL 是否已有参数
  if (newUrl.indexOf('?') !== -1) {
    newUrl += `&timestamp=${timestamp}`;
  } else {
    newUrl += `?timestamp=${timestamp}`;
  }

  // 重新发起带时间戳的请求
  $done({url: newUrl});
} else {
  $done();
}

// API类的定义，方便处理存储、通知等功能
function API(key, isDebug) {
  this.key = key;
  this.isDebug = isDebug;

  // 保存数据
  this.write = (data, key) => {
    if (typeof data === 'string') {
      $persistentStore.write(data, key);
    }
  };

  // 读取数据
  this.read = (key) => {
    return $persistentStore.read(key);
  };

  // 发送通知
  this.notify = (title, subtitle, message) => {
    $notification.post(title, subtitle, message);
  };

  // 输出到控制台（仅在调试模式下）
  this.info = (message) => {
    if (this.isDebug) {
      console.log(message);
    }
  };

  // 结束请求处理
  this.done = (obj) => {
    $done(obj);
  };
}
