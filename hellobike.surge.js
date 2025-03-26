/*
#!name=Hellobike Token Capture
#!desc=捕获并缓存 Hellobike Token 并通过企业微信通知

[Script]
http-request ^https:\/\/api\.hellobike\.com\/api\?common\.welfare\.signAndRecommend script-path=https://raw.githubusercontent.com/fengyunjay2004/Lexus/main/hellobike.surge.js,requires-body=true

[MITM]
hostname = api.hellobike.com
*/
const TEN_MINUTES = 10 * 60 * 1000;
const WECHAT_WEBHOOK = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=284b000b-784b-40b4-8a4a-893f4ab3b4b8";

function main() {
    const request = $request;
    if (!request) {
        $done({});
        return;
    }

    // 处理请求体和 URL
    const body = request.body;
    const url = request.url;

    if (url.includes("common.welfare.signAndRecommend")) {
        processToken(body);
    }
    
    $done({});
}

function processToken(body) {
    try {
        const tokenMatch = body.match(/"token":"([^"]+)"/);
        if (!tokenMatch) {
            $notification.post("失败", "未找到 Token", "请检查请求体");
            return;
        }

        const currentTime = new Date().getTime();
        const newToken = tokenMatch[1];
        
        // 从持久化存储获取 token 列表
        let cachedTokens = JSON.parse($persistentStore.read("tokenList") || "[]");
        const lastSavedTime = $persistentStore.read("tokenTime");
        
        // 清理过期 token
        cachedTokens = cachedTokens.filter(item => currentTime - item.timestamp < TEN_MINUTES);
        
        // 检查 token 是否已存在
        const exists = cachedTokens.some(item => item.token === newToken);
        if (!exists) {
            cachedTokens.push({
                token: newToken,
                timestamp: currentTime
            });
            
            $persistentStore.write(JSON.stringify(cachedTokens), "tokenList");
            $persistentStore.write(currentTime.toString(), "tokenTime");
            console.log(`Hellobike新Token添加成功: ${newToken}`);
        } else {
            console.log("抓取到的 Token 已存在，跳过保存");
        }
        
        // 发送通知
        sendWechatNotification(cachedTokens);
    } catch (error) {
        console.log(`处理 Token 时出错: ${error}`);
        $notification.post("脚本错误", error.toString(), "");
    }
}

function sendWechatNotification(tokens) {
    const message = {
        "msgtype": "text",
        "text": {
            "content": `Hellobike当前Token缓存：\n\n${tokens.map(item => `${item.token}`).join("@")}`
        }
    };

    $httpClient.post({
        url: WECHAT_WEBHOOK,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
    }, (error, response, data) => {
        if (error) {
            console.log(`通知发送失败: ${error}`);
        } else {
            console.log(`通知发送成功: ${response.status}`);
        }
    });
}

main();