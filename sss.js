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

if ($request) {
    let xsrfToken = $request.headers['X-XSRF-TOKEN'];   // 提取 X-XSRF-TOKEN
    let token = $request.headers['token'];              // 提取 token
    let url = $request.url;
    if (url.indexOf("https://fwdt.shengongshe.org/sgsWchartApi/api/User/getUserInfoForApp") !== -1) {
       if (xsrfToken && token) {
            $prefs.setValueForKey(xsrfToken, "xsrfTokenKey");  // 保存 xsrfToken 到本地存储
            $prefs.setValueForKey(token, "tokenKey");  // 保存 token 到本地存储
            $notify("成功 Token和X-XSRF-TOKEN已保存", "", `Token值 & X-XSRF-TOKEN值\n${token}&${xsrfToken}`);
            console.log(`Token值 & X-XSRF-TOKEN值\n${token}&${xsrfToken}`);
        } else {
          $notify(`失败`, `未找到 X-XSRF-TOKEN 和 Token`, `请检查请求头`);  // 未找到 X-XSRF-TOKEN 和 Token 时通知
        }
        
    }
}

$done();
