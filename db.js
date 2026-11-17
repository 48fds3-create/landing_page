let _config = null;

async function loadConfig() {
  if (_config) return _config;
  let api = {}, file = {};
  try { const r = await fetch('/api/config'); if (r.ok) api = await r.json(); } catch(e) {}
  try { const r = await fetch('config/git_config.json'); if (r.ok) file = await r.json(); } catch(e) {}
  const apiTok = String(api.github_token || '').trim();
  const fileTok = String(file.github_token || '').trim();
  _config = {
    github_token: (apiTok && apiTok !== 'YOUR_GITHUB_TOKEN') ? apiTok : fileTok,
    github_owner: file.github_owner || '',
    github_repo: file.github_repo || '',
    data_file_path: file.data_file_path || 'data/posts.json',
    admin_password: api.admin_password || file.admin_password || 'admin1234'
  };
  return _config;
}

function isAdmin() {
  return sessionStorage.getItem('isAdmin') === 'true';
}

function requireAdmin() {
  if (!isAdmin()) {
    window.location.href = 'admin.html';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarkdown(src) {
  if (!src) return '';

  const codeBlocks = [];
  let text = src.replace(/```([\s\S]*?)```/g, (match, code) => {
    const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
    codeBlocks.push(escapeHtml(code.trim()));
    return placeholder;
  });

  const lines = text.split('\n');
  const renderedLines = [];
  let inList = false;
  let listType = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (/^#{1,6}\s+/.test(line)) {
      if (inList) {
        renderedLines.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
      }
      const level = line.match(/^#{1,6}/)[0].length;
      const content = parseInline(line.replace(/^#{1,6}\s+/, ''));
      renderedLines.push(`<h${level} class="font-bold my-4 text-gray-900">${content}</h${level}>`);
      continue;
    }

    if (/^---$/.test(line.trim())) {
      if (inList) {
        renderedLines.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
      }
      renderedLines.push('<hr class="my-6 border-gray-200"/>');
      continue;
    }

    if (/^>\s+/.test(line)) {
      if (inList) {
        renderedLines.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
      }
      const quote = parseInline(line.replace(/^>\s+/, ''));
      renderedLines.push(`<blockquote class="border-l-4 border-[#03c75a] pl-4 py-1 my-3 bg-[#e8f7ee]/30 text-gray-700 italic">${quote}</blockquote>`);
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.*)/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) renderedLines.push(listType === 'ol' ? '</ol>' : '</ul>');
        renderedLines.push('<ul class="list-disc list-inside my-3 space-y-1 text-gray-700">');
        inList = true;
        listType = 'ul';
      }
      renderedLines.push(`<li>${parseInline(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = line.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) renderedLines.push(listType === 'ol' ? '</ol>' : '</ul>');
        renderedLines.push('<ol class="list-decimal list-inside my-3 space-y-1 text-gray-700">');
        inList = true;
        listType = 'ol';
      }
      renderedLines.push(`<li>${parseInline(olMatch[1])}</li>`);
      continue;
    }

    if (inList) {
      renderedLines.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false;
    }

    if (line.trim() === '') {
      continue;
    }

    renderedLines.push(`<p class="my-3 leading-relaxed text-gray-800">${parseInline(line)}</p>`);
  }

  if (inList) {
    renderedLines.push(listType === 'ol' ? '</ol>' : '</ul>');
  }

  let finalHtml = renderedLines.join('\n');

  codeBlocks.forEach((code, idx) => {
    finalHtml = finalHtml.replace(
      `__CODEBLOCK_${idx}__`,
      `<pre class="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto text-sm my-4 font-mono"><code>${code}</code></pre>`
    );
  });

  return finalHtml;
}

function parseInline(str) {
  if (!str) return '';

  const segments = str.split('`');
  let result = '';

  for (let i = 0; i < segments.length; i++) {
    if (i % 2 === 1) {
      result += `<code class="bg-gray-100 text-[#03c75a] font-mono px-1.5 py-0.5 rounded text-sm">${escapeHtml(segments[i])}</code>`;
    } else {
      let segment = escapeHtml(segments[i]);

      segment = segment.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      segment = segment.replace(/~~(.*?)~~/g, '<del>$1</del>');
      segment = segment.replace(/\*(.*?)\*/g, '<em>$1</em>');

      segment = segment.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, url) => {
        const cleanUrl = url.trim();
        if (/^(https?:\/\/|mailto:)/i.test(cleanUrl)) {
          return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-[#03c75a] underline hover:text-[#029e46]">${txt}</a>`;
        }
        return txt;
      });

      result += segment;
    }
  }

  return result;
}

function markdownToText(src) {
  if (!src) return '';
  return src
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/---/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getPosts() {
  const local = localStorage.getItem('posts_cache');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        fetchPostsFromRemote().catch(() => {});
        return parsed;
      }
    } catch (e) {}
  }
  return await fetchPostsFromRemote();
}

async function fetchPostsFromRemote() {
  const config = await loadConfig();
  const token = (config.github_token || '').replace(/\s+/g, '');
  const owner = config.github_owner;
  const repo = config.github_repo;
  const path = config.data_file_path || 'data/posts.json';

  if (token && token !== 'YOUR_GITHUB_TOKEN' && owner && repo) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const contentStr = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        const posts = JSON.parse(contentStr);
        localStorage.setItem('posts_cache', JSON.stringify(posts));
        localStorage.setItem('posts_sha', data.sha);
        return posts;
      }
    } catch (e) {}
  }

  try {
    const res = await fetch(path + '?t=' + Date.now());
    if (res.ok) {
      const posts = await res.json();
      localStorage.setItem('posts_cache', JSON.stringify(posts));
      return posts;
    }
  } catch (e) {}

  return [];
}

async function getPost(id) {
  const posts = await getPosts();
  return posts.find(p => String(p.id) === String(id)) || null;
}

async function savePost(post) {
  const config = await loadConfig();
  let posts = await getPosts();

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  if (post.id) {
    const idx = posts.findIndex(p => String(p.id) === String(post.id));
    if (idx !== -1) {
      posts[idx] = {
        ...posts[idx],
        ...post,
        updated_at: dateStr
      };
    } else {
      posts.unshift({
        ...post,
        id: post.id,
        created_at: post.created_at || dateStr,
        updated_at: dateStr
      });
    }
  } else {
    const newId = Date.now().toString();
    posts.unshift({
      ...post,
      id: newId,
      created_at: dateStr,
      updated_at: dateStr,
      views: 0
    });
  }

  localStorage.setItem('posts_cache', JSON.stringify(posts));
  await syncPostsToGithub(posts, config);
  return posts;
}

async function deletePost(id) {
  const config = await loadConfig();
  let posts = await getPosts();
  posts = posts.filter(p => String(p.id) !== String(id));
  localStorage.setItem('posts_cache', JSON.stringify(posts));
  await syncPostsToGithub(posts, config);
  return posts;
}

async function syncPostsToGithub(posts, config) {
  const token = (config.github_token || '').replace(/\s+/g, '');
  const owner = config.github_owner;
  const repo = config.github_repo;
  const path = config.data_file_path || 'data/posts.json';

  if (!token || token === 'YOUR_GITHUB_TOKEN' || !owner || !repo) {
    return false;
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  let sha = localStorage.getItem('posts_sha') || '';

  try {
    const checkRes = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }
  } catch (e) {}

  const jsonStr = JSON.stringify(posts, null, 2);
  const utf8Base64 = btoa(unescape(encodeURIComponent(jsonStr)));

  const payload = {
    message: 'feat(board): update posts via admin',
    content: utf8Base64
  };
  if (sha) payload.sha = sha;

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (putRes.ok) {
    const resData = await putRes.json();
    if (resData.content && resData.content.sha) {
      localStorage.setItem('posts_sha', resData.content.sha);
    }
    return true;
  } else {
    const errData = await putRes.json().catch(() => ({}));
    throw new Error(errData.message || 'GitHub 동기화 실패');
  }
}

async function getInquiries() {
  const local = localStorage.getItem('inquiries_cache');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        fetchInquiriesFromRemote().catch(() => {});
        return parsed;
      }
    } catch (e) {}
  }
  return await fetchInquiriesFromRemote();
}

async function fetchInquiriesFromRemote() {
  const config = await loadConfig();
  const token = (config.github_token || '').replace(/\s+/g, '');
  const owner = config.github_owner;
  const repo = config.github_repo;
  const path = 'data/inquiries.json';

  if (token && token !== 'YOUR_GITHUB_TOKEN' && owner && repo) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const contentStr = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        const inquiries = JSON.parse(contentStr);
        localStorage.setItem('inquiries_cache', JSON.stringify(inquiries));
        localStorage.setItem('inquiries_sha', data.sha);
        return inquiries;
      }
    } catch (e) {}
  }

  try {
    const res = await fetch(path + '?t=' + Date.now());
    if (res.ok) {
      const inquiries = await res.json();
      localStorage.setItem('inquiries_cache', JSON.stringify(inquiries));
      return inquiries;
    }
  } catch (e) {}

  return [];
}

async function saveInquiry(inquiry) {
  const config = await loadConfig();
  let inquiries = await getInquiries();

  const now = new Date();
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19);

  const newId = Date.now().toString();
  const newEntry = {
    ...inquiry,
    id: newId,
    status: inquiry.status || 'pending',
    created_at: kstTime
  };

  inquiries.unshift(newEntry);
  localStorage.setItem('inquiries_cache', JSON.stringify(inquiries));

  try {
    await syncInquiriesToGithub(inquiries, config);
  } catch (e) {
    console.warn('Inquiry remote sync failed, saved locally:', e);
  }

  return newEntry;
}

async function updateInquiryStatus(id, newStatus) {
  const config = await loadConfig();
  let inquiries = await getInquiries();
  const target = inquiries.find(item => String(item.id) === String(id));
  if (target) {
    target.status = newStatus;
    localStorage.setItem('inquiries_cache', JSON.stringify(inquiries));
    await syncInquiriesToGithub(inquiries, config);
  }
  return inquiries;
}

async function deleteInquiry(id) {
  const config = await loadConfig();
  let inquiries = await getInquiries();
  inquiries = inquiries.filter(item => String(item.id) !== String(id));
  localStorage.setItem('inquiries_cache', JSON.stringify(inquiries));
  await syncInquiriesToGithub(inquiries, config);
  return inquiries;
}

async function syncInquiriesToGithub(inquiries, config) {
  const token = (config.github_token || '').replace(/\s+/g, '');
  const owner = config.github_owner;
  const repo = config.github_repo;
  const path = 'data/inquiries.json';

  if (!token || token === 'YOUR_GITHUB_TOKEN' || !owner || !repo) {
    return false;
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  let sha = localStorage.getItem('inquiries_sha') || '';

  try {
    const checkRes = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }
  } catch (e) {}

  const jsonStr = JSON.stringify(inquiries, null, 2);
  const utf8Base64 = btoa(unescape(encodeURIComponent(jsonStr)));

  const payload = {
    message: 'feat(inquiry): update inquiries',
    content: utf8Base64
  };
  if (sha) payload.sha = sha;

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (putRes.ok) {
    const resData = await putRes.json();
    if (resData.content && resData.content.sha) {
      localStorage.setItem('inquiries_sha', resData.content.sha);
    }
    return true;
  } else {
    const errData = await putRes.json().catch(() => ({}));
    throw new Error(errData.message || 'GitHub 동기화 실패');
  }
}
