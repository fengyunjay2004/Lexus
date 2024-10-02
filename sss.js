/*
===================
[MITM]
hostname = fwdt.shengongshe.org

===================
【 QX  脚本配置 】 :
===================
[rewrite_local]
^https:\/\/fwdt\.shengongshe\.org\/sgsWchartApi\/api\/User\/getUserInfoForApp url script-request-header https://raw.githubusercontent.com/fengyunjay2004/Lexus/refs/heads/main/sss.js

 */
const APIKey = "yy_10000";
const $ = new API(APIKey, true);

if ($request) GetHeaders();

function GetHeaders() {
  // 检查 URL 是否匹配目标请求
  if ($request.url.indexOf("fwdt.shengongshe.org/sgsWchartApi/api/User/getUserInfoForApp") !== -1) {
    
    // 提取 X-XSRF-TOKEN 和 token 值
    let xsrfToken = $request.headers['X-XSRF-TOKEN'];   // 提取 X-XSRF-TOKEN
    let token = $request.headers['token'];              // 提取 token

    /*
    // 如果需要提取 Cookie，则解除注释
    let cookie = $request.headers['Cookie'];            // 提取 Cookie
    if (cookie) {
      $.write(cookie, `sgs_Cookie`);                    // 保存 Cookie
      $.notify(`成功`, `Cookie 获取成功`, cookie);      // 通知 Cookie 获取成功
      $.info(`Cookie: ${cookie}`);                      // 输出 Cookie 到控制台
    } else {
      $.notify(`失败`, `未找到 Cookie`, `请检查请求头`);  // 如果未找到 Cookie，通知用户
    }
    */

    if (xsrfToken) {
      $.write(xsrfToken, `sgs_XSRFToken`);              // 保存 X-XSRF-TOKEN
      $.notify(`成功`, `X-XSRF-TOKEN 获取成功`, xsrfToken); // 通知 X-XSRF-TOKEN 获取成功
      $.info(`X-XSRF-TOKEN: ${xsrfToken}`);             // 输出 X-XSRF-TOKEN 到控制台
    } else {
      $.notify(`失败`, `未找到 X-XSRF-TOKEN`, `请检查请求头`);  // 未找到 X-XSRF-TOKEN 时通知
    }

    if (token) {
      $.write(token, `sgs_Token`);                      // 保存 token
      $.notify(`成功`, `Token 获取成功`, token);        // 通知 token 获取成功
      $.info(`Token: ${token}`);                        // 输出 token 到控制台
    } else {
      $.notify(`失败`, `未找到 token`, `请检查请求头`);  // 未找到 token 时通知
    }
  }
}

$.done();

/* prettier-ignore */
function ENV(){const isJSBox=typeof require=="function"&&typeof $jsbox!="undefined";return{isQX:typeof $task!=="undefined",isLoon:typeof $loon!=="undefined",isSurge:typeof $httpClient!=="undefined"&&typeof $utils!=="undefined",isBrowser:typeof document!=="undefined",isNode:typeof require=="function"&&!isJSBox,isJSBox,isRequest:typeof $request!=="undefined",isScriptable:typeof importModule!=="undefined",isShadowrocket:"undefined"!==typeof $rocket,isStash:"undefined"!==typeof $environment&&$environment["stash-version"]}}




