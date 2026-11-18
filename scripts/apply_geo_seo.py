# -*- coding: utf-8 -*-
import re

# 1. index.html 업데이트
with open(r'c:\Users\윤성원\Desktop\랜딩\index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

index_meta_block = '''  <meta name="description" content="플러스 공인중개사 사무소 - 대한민국 법원 등록 매수신청대리 전문. 전국 부동산 법원경매 정밀 권리분석, 현장 시세조사, 최적 입찰가 산정, 입찰대리 및 인도명령·이사 협의 지원. 유선 무료상담 032-462-7262."/>
  <meta name="keywords" content="부동산경매, 법원경매, 경매매수대리, 권리분석, 입찰대리, 법원등록공인중개사, 아파트경매, 경매컨설팅, 인천경매, 서울경매, 전국법원경매"/>
  <meta name="author" content="플러스 공인중개사 사무소"/>
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/>
  <link rel="canonical" href="https://plus-auction.vercel.app/"/>

  <!-- Open Graph / SNS -->
  <meta property="og:type" content="website"/>
  <meta property="og:locale" content="ko_KR"/>
  <meta property="og:site_name" content="플러스 공인중개사 사무소"/>
  <meta property="og:title" content="플러스 공인중개사 사무소 - 전국 부동산 법원경매·매수대리 전문"/>
  <meta property="og:description" content="전국 어디서나 전화 한 통으로 권리분석부터 입찰대리까지 편안하게! 15년 실전 노하우 법원 등록 공인중개사의 1:1 맞춤 무료 경매 상담."/>
  <meta property="og:url" content="https://plus-auction.vercel.app/"/>
  <meta property="og:image" content="https://plus-auction.vercel.app/screen.png"/>

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="플러스 공인중개사 사무소 - 법원경매 매수대리 전문"/>
  <meta name="twitter:description" content="전국 부동산 법원경매 정밀 권리분석, 현장 시세조사, 법원 입찰대리, 명도 협의 지원."/>
  <meta name="twitter:image" content="https://plus-auction.vercel.app/screen.png"/>

  <!-- GEO & Local SEO Tags -->
  <meta name="geo.region" content="KR-28"/>
  <meta name="geo.placename" content="인천광역시"/>
  <meta name="geo.position" content="37.4563;126.7052"/>
  <meta name="ICBM" content="37.4563, 126.7052"/>

  <!-- LLM Context Discovery (GEO) -->
  <link rel="help" type="text/plain" href="/llms.txt" title="LLM Context"/>

  <!-- Schema.org Structured Data (JSON-LD) for Search Engines & AI Models -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["RealEstateAgent", "LocalBusiness"],
        "@id": "https://plus-auction.vercel.app/#organization",
        "name": "플러스 공인중개사 사무소",
        "alternateName": "Plus Real Estate Auction Consulting",
        "url": "https://plus-auction.vercel.app/",
        "logo": "https://plus-auction.vercel.app/profile.png",
        "image": "https://plus-auction.vercel.app/screen.png",
        "description": "대한민국 법원 공식 등록 매수신청대리 공인중개사. 전국 부동산 법원경매 정밀 권리분석, 현장 시세조사, 법원 입찰대리 및 인도명령 절차 안내 지원.",
        "telephone": "+82-32-462-7262",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Incheon",
          "addressCountry": "KR"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 37.4563,
          "longitude": 126.7052
        },
        "areaServed": [
          {
            "@type": "AdministrativeArea",
            "name": "대한민국 전역 (전국 각급 법원 경매)"
          },
          {
            "@type": "AdministrativeArea",
            "name": "수도권 (서울, 인천, 경기)"
          }
        ],
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "09:00",
            "closes": "18:00"
          }
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "법원경매 4대 핵심 서비스",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "정밀 권리분석 및 리스크 차단",
                "description": "말소기준권리, 선순위 임차인, 유치권 등 법적·경제적 리스크 사전 완전 차단"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "현장 시세 조사 및 최적 입찰가 산정",
                "description": "국토부 실거래가 및 급매가 기반 안전마진 확보 최적 낙찰가 제안"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "법원 매수신청대리 및 입찰 동행",
                "description": "법원 등록 공인중개사의 합법적 대리 입찰 및 서류 검증"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "낙찰 후 잔금 대출 및 명도 협의 지원",
                "description": "최저금리 경락잔금대출 연계, 원만한 이사 협의 및 인도명령 신청 안내"
              }
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://plus-auction.vercel.app/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "경매 사건번호 없이도 상담 신청이 가능한가요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "네, 가능합니다. 관심 지역이나 원하시는 부동산 종류(아파트, 상가 등)만 알려주셔도 현재 진행 중인 우량 추천 경매 물건 선별 및 맞춤 권리분석 상담이 가능합니다."
            }
          },
          {
            "@type": "Question",
            "name": "전국 어디서나 비대면으로 경매 매수대리를 맡길 수 있나요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "네, 방문 없이 전국 어디서나 유선 전화 한 통으로 1:1 비대면 전문 상담과 위임장 작성을 통해 안전하게 입찰대리를 진행할 수 있습니다."
            }
          },
          {
            "@type": "Question",
            "name": "낙찰 후 명도(이사) 절차는 어떻게 지원되나요?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "변호사법을 준수하여 합법적인 인도명령 신청 절차를 안내해 드리며, 점유자와의 원만한 이사비 협의를 지원하여 평화롭고 신속한 입주를 돕습니다."
            }
          }
        ]
      }
    ]
  }
  </script>
'''

# index.html의 </head> 앞에 메타블록 삽입 (기존에 없다면)
if 'name="geo.region"' not in index_content:
    index_content = index_content.replace('</head>', index_meta_block + '\n</head>', 1)
    with open(r'c:\Users\윤성원\Desktop\랜딩\index.html', 'w', encoding='utf-8') as f:
        f.write(index_content)
    print("[OK] index.html GEO & SEO 메타 태그 및 Schema.org 삽입 완료")
else:
    print("[SKIP] index.html 이미 GEO 태그 존재")

# 2. news.html 업데이트
with open(r'c:\Users\윤성원\Desktop\랜딩\news.html', 'r', encoding='utf-8') as f:
    news_content = f.read()

news_meta_block = '''  <meta name="description" content="플러스 공인중개사 사무소 경매 소식 & 칼럼 - 부동산 법원경매 시장 분석, 낙찰가율 동향, 미납 관리비 판례 분석, 선순위 임차인 권리분석 실전 가이드."/>
  <meta name="keywords" content="경매칼럼, 법원경매뉴스, 낙찰가율, 권리분석, 대항력임차인, 경매관리비, 플러스공인중개사"/>
  <meta name="robots" content="index, follow"/>
  <link rel="canonical" href="https://plus-auction.vercel.app/news.html"/>

  <!-- Open Graph -->
  <meta property="og:type" content="article"/>
  <meta property="og:locale" content="ko_KR"/>
  <meta property="og:site_name" content="플러스 공인중개사 사무소"/>
  <meta property="og:title" content="부동산 법원경매 소식 & 칼럼 | 플러스 공인중개사 사무소"/>
  <meta property="og:description" content="최신 부동산 법원경매 시장 분석, 실전 낙찰 사례 및 권리분석 심층 칼럼."/>
  <meta property="og:url" content="https://plus-auction.vercel.app/news.html"/>
  <meta property="og:image" content="https://plus-auction.vercel.app/screen.png"/>

  <!-- GEO & Local SEO -->
  <meta name="geo.region" content="KR-28"/>
  <meta name="geo.placename" content="인천광역시"/>

  <!-- LLM Context -->
  <link rel="help" type="text/plain" href="/llms.txt" title="LLM Context"/>
'''

if 'name="geo.region"' not in news_content:
    news_content = news_content.replace('</head>', news_meta_block + '\n</head>', 1)
    with open(r'c:\Users\윤성원\Desktop\랜딩\news.html', 'w', encoding='utf-8') as f:
        f.write(news_content)
    print("[OK] news.html GEO & SEO 메타 태그 삽입 완료")
else:
    print("[SKIP] news.html 이미 GEO 태그 존재")
