/**
 * 豆包 (Doubao) 对话导出脚本
 * 使用方法: 在 doubao.com 页面的控制台中运行此脚本
 */
(function() {
    const platformName = "Doubao";
    console.log(`🚀 ${platformName} 导出脚本启动...`);
    
    const junkWords = ["复制", "Copy", "Regenerate", "重新生成", "编辑", "Edit", "豆包", "Doubao", "重试", "Retry", "删除", "Delete", "分享", "Share"];
    let items = [];

    // 方案1: 尝试对话容器
    const conversations = document.querySelectorAll('[class*="conversation"], [class*="chat-message"], [class*="message-wrap"]');
    
    if (conversations.length > 0) {
        console.log(`✅ 方案1: 找到 ${conversations.length} 个对话容器`);
        conversations.forEach(conv => {
            const hasMarkdown = conv.querySelector('[class*="markdown"]') || conv.querySelector('pre') || conv.querySelector('code');
            const hasCopyBtn = conv.querySelector('button[class*="copy"]') || conv.innerHTML.includes('复制');
            
            let role = 'User';
            if (hasMarkdown || hasCopyBtn) {
                role = 'Doubao';
            }
            
            const text = conv.innerText;
            if (text && text.length > 2) {
                items.push({ role, text });
            }
        });
    }
    
    // 方案2: 尝试 message 类
    if (items.length === 0) {
        console.log('⚠️ 方案1失败,尝试方案2...');
        
        const allMessages = Array.from(document.querySelectorAll('div[class*="message"], div[role="article"]'))
            .filter(el => el.innerText.length > 5);
        
        allMessages.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        
        const processedTexts = new Set();
        
        allMessages.forEach(msg => {
            const text = msg.innerText.trim();
            
            if (processedTexts.has(text) || text.length < 2) return;
            processedTexts.add(text);
            
            let role = 'User';
            if (msg.querySelector('pre') || msg.querySelector('code') ||
                msg.querySelector('button') || msg.querySelector('[class*="markdown"]')) {
                role = 'Doubao';
            }
            
            items.push({ role, text });
        });
    }
    
    // 方案3: 通用文本抓取
    if (items.length === 0) {
        console.log('🆘 启用方案3: 通用文本抓取...');
        
        const textBlocks = Array.from(document.querySelectorAll('div, p'))
            .filter(el => {
                const text = el.innerText;
                return text && text.length > 10 && text.length < 5000 &&
                       !el.querySelector('button[class*="send"]') &&
                       !el.querySelector('input') &&
                       !el.querySelector('textarea');
            })
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        
        let isUser = true;
        const seen = new Set();
        
        textBlocks.forEach(block => {
            const text = block.innerText.trim();
            if (!seen.has(text) && text.length > 5) {
                seen.add(text);
                items.push({ role: isUser ? 'User' : 'Doubao', text });
                isUser = !isUser;
            }
        });
    }

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
