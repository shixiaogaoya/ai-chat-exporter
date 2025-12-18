/**
 * Grok (xAI) 对话导出脚本
 * 使用方法: 在 grok.x.ai 或 x.com/i/grok 页面的控制台中运行此脚本
 */
(function() {
    const platformName = "Grok";
    console.log(`🚀 ${platformName} 导出脚本启动...`);
    
    const junkWords = ["复制", "Copy", "Regenerate", "重新生成", "编辑", "Edit", "重试", "Retry", "删除", "Delete", "分享", "Share"];
    let items = [];

    // 方案1: data-testid 消息容器 (2025年底版本)
    let messageContainers = document.querySelectorAll('div[data-testid^="conversation-turn-"], div[data-testid*="message"]');
    
    if (messageContainers.length > 0) {
        console.log(`✅ 方案1: 找到 ${messageContainers.length} 个 data-testid 消息容器`);
        
        messageContainers.forEach(container => {
            const text = container.innerText.trim();
            if (!text || text.length < 5) return;
            
            const isAssistant = container.querySelector('pre, code, [data-testid*="assistant"]') ||
                               container.querySelector('[class*="markdown"]') ||
                               text.length > 200;
            const role = isAssistant ? 'Grok' : 'User';
            
            items.push({ role, text });
        });
    }
    
    // 方案2: class 包含 message 的容器
    if (items.length === 0) {
        console.log('⚠️ 方案1失败,尝试方案2...');
        
        const classMessages = document.querySelectorAll('div[class*="message"], [role="article"]');
        
        if (classMessages.length > 0) {
            console.log(`✅ 方案2: 找到 ${classMessages.length} 个 class message 容器`);
            
            const seen = new Set();
            classMessages.forEach(msg => {
                const text = msg.innerText.trim();
                if (!text || text.length < 5 || seen.has(text)) return;
                seen.add(text);
                
                let role = 'User';
                if (msg.querySelector('pre') ||
                    msg.querySelector('code') ||
                    msg.querySelector('[class*="markdown"]') ||
                    msg.querySelector('button[aria-label*="Copy"]') ||
                    msg.innerHTML.includes('```') ||
                    text.length > 200) {
                    role = 'Grok';
                }
                
                items.push({ role, text });
            });
        }
    }
    
    // 方案3: X平台上的Grok特殊处理
    if (items.length === 0 && window.location.hostname.includes('x.com')) {
        console.log('⚠️ 方案2失败,尝试X平台Grok专用方案...');
        
        const xGrokMessages = document.querySelectorAll('[data-testid="cellInnerDiv"], [data-testid="tweetText"]');
        
        if (xGrokMessages.length > 0) {
            console.log(`✅ 方案3: 找到 ${xGrokMessages.length} 个X平台消息容器`);
            
            const seen = new Set();
            xGrokMessages.forEach(cell => {
                const text = cell.innerText.trim();
                if (text && text.length > 5 && !seen.has(text)) {
                    seen.add(text);
                    items.push({
                        role: (cell.innerHTML.includes('code') || text.length > 200) ? 'Grok' : 'User',
                        text
                    });
                }
            });
        }
    }
    
    // 方案4: 通用兜底方案
    if (items.length === 0) {
        console.log('🆘 启用方案4: 通用兜底方案...');
        
        const allContainers = Array.from(document.querySelectorAll('div'))
            .filter(el => {
                const text = el.innerText;
                const rect = el.getBoundingClientRect();
                return text && text.length > 10 && text.length < 5000 &&
                       rect.height > 20 && rect.width > 100 &&
                       !el.querySelector('input') && !el.querySelector('textarea') &&
                       !el.querySelector('button[type="submit"]');
            })
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        
        console.log(`🔍 方案4: 找到 ${allContainers.length} 个潜在容器`);
        
        let isUser = true;
        const seen = new Set();
        
        allContainers.forEach(container => {
            const text = container.innerText.trim();
            
            if (seen.has(text) || text.length < 5) return;
            seen.add(text);
            
            let role;
            if (container.querySelector('pre') || container.querySelector('code')) {
                role = 'Grok';
            } else if (text.length > 200) {
                role = 'Grok';
            } else if (text.length < 100) {
                role = 'User';
            } else {
                role = isUser ? 'User' : 'Grok';
                isUser = !isUser;
            }
            
            items.push({ role, text });
        });
    }

    // 导出
    if (items.length === 0) {
        alert(`⚠️ 未提取到内容，请确保对话已加载完成\n\n请尝试:\n1. 滚动页面到最底部\n2. 等待页面完全加载\n3. 刷新页面后重试`);
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

    console.log(`✅ Grok提取完成: ${items.length} 条消息`);
    alert(`✅ 导出成功! 有效消息: ${validCount} 条`);
})();
