/**
 * 通义千问 (Tongyi Qianwen) 对话导出脚本
 * 使用方法: 在 www.qianwen.com 或 tongyi.aliyun.com 页面的控制台中运行此脚本
 */
(function() {
    const platformName = "通义千问";
    console.log(`🚀 ${platformName} 导出脚本启动...`);
    
    const junkWords = ["复制", "Copy", "Regenerate", "重新生成", "编辑", "Edit", "重试", "Retry", "删除", "Delete", "分享", "Share"];
    let items = [];

    // 方案1: 标准消息选择器
    const qwenMessages = document.querySelectorAll('[class*="message-item"], [class*="chat-item"], [data-role]');
    
    if (qwenMessages.length > 0) {
        console.log(`✅ 方案1: 找到 ${qwenMessages.length} 条消息`);
        qwenMessages.forEach(msg => {
            const dataRole = msg.getAttribute('data-role');
            let role = 'User';
            
            if (dataRole === 'assistant' || dataRole === 'ai' ||
                msg.querySelector('[class*="markdown"]') ||
                msg.querySelector('pre') ||
                msg.innerHTML.includes('qwen')) {
                role = '通义千问';
            }
            
            items.push({ role, text: msg.innerText });
        });
    }
    
    // 方案2: markdown 内容块
    if (items.length === 0) {
        console.log('⚠️ 方案1失败,尝试方案2...');
        
        const markdowns = document.querySelectorAll('[class*="markdown"], [class*="content"]');
        const allBlocks = Array.from(markdowns).filter(el => el.innerText.length > 5);
        allBlocks.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        
        let isUser = true;
        const seen = new Set();
        
        allBlocks.forEach(block => {
            const text = block.innerText.trim();
            if (!seen.has(text) && text.length > 2) {
                seen.add(text);
                
                let role = 'User';
                if (block.querySelector('code') || block.querySelector('pre') ||
                    text.includes('```') || block.classList.toString().includes('markdown')) {
                    role = '通义千问';
                } else {
                    role = isUser ? 'User' : '通义千问';
                    isUser = !isUser;
                }
                
                items.push({ role, text });
            }
        });
    }
    
    // 方案3: 通用提取
    if (items.length === 0) {
        console.log('🆘 启用方案3: 通用提取...');
        
        const allDivs = Array.from(document.querySelectorAll('div'))
            .filter(div => {
                const text = div.innerText;
                return text && text.length > 10 && text.length < 3000 &&
                       !div.querySelector('input') && !div.querySelector('textarea');
            })
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        
        let isUser = true;
        const seen = new Set();
        
        allDivs.forEach(div => {
            const text = div.innerText.trim();
            if (!seen.has(text) && text.length > 5) {
                seen.add(text);
                items.push({ role: isUser ? 'User' : '通义千问', text });
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
    a.download = `TongyiQianwen_Export_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert(`✅ 导出成功! 有效消息: ${validCount} 条`);
})();
