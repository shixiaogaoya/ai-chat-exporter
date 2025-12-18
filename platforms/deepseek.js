/**
 * DeepSeek 对话导出脚本
 * 使用方法: 在 chat.deepseek.com 页面的控制台中运行此脚本
 */
(function() {
    const platformName = "DeepSeek";
    console.log(`🚀 ${platformName} 导出脚本启动...`);
    
    const junkWords = ["复制", "Copy", "Regenerate", "重新生成", "编辑", "Edit", "重试", "Retry", "删除", "Delete", "分享", "Share"];
    let items = [];

    const dsNodes = document.querySelectorAll('.ds-markdown, .ds-user-message, [class*="message-content"]');
    dsNodes.forEach(node => {
        let role = 'User';
        if (node.classList.contains('ds-markdown') || node.innerHTML.includes('ds-markdown')) {
            role = 'DeepSeek';
        }
        items.push({ role, text: node.innerText });
    });

    // 导出
    if (items.length === 0) {
        alert(`⚠️ 未提取到内容，请确保对话已加载完成`);
        return;
    }

    let finalContent = `${platformName} 对话导出\n导出时间: ${new Date().toLocaleString()}\n共 ${items.length} 条消息\n${"=".repeat(50)}\n\n`;
    let validCount = 0;
    
    items.forEach(item => {
        let text = item.text;
        junkWords.forEach(jw => { text = text.replace(new RegExp(jw, 'g'), ''); });
        text = text.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
        
        if (text.length > 1) {
            validCount++;
            finalContent += `\n【${item.role}】 (#${validCount}):\n${text}\n\n${"-".repeat(50)}\n`;
        }
    });

    const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${platformName}_Export_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert(`✅ 导出成功! 有效消息: ${validCount} 条`);
})();
