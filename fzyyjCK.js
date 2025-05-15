
/*#!name=福仔云游获取CK (Surge专用版)
#!desc=自动捕获游戏Cookie并通知（仅首次变更时通知）

[Script]
fzyyj-sign = type=http-request, pattern=^https:\/\/fzyyj-signin\.szcy-fintech\.com\/fzyyj\/game\/signin\/taskList, script-path=https://raw.githubusercontent.com/fengyunjay2004/Lexus/refs/heads/main/fzyyjCK.js, requires-body=true

[MITM]
hostname = fzyyj-signin.szcy-fintech.com
*/
// ========== 脚本内容 ==========
const ENV = {
    COOKIE_KEY: "fzyyj_cookie",
    AUTH_KEY: "fzyyj_auth",
    LAST_AUTH_KEY: "fzyyj_last_auth",
    WEBHOOK_URL: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=284b000b-784b-40b4-8a4a-893f4ab3b4b8"
};

(() => {
    // 初始化日志
    const log = (msg) => {
        console.log(`[云游] ${msg}`);
        const logs = $persistentStore.read("fzyyj_log") || "";
        $persistentStore.write(logs + `\n${Date.now()}: ${msg}`);
    };

    // 增强通知
    const notify = (title, content) => {
        $notification.post(title, "", content);
        log(`通知发送: ${title} | ${content}`);
    };

    // 主流程
    if (!$request || !$request.url.includes("/fzyyj/game/signin/taskList")) {
        log("无效请求或URL不匹配");
        return $done();
    }

    try {
        // 获取Cookie
        const cookie = $request.headers?.Cookie || $request.headers?.cookie;
        if (!cookie) throw new Error("未检测到Cookie头");
        
        // 提取Token
        const tokenMatch = cookie.match(/token=([^;]+)/i);
        if (!tokenMatch) throw new Error("Token提取失败");
        const auth = decodeURIComponent(tokenMatch[1]);
        
        // 获取上次保存的auth值
        const lastAuth = $persistentStore.read(ENV.LAST_AUTH_KEY);
        
        // 保存当前auth值用于下次比较
        $persistentStore.write(auth, ENV.LAST_AUTH_KEY);
        
        // 如果auth值没有变化，则不发送通知
        if (lastAuth === auth) {
            log("Token未变化，跳过通知");
            return $done();
        }

        // 保存数据
        $persistentStore.write(cookie, ENV.COOKIE_KEY);
        $persistentStore.write(auth, ENV.AUTH_KEY);
        
        // 本地通知
        notify("云游CK更新", `检测到新Token:\n${auth}`);

        // 企业微信通知（纯文本格式）
        $httpClient.post({
            url: ENV.WEBHOOK_URL,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                msgtype: "text",
                text: {
                    content: `云游CK更新通知\n────────────────\n🕒 更新时间：${new Date().toLocaleString()}\n🔑 最新Token：\n${auth}\n────────────────\n⚠️ 该Token已自动保存至Surge`,
                    mentioned_mobile_list: []  // 如需@所有人可改为 ["@all"]
                }
            })
        }, (error, response, body) => {
            if (error) {
                log(`企业微信推送失败: ${error}`);
            } else {
                log(`企业微信推送成功，状态码: ${response.status}`);
                if (body) {
                    const result = JSON.parse(body);
                    if (result.errcode !== 0) {
                        log(`企业微信API返回错误: ${result.errmsg}`);
                    }
                }
            }
        });

    } catch (e) {
        notify("脚本错误", e.message);
        log(`错误详情: ${e.stack}`);
    }
    
    $done();
})();
