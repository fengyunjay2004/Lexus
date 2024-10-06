/*
===================
[MITM]
hostname = fzyyj-signin.szcy-fintech.com,prod.fzyyj.fintechboc.cn

===================
【 QX  脚本配置 】 :
===================
[rewrite_local]
^https:\/\/fzyyj-signin\.szcy-fintech\.com\/assets\/save-167ad561\.png$ url script-request-header https://raw.githubusercontent.com/fengyunjay2004/Lexus/refs/heads/main/fzyyj-sign.js

*/

if ($request) {
    let url = $request.url;
    if (url.indexOf("https://fzyyj-signin.szcy-fintech.com/assets/save-167ad561.png") !== -1) {
        
        let cookie = $request.headers['Cookie'];
        if (cookie) {
            $prefs.setValueForKey(cookie, "cookieKey");  // 保存 Cookie 到本地存储
            $notify("成功", "Cookie 已保存", `以下是获取到的 Cookie:\n${cookie}`);
        }
        
        let authorization = $request.headers['Authorization'];
        if (authorization) {
            $prefs.setValueForKey(authorization, "authKey");  // 保存 Authorization
            $notify("成功", "Authorization 已保存", authorization);
        }
    }
}

$done();



