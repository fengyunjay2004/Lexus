/*
#!name=Hellobike Token Capture
#!desc=捕获并缓存 Hellobike Token 并通过企业微信通知

[Script]
http-request ^https:\/\/api\.hellobike\.com\/api\?common\.welfare\.signAndRecommend script-path=https://raw.githubusercontent.com/fengyunjay2004/Lexus/main/hellobike.surge.js,requires-body=true

[MITM]
hostname = api.hellobike.com
*/
const TEN_MINUTES = 10 * 60 * 1000;

function main() {
    console.log(`[Debug] 检测到请求 URL: ${$request.url}`);
    
    if ($request.url.includes("common.welfare.signAndRecommend")) {
        console.log("[Debug] 进入 Token 处理流程");
        processToken($request.body);
    }
    
    $done({});
}

function processToken(body) {
    try {
        console.log(`[Debug] 原始请求体: ${body.substring(0, 200)}...`); // 截取部分内容避免日志过长
        
        const tokenMatch = body.match(/"token"\s*:\s*"([^"]+)"/);
        if (!tokenMatch) {
            $notification.post("错误", "未匹配到 Token", "请检查请求体格式");
            console.error("[Error] 正则匹配失败");
            return;
        }
        
        const newToken = tokenMatch[1];
        console.log(`[Debug] 提取到 Token: ${newToken}`);
        
        const currentTime = Date.now();
        let cachedTokens = JSON.parse($persistentStore.read("tokenList") || "[]");
        console.log(`[Debug] 当前缓存 Token 数量: ${cachedTokens.length}`);
        
        // 清理过期 Token
        cachedTokens = cachedTokens.filter(item => currentTime - item.timestamp < TEN_MINUTES);
        console.log(`[Debug] 清理后剩余 Token 数量: ${cachedTokens.length}`);
        
        // 检查是否已存在
        const exists = cachedTokens.some(item => item.token === newToken);
        if (!exists) {
            cachedTokens.push({ token: newToken, timestamp: currentTime });
            $persistentStore.write(JSON.stringify(cachedTokens), "tokenList");
            $persistentStore.write(currentTime.toString(), "tokenTime");
            console.log(`[Success] Token 已保存: ${newToken}`);
            $notification.post("新 Token 添加", newToken, "");
        } else {
            console.log("[Info] Token 已存在，无需重复保存");
        }
        
    } catch (error) {
        console.error(`[Error] 处理异常: ${error.stack}`);
        $notification.post("脚本崩溃", error.message, "");
    }
}

main();