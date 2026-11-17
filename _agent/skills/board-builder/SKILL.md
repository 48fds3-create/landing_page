---
name: board-builder
description: GitHub API & Vercel 기반 정적 게시판 홈페이지 빌더 스킬
---

# Board Builder Skill

GitHub Contents API와 Vercel Serverless Function을 기반으로 동작하는 고성능 정적 게시판 빌더 스킬입니다.

## 아키텍처 개요
- **Frontend**: Clean URLs (`vercel.json`), Tailwind CSS, Vanilla JS
- **Backend**: Vercel Serverless Function (`/api/config.js`)
- **Database / Storage**: GitHub Repository (`data/posts.json`) via GitHub Contents API
- **Admin**: Client-side authentication via `sessionStorage` and serverless config sync
- **Markdown**: Pure JS Markdown-to-HTML & PlainText parser
