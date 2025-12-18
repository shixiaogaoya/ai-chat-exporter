(function() {
    const host = window.location.hostname;
    console.log(`🚀 AI Chat Exporter v17.0 启动... 站点: ${host}`);
    let items = [];
    let platformName = "Unknown";
   
    // 需要过滤的UI元素文本
    const junkWords = [
        "复制", "Copy", "Regenerate", "重新生成", "编辑", "Edit",
        "听回答", "Show drafts", "搜索", "停止生成", "继续", "Continue",
        "Was this response better?", "Enter to send", "Copy code",
        "4o", "Thinking Process", "豆包", "Doubao", "GLM", "智谱",
        "重试", "Retry", "删除", "Delete", "分享", "Share",
        "点赞", "赞", "踩", "收藏", "Favorite", "Read aloud"
    ];
    // ==========================================
    // 1. Kimi ✅
    // ==========================================
    if (host.includes('kimi') || host.includes('moonshot')) {
        platformName = "Kimi";
        const aiMessages = Array.from(document.querySelectorAll('.markdown-body'));
        const userMessages = Array.from(document.querySelectorAll('[class*="user-message"], [class*="UserMessage"], .justify-end [class*="message"], .pop-user-message'));
        let tempItems = [];
        aiMessages.forEach(node => tempItems.push({ role: 'Kimi', node, text: node.innerText }));
        userMessages.forEach(node => tempItems.push({ role: 'User', node, text: node.innerText }));
        if (tempItems.length < 2) {
             console.log('Kimi 启用视觉兜底...');
             const allDivs = Array.from(document.querySelectorAll('div[class*="content"], div[class*="text"]'))
                .filter(div => div.innerText.length > 5 && !div.querySelector('button'))
                .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
             let isUser = true;
             allDivs.forEach(div => {
                 if (!items.some(it => it.text === div.innerText)) {
                     items.push({ role: isUser ? 'User' : 'Kimi', text: div.innerText });
                     isUser = !isUser;
                 }
             });
        } else {
            tempItems.sort((a, b) => a.node.getBoundingClientRect().top - b.node.getBoundingClientRect().top);
            tempItems.forEach(it => { if (!items.some(exist => exist.text === it.text)) items.push({role: it.role, text: it.text}); });
        }
    }
    // ==========================================
    // 2. 智谱清言 (ChatGLM) ✅
    // ==========================================
    else if (host.includes('chatglm')) {
        platformName = "Zhipu (智谱)";
       
        const bubbles = document.querySelectorAll('.enter-active, .bubble-container, .message-item');
       
        if (bubbles.length > 0) {
            bubbles.forEach(bubble => {
                let role = 'User';
                if (bubble.querySelector('.markdown-body') || bubble.innerHTML.includes('code-block-wrapper')) {
                    role = 'ChatGLM';
                }
                items.push({ role, text: bubble.innerText });
            });
        } else {
            document.querySelectorAll('.markdown-body').forEach(n => items.push({role:'ChatGLM', node:n, text:n.innerText}));
            document.querySelectorAll('div[class*="row-reverse"] .bubble-content').forEach(n => items.push({role:'User', node:n, text:n.innerText}));
            items.sort((a,b) => (a.node ? a.node.getBoundingClientRect().top : 0) - (b.node ? b.node.getBoundingClientRect().top : 0));
        }
    }
    // ==========================================
    // 3. 豆包 (Doubao) 🔧
    // ==========================================
    else if (host.includes('doubao')) {
        platformName = "Doubao (豆包)";
        console.log('🔍 豆包检测模式启动...');
       
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
       
        if (items.length === 0) {
            console.log('⚠️ 方案1失败,尝试方案2...');
           
            const allMessages = Array.from(document.querySelectorAll('div[class*="message"], div[role="article"]'))
                .filter(el => el.innerText.length > 5);
           
            console.log(`🔍 方案2: 找到 ${allMessages.length} 个潜在消息`);
           
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
           
            console.log(`🔍 方案3: 找到 ${textBlocks.length} 个文本块`);
           
            let isUser = true;
            const seen = new Set();
           
            textBlocks.forEach(block => {
                const text = block.innerText.trim();
                if (!seen.has(text) && text.length > 5) {
                    seen.add(text);
                    items.push({
                        role: isUser ? 'User' : 'Doubao',
                        text
                    });
                    isUser = !isUser;
                }
            });
        }
       
        console.log(`✅ 豆包提取完成: ${items.length} 条消息`);
    }
    // ==========================================
    // 4. ChatGPT ✅
    // ==========================================
    else if (host.includes('chatgpt') || host.includes('openai')) {
        platformName = "ChatGPT";
        document.querySelectorAll('article').forEach(turn => {
            let role = turn.querySelector('[data-message-author-role="user"]') ? 'User' : 'ChatGPT';
            let clone = turn.cloneNode(true);
            clone.querySelectorAll('.bg-gray-800').forEach(el => el.remove());
            items.push({ role, text: clone.innerText });
        });
    }
    // ==========================================
    // 5. DeepSeek ✅
    // ==========================================
    else if (host.includes('deepseek')) {
        platformName = "DeepSeek";
        const dsNodes = document.querySelectorAll('.ds-markdown, .ds-user-message, [class*="message-content"]');
        dsNodes.forEach(node => {
            let role = 'User';
            if (node.classList.contains('ds-markdown') || node.innerHTML.includes('ds-markdown')) role = 'DeepSeek';
            items.push({ role, text: node.innerText });
        });
    }
    // ==========================================
    // 6. Claude ✅
    // ==========================================
    else if (host.includes('claude')) {
        platformName = "Claude";
        console.log('🔍 Claude 检测模式启动...');
       
        const messages = document.querySelectorAll('[data-testid="user-message"], [data-testid="assistant-message"]');
       
        if (messages.length > 0) {
            console.log(`✅ 方案1成功: 找到 ${messages.length} 条消息`);
            messages.forEach(msg => {
                const isUser = msg.getAttribute('data-testid') === 'user-message';
                const role = isUser ? 'User' : 'Claude';
                items.push({ role, text: msg.innerText });
            });
        } else {
            const oldMessages = document.querySelectorAll('.font-user-message, .font-claude-message');
            if (oldMessages.length > 0) {
                console.log(`✅ 方案2成功: 找到 ${oldMessages.length} 条消息`);
                oldMessages.forEach(msg => {
                    const role = msg.classList.contains('font-user-message') ? 'User' : 'Claude';
                    items.push({ role, text: msg.innerText });
                });
            } else {
                console.log('⚠️ 启用方案3: 通用检测模式...');
                const allContainers = Array.from(document.querySelectorAll('div[class*="message"], div[class*="chat"], div[role="article"]'))
                    .filter(el => el.innerText.length > 10);
               
                allContainers.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
               
                let isUserTurn = true;
                const processedTexts = new Set();
               
                allContainers.forEach(container => {
                    const text = container.innerText.trim();
                    if (processedTexts.has(text)) return;
                    processedTexts.add(text);
                   
                    let role;
                    if (container.innerHTML.includes('code') || container.querySelector('pre')) {
                        role = 'Claude';
                    } else if (text.length < 100 && !container.querySelector('button')) {
                        role = 'User';
                    } else {
                        role = isUserTurn ? 'User' : 'Claude';
                        isUserTurn = !isUserTurn;
                    }
                   
                    items.push({ role, text });
                });
            }
        }
    }
    // ==========================================
    // 7. Gemini ✅
    // ==========================================
    else if (host.includes('google') || host.includes('gemini')) {
        platformName = "Gemini";
        const findBlock = (n, d) => {
            let p = n;
            for(let i=0; i<d; i++) {
                if(!p) break;
                if(p.tagName==='DIV' && p.innerText.length>5) return p;
                p=p.parentElement;
            }
            return n.parentElement;
        };
        let rawNodes = [];
        document.querySelectorAll('button[aria-label="复制提示"]').forEach(b => rawNodes.push({role: 'User', node: findBlock(b, 5)}));
        document.querySelectorAll('button[aria-label="听回答"]').forEach(b => rawNodes.push({role: 'Gemini', node: findBlock(b, 10)}));
        rawNodes.sort((a,b) => a.node.getBoundingClientRect().top - b.node.getBoundingClientRect().top);
        rawNodes.forEach(n => items.push({role: n.role, text: n.node.innerText}));
    }
    // ==========================================
    // 8. Qwen Chat / 千问 🔧
    // ==========================================
    else if (host.includes('qwen') || host.includes('tongyi') || host.includes('qianwen')) {
        platformName = "Qwen Chat (千问)";
        console.log('🔍 千问检测模式启动...');
       
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
                    role = 'Qwen';
                }
               
                items.push({ role, text: msg.innerText });
            });
        }
       
        if (items.length === 0) {
            console.log('⚠️ 方案1失败,尝试方案2...');
           
            const markdowns = document.querySelectorAll('[class*="markdown"], [class*="content"]');
            console.log(`🔍 找到 ${markdowns.length} 个内容块`);
           
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
                        role = 'Qwen';
                    } else {
                        role = isUser ? 'User' : 'Qwen';
                        isUser = !isUser;
                    }
                   
                    items.push({ role, text });
                }
            });
        }
       
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
                    items.push({
                        role: isUser ? 'User' : 'Qwen',
                        text
                    });
                    isUser = !isUser;
                }
            });
        }
       
        console.log(`✅ 千问提取完成: ${items.length} 条消息`);
    }
    // ==========================================
    // 9. Grok (xAI)
    // ==========================================
    else if (host.includes('grok') || host.includes('x.com/i/grok') || host.includes('x.com')) {
        platformName = "Grok (xAI)";
        console.log('🔍 Grok 检测模式启动...');
       
        // 方案1: 尝试 data-testid 消息容器 (2025年底版本)
        let messageContainers = document.querySelectorAll('div[data-testid^="conversation-turn-"], div[data-testid*="message"]');
       
        if (messageContainers.length > 0) {
            console.log(`✅ 方案1: 找到 ${messageContainers.length} 个 data-testid 消息容器`);
           
            messageContainers.forEach(container => {
                const text = container.innerText.trim();
                if (!text || text.length < 5) return;
               
                // 判断角色: Grok的AI回复通常包含Markdown/代码/按钮或更长
                const isAssistant = container.querySelector('pre, code, [data-testid*="assistant"]') ||
                                   container.querySelector('[class*="markdown"]') ||
                                   text.length > 200;
                const role = isAssistant ? 'Grok' : 'User';
               
                items.push({ role, text });
            });
        }
       
        // 方案2: 尝试 class 包含 message 的容器
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
        if (items.length === 0 && host.includes('x.com')) {
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
       
        console.log(`✅ Grok提取完成: ${items.length} 条消息`);
    }
    else {
        alert("⚠️ 不支持该站点!\n\n目前支持:\n✅ Kimi\n✅ 智谱清言\n✅ 豆包\n✅ ChatGPT\n✅ Claude\n✅ DeepSeek\n✅ Gemini\n✅ 千问/Qwen Chat\n✅ Grok");
        return;
    }
    // ==========================================
    // 🧹 清理和导出
    // ==========================================
    if (items.length === 0) {
        alert(`⚠️ 在 [${platformName}] 未提取到内容!\n\n请尝试:\n1. 滚动页面到最底部\n2. 等待页面完全加载\n3. 刷新页面后重试\n4. 在控制台查看详细日志`);
        console.log('❌ 调试信息: 未找到任何消息');
        console.log('💡 提示: 请截图控制台日志并反馈');
        return;
    }
    console.log(`📊 原始提取: ${items.length} 条消息`);
    let finalContent = `${platformName} 对话导出 (v17.0)\n导出时间: ${new Date().toLocaleString()}\n共 ${items.length} 条消息\n${"=".repeat(50)}\n\n`;
   
    let validCount = 0;
    items.forEach((item, index) => {
        let text = item.text;
        if (!text) return;
       
        // 清理垃圾词汇
        junkWords.forEach(jw => {
            const regex = new RegExp(jw, 'g');
            text = text.replace(regex, '');
        });
       
        // 清理多余空行
        text = text.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
       
        if (text.length > 1) {
            validCount++;
            finalContent += `\n【${item.role}】 (#${validCount}):\n${text}\n\n${"-".repeat(50)}\n`;
        }
    });
    // 创建下载
    const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${platformName.replace(/\s+/g, '_')}_Export_${new Date().toISOString().slice(0,10)}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log(`✅ [${platformName}] 导出完成!`);
    console.log(`📈 统计: 原始${items.length}条 → 有效${validCount}条`);
   
    alert(`✅ 导出成功!\n\n平台: ${platformName}\n有效消息: ${validCount} 条\n文件已保存到下载文件夹\n\n文件名: ${platformName.replace(/\s+/g, '_')}_Export_${new Date().toISOString().slice(0,10)}.txt`);
   
})();