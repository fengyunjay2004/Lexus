/*
签到页面，点分享海报即可
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
            //$notify("成功", "Cookie 已保存", `以下是获取到的 Cookie:\n${cookie}`);
            console.log(`cookie值:\n${cookie}`);
            let tokenMatch = cookie.match(/token=([^;]+)/);
            if (tokenMatch) {
                // 提取到的 token 值
                let token = tokenMatch[1].replace(/%20/g, " ");  // 将 %20 替换为空格
                
                // 保存 token 到本地存储
                $prefs.setValueForKey(token, "AuthorizationKey");  
                
                // 发送通知，显示提取的 token
                $notify("成功", "Authorization 已提取", `以下是获取到的Cookie值\n${cookie}\n\n以下是获取到的Authorization值\n${token}`);
                console.log(`Authorization值:\n${token}`);
            } else {
                // 未找到 token 时，发送通知
                $notify("失败", "未找到 token", "请检查 Cookie");
            }
        }
        
        let authorization = $request.headers['Authorization'];
        if (authorization) {
            $prefs.setValueForKey(authorization, "authKey");  // 保存 Authorization
            $notify("成功", "Authorization 已保存", authorization);
        }
    }
}

$done();



