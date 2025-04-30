const $ = new Env('上海油价监控');

// 主函数
!(async () => {
  try {
    $.log(`开始执行上海油价监控脚本 - ${new Date().toLocaleString()}`);
    
    // 发送 GET 请求
    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Proxy-Connection': 'keep-alive',
      'Referer': 'http://www.qiyoujiage.com/shanghai.shtml',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    };
    
    $.log("正在请求油价网站...");
    const response = await $.http.get({
      url: 'http://www.qiyoujiage.com/shanghai.shtml',
      headers: headers
    });
    
    $.log(`网站响应状态: ${response.response.statusCode}`);
    
    // 获取网页内容
    const html = response.body;
    //$.log(`获取到网页内容，长度: ${html.length} 字符`);
    
    // 定义正则表达式：从油价开始，到24时结束
    const keywordPattern = /油价(\d{1,2})月(\d{1,2})日24时[^。]*。/g;
    let match;
    
    // 查找所有符合“油价X月X日24时”格式的内容
    const results = [];
    while ((match = keywordPattern.exec(html)) !== null) {
      // 获取匹配的内容
      const contentText = match[0].replace(/\s+/g, ' ').trim();
      results.push(contentText);
    }
    
    // 如果找到匹配的内容，进行处理
    if (results.length > 0) {
      $.log(`找到${results.length}条符合条件的内容`);
      
      results.forEach(contentText => {
        // 使用正则表达式提取日期（例如 "4月17日"）
        const datePattern = /(\d{1,2})月(\d{1,2})日/;
        const dateMatch = contentText.match(datePattern);
        
        if (dateMatch) {
          const extractedDateStr = dateMatch[0];
          
          // 获取今天日期并格式化为 "4月18日"（去除前导零）
          const today = new Date();
          const todayStr = formatDate(today);
          
          // 计算昨天和明天的日期
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = formatDate(yesterday);
          
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = formatDate(tomorrow);
          
          // 判断提取的日期是否是昨天、今天或明天
          let message = null;
          if (extractedDateStr === todayStr) {
            message = `今日上海⛽️: ${contentText}`;
            $.log(`今天的消息: ${message}`);
          } else if (extractedDateStr === yesterdayStr) {
            message = `昨日上海⛽️: ${contentText}`;
            $.log(`昨天的消息: ${message}`);
          } else if (extractedDateStr === tomorrowStr) {
            message = `明日上海⛽️: ${contentText}`;
            $.log(`明天的消息: ${message}`);
          } else {
            $.log("提取的日期与今天相差超过一天，不发送通知。");
            return; // 如果日期不在今天、昨天或明天，就跳过
          }
          
          // 清理内容：去除HTML标签和多余空格
          const cleanContent = message.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
          
          // 发送通知
          $.notify("上海油价监控", "", cleanContent);
        } else {
          $.log("在提取的内容中未找到日期信息，跳过处理");
        }
      });
    } else {
      $.log("未找到符合条件的油价信息");
      $.notify("上海油价监控", "错误", "未找到符合条件的油价信息，网站可能已更改");
    }
    
  } catch (e) {
    $.log(`执行过程中发生错误: ${e.message}`);
    $.log(`错误堆栈: ${e.stack}`);
    $.notify("上海油价监控", "错误", `运行时出错: ${e.message}`);
  } finally {
    $.log("脚本执行完成");
    $.done();
  }
})();

// 格式化日期为 "4月18日" 格式（去除前导零）
function formatDate(date) {
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  return `${month}月${day}日`;
}

// Surge 环境模拟
function Env(name) {
  this.name = name;
  
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
  
  this.notify = (title, subtitle, message) => {
    $notification.post(title, subtitle, message);
    this.log(`通知: ${title} ${subtitle} ${message}`);
  };
  
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
  
  this.done = () => {
    this.log("脚本执行结束");
    $done({});
  };
}
