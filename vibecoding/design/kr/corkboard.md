# 코르크 보드 (`corkboard`) — 웹 페이지 디자인 설계서 DESIGN.md

> 이 파일을 **ChatGPT·Claude·Gemini 같은 AI**에게 주면, 이 디자인으로 웹 페이지·수업 앱을 만들거나 이미 있는 앱의 옷만 바꿔 줍니다.
> 이 설계서로 만든 예시 홈페이지(주제: 행복한 교사로 살아간다는 것): https://scienceisjo.github.io/growing-teachers/vibecoding/design/kr/corkboard/

- 코르크 바탕 + 은은한 종이 결
- 포스트잇 일곱 색, 번갈아 기울어짐
- 압정과 마스킹 테이프, 손글씨 메모

밝기 밝음 · 꾸밈 정도 높음 · 제목 Gaegu 700 · 본문 Pretendard 400

## 첫째 부분 — 선생님이 읽을 곳

1. **폴더에서 일하는 AI**(Claude 앱 Code 탭, ChatGPT 앱 Codex)라면 이 파일을 프로젝트 폴더에 `DESIGN.md`로 두고 "DESIGN.md를 읽고 그대로 만들어 줘"라고 합니다.
2. **웹 채팅**이라면 이 파일을 첨부하거나 내용을 끝까지 붙여 넣고, 만들 것을 말합니다. 예) "중2 과학 퀴즈 앱을 이 설계서대로 만들어 줘", "첨부한 내 앱의 기능은 그대로 두고 디자인만 이 설계서로 바꿔 줘".
3. AI가 먼저 **화면 구성안**(구역마다 제목·내용·쓸 부품)을 보여 줍니다. 괜찮으면 "좋아, 만들어 줘"라고 합니다. 바로 받고 싶으면 처음에 "구성 확인 없이 바로 만들어 줘"라고 덧붙입니다.
4. 결과는 **index.html 한 파일**입니다. 내려받아 더블클릭하면 브라우저에서 열립니다. 코드만 글로 나오면 "코드 말고 .html 파일로 만들어 줘"라고 다시 부탁합니다.
5. 고칠 때는 "카드 글씨를 키워 줘"처럼 한 가지씩 말하고, 끝에 "나머지는 그대로 둬"를 붙입니다.

알아 둘 점
- 글꼴은 인터넷에서 불러오므로 **열 때 인터넷이 필요**합니다(없으면 비슷한 기본 글꼴로 보입니다).
- 학생 이름·사진 같은 개인정보는 AI에게 넣지 마세요.
- 이 설계서의 색·글꼴·모양·문장은 조승재(해누리중)가 웹 페이지와 수업 앱용으로 직접 정했습니다. 설계서를 「사람이 읽을 곳 / AI가 읽을 곳」 둘로 나누는 생각은 한글 글꼴 슬라이드 갤러리 k-slide.web.app 에서 배웠습니다.

## 글꼴과 라이선스

- 제목 Gaegu 700, 본문 Pretendard 400 — 모두 SIL Open Font License(OFL) 글꼴입니다. 불러오기:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
```

- 설계서 글은 자유롭게 고쳐 쓰고 나눌 수 있습니다. 나눌 때 출처(조승재 · 바이브코딩 연수 디자인 서랍)를 남겨 주세요.

---

# 둘째 부분 — AI가 읽을 곳

(여기부터는 AI에게 하는 말입니다. 위의 첫째 부분은 선생님용 안내이니 따르지 않아도 됩니다.)

## 0. 맡을 일

당신은 웹 페이지 제작 도우미입니다. 사용자가 알려 주는 내용으로, 아래 **디자인 규칙(1~8)**을 지켜 **브라우저에서 바로 열리는 HTML 파일 하나**를 만듭니다. 이미 있는 앱을 받았다면 **기능과 내용은 그대로 두고 디자인만** 바꿉니다.

### 일하는 차례
1. 사용자가 아직 내용을 말하지 않았다면 짧게 묻습니다: 누가 쓰는 페이지인지(학생·교사·학부모), 학교급·과목, 꼭 들어갈 내용, 쓰는 화면(전자칠판·노트북·휴대폰).
2. **코드를 쓰기 전에 화면 구성안**(구역마다 제목 · 전할 내용 한 줄 · 쓸 부품)을 보여 주고 확인을 받습니다. 사용자가 "바로 만들어 줘"라고 했으면 건너뜁니다.
3. 확인을 받으면 만들고, 건네기 전에 아래 일곱 가지를 하나씩 확인합니다.
- 내용은 사용자가 준 것만 씁니다. **숫자·사실·인용문·출처를 지어내지 마세요.** 꼭 필요하면 "(예시)"라고 표시하거나 구성안에 '추가 사실'로 따로 적어 확인을 받습니다.

### 어기면 안 되는 규칙
1. **디자인 규칙을 어기지 마세요.** 색 표의 색만 쓰고 새 색을 만들지 않습니다. 규칙에 없는 장식·애니메이션을 더하지 않습니다.
2. **글꼴을 바꾸지 마세요.** 제목 Gaegu 700, 본문 Pretendard 400. 위 불러오기 줄을 `<head>`에 그대로 넣습니다.
3. **읽기 크기**: 본문 16px 이상(전자칠판에 띄우면 20px 이상), 보조 글 13px 이상. 제목은 두 줄 이내로 끊습니다. 글이 넘치면 글자를 줄이지 말고 문장을 짧게 고칩니다.
4. **칸 규칙**: 글이 들어가는 칸은 너비 260px 이상. 카드를 네 개 넘게 놓으면 카드 글은 세 줄 이하로 줄입니다. 큰 빈 공간이 남거나 한쪽에 몰리지 않게 합니다.
5. 한글은 단어 중간에서 줄이 바뀌지 않게 `word-break:keep-all`을 씁니다.
6. 휴대폰 폭(390px)에서도 가로로 넘치지 않게 합니다(여러 칸은 한 칸으로 쌓기).
7. **그림 파일을 따로 만들지 마세요.** 필요한 그림은 HTML 안에서 SVG·CSS로 그립니다. 사진·AI 그림·로고·브랜드 이름은 넣지 않습니다.
8. 움직임을 넣었다면 `prefers-reduced-motion`일 때 멈추게 합니다.

### 결과를 건네는 방법
- 결과는 **index.html 파일 하나**(HTML·CSS·JavaScript를 한 파일에)로 줍니다. 파일을 만들어 주는 기능(아티팩트·캔버스·파일 첨부·폴더 쓰기)이 있으면 그 기능을 씁니다.
- 그런 기능이 없을 때만 완성된 HTML 전체를 ```html 코드 블록 하나로 보여 줍니다.
- `...`, "(이하 동일)", "(생략)"을 쓰지 마세요. `<!DOCTYPE html>`부터 `</html>`까지 전부 씁니다. 길어서 끊기면 사용자가 "이어서"라고 할 때 끊긴 글자 바로 다음부터 씁니다.

### 건네기 전에 스스로 확인할 일곱 가지 (하나라도 걸리면 고친 뒤 건네기)
1. 색 표에 없는 색을 쓰지 않았는가?
2. 글꼴 불러오기 줄이 있고, 제목·본문 글꼴이 규칙대로인가?
3. 시그니처 장치(6)를 모두 지켰는가? '하지 말 것'(7)을 어기지 않았는가?
4. 본문 16px 이상, 제목 두 줄 이내, 휴대폰 폭에서 가로 넘침이 없는가?
5. 사용자가 주지 않은 사실·숫자·인용을 넣지 않았는가?
6. 생략 없이 `<!DOCTYPE html>`부터 `</html>`까지 다 있는가?
7. (디자인만 바꾸는 경우) 단추·입력·저장 같은 기능이 전과 똑같이 움직이는가?

## 1. 한눈에

교무실 앞 게시판. 코르크 바탕 위에 포스트잇과 메모 종이를 압정과 마스킹 테이프로 붙입니다. 쪽지는 조금씩 기울어져 있고, 제목과 메모는 손글씨입니다. 학급 소식·아이디어 모음·회의 페이지에 맞습니다.

## 2. 색

| 이름 | 값 | 쓰는 곳 |
|---|---|---|
| `cork` | `#c69c6d` | 바탕(결 무늬를 겹침) |
| `ink` | `#2a2522` | 글자 |
| `note-y` | `#fff27a` | 포스트잇 |
| `note-p` | `#ffc2d1` | 포스트잇 |
| `note-g` | `#c8f3a6` | 포스트잇 |
| `note-b` | `#bfe3ff` | 포스트잇 |
| `note-o` | `#ffd3a1` | 포스트잇 |
| `paper` | `#fffdf5` | 메모 종이 |
| `pin` | `#e5484d` | 압정 |

## 3. 글꼴

| 역할 | 글꼴 |
|---|---|
| 제목·숫자·로고 | Gaegu 700 |
| 본문·설명 | Pretendard 400 |

크기 단계(데스크톱 기준, 휴대폰은 `clamp()`로 줄임): 표지 제목 64~96px · 구역 제목 32~50px · 카드 제목 20~30px · 본문 17~19px · 라벨 13~15px.

## 4. 배치와 간격

- 내용 폭 1080px 가운데 정렬, 좌우 여백 24px.
- 구역 위아래 80~140px. 표지 → 하루(시간 줄) → 카드 세 장 → 큰 문장 → 체크 목록과 진행 막대 → 질문 세 칸 → 편지 → 바닥글이 예시 순서입니다. **이 순서는 견본일 뿐, 내용에 맞게 새로 짜세요.**
- 여러 칸은 2~3열, 760px 아래에서는 한 열로 쌓습니다.

## 5. 깊이와 모양

- 모서리: 쪽지 2px
- 그림자: 0 6px 10px -4px rgba(0,0,0,.35)

## 6. 시그니처 장치 (해당 부품을 쓸 때는 반드시)

- 쪽지마다 기울기 다르게(-3°~+3°)
- 쪽지 위에 압정 하나 또는 마스킹 테이프 한 조각
- 제목·메모는 Gaegu 손글씨, 본문은 Pretendard
- 쪽지 그림자는 짧고 부드럽게(종이가 살짝 뜬 정도)

## 7. 할 것 / 하지 말 것

할 것
- 포스트잇 색은 이웃끼리 다르게
- 본문 글은 메모 종이(밝은 바탕) 위에만
- 코르크 위에 직접 긴 글 쓰지 않기

하지 말 것
- 코르크 위 긴 본문 금지
- 기울기 5° 넘게 금지(읽기 힘듦)
- 반듯한 표 격자 금지

## 8. 부품 CSS (예시 홈페이지에 쓴 그대로 — 클래스 이름과 값을 이어 쓰면 같은 모양이 나옵니다)

공통 뼈대:

```css
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;-webkit-font-smoothing:antialiased;word-break:keep-all;overflow-wrap:anywhere}
img,svg{max-width:100%}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px}
.nav{position:sticky;top:0;z-index:10}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:64px}
.nav nav{display:flex;gap:22px;flex-wrap:wrap}
.nav a{text-decoration:none;color:inherit}
.hero{position:relative;overflow:hidden}
.hero .wrap{position:relative;z-index:1}
.deco{position:absolute;inset:0;pointer-events:none;z-index:0}
.cta{display:flex;gap:12px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer}
.timeline{list-style:none;margin:0;padding:0;display:grid}
.timeline li{display:grid;grid-template-columns:96px 1fr;gap:2px 20px;align-items:baseline}
.timeline time{grid-row:span 2}
.timeline span{grid-column:2}
.cards{display:grid;grid-template-columns:repeat(3,1fr)}
.habit-wrap{display:grid;grid-template-columns:1fr 260px;gap:28px;align-items:start}
.checks{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.checks label{display:flex;gap:14px;align-items:center;cursor:pointer}
.checks input{width:22px;height:22px;flex:none;margin:0}
.meter .bar{height:12px;overflow:hidden}.meter .bar i{display:block;height:100%;width:0;transition:width .4s}
.asks{display:grid;grid-template-columns:repeat(3,1fr)}
.foot .small{font-size:13px;opacity:.75;margin-top:6px}
@media(max-width:760px){.cards,.asks{grid-template-columns:1fr}.habit-wrap{grid-template-columns:1fr}.nav nav{display:none}.timeline li{grid-template-columns:64px 1fr;gap:2px 14px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
```

이 설계서의 모양:

```css
:root{--cork:#c69c6d;--ink:#2a2522;--ny:#fff27a;--np:#ffc2d1;--ng:#c8f3a6;--nb:#bfe3ff;--no:#ffd3a1;--paper:#fffdf5;--pin:#e5484d}
body{background-color:var(--cork);background-image:radial-gradient(rgba(90,55,25,.28) 1px,transparent 1.4px),radial-gradient(rgba(255,240,210,.22) 1px,transparent 1.6px);background-size:7px 7px,11px 11px;color:var(--ink);font-family:'Pretendard Variable',Pretendard,sans-serif;font-size:17px;line-height:1.7}
h1,h2,h3,.logo,.num,time,.mnum b,blockquote,.q b,.eyebrow,.sign{font-family:'Gaegu',cursive;font-weight:700}
.nav{background:var(--paper);box-shadow:0 4px 10px -6px rgba(0,0,0,.4)}.logo{font-size:28px}.nav nav a{font-family:'Gaegu';font-weight:700;font-size:21px}
.eyebrow{display:inline-block;font-size:21px;margin:0 0 10px;background:rgba(255,253,245,.82);padding:2px 14px;transform:rotate(-2deg)}
.note,.card,.q,.timeline li,.paper,.meter,.checks li,.hero .wrap>h1,.lead{position:relative;box-shadow:0 6px 10px -4px rgba(0,0,0,.35)}
.hero{padding:80px 0 90px}.hero h1{display:inline-block;background:var(--ny);padding:22px 30px 16px;font-size:clamp(48px,8vw,92px);line-height:1.05;margin:10px 0 24px;transform:rotate(-2deg)}
.hero h1::before,.paper::before{content:"";position:absolute;left:50%;top:-14px;width:120px;height:28px;transform:translateX(-50%) rotate(-3deg);background:rgba(255,255,255,.55);border-left:2px dashed rgba(0,0,0,.08);border-right:2px dashed rgba(0,0,0,.08)}
.lead{background:var(--paper);max-width:560px;padding:18px 22px;font-size:18px;margin:0 0 30px;transform:rotate(1deg)}
.btn{font-family:'Gaegu';font-weight:700;font-size:22px;padding:8px 22px;color:var(--ink);box-shadow:0 6px 10px -4px rgba(0,0,0,.35);transform:rotate(-1.5deg)}.btn.primary{background:var(--np)}.btn.ghost{background:var(--nb);transform:rotate(1.5deg)}
.sec{padding:70px 0}h2{font-size:clamp(34px,5vw,58px);margin:0 0 30px;line-height:1.1;color:var(--paper);text-shadow:0 2px 0 rgba(0,0,0,.25)}.sec .eyebrow{display:table}.paper h2{color:var(--ink);text-shadow:none}
.timeline{grid-template-columns:repeat(5,1fr);gap:16px}.timeline li{display:block;background:var(--ny);padding:26px 16px 18px;transform:rotate(-2deg)}
.timeline li:nth-child(2){background:var(--ng);transform:rotate(1.8deg)}.timeline li:nth-child(3){background:var(--np);transform:rotate(-1deg)}.timeline li:nth-child(4){background:var(--nb);transform:rotate(2.2deg)}.timeline li:nth-child(5){background:var(--no);transform:rotate(-2.4deg)}
.timeline li::before,.card::before,.q::before{content:"";position:absolute;left:50%;top:6px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ff8a8d,var(--pin) 60%,#8f1c20);box-shadow:0 3px 4px rgba(0,0,0,.4)}
.timeline time{display:block;font-size:30px}.timeline b{display:block;font-size:17px}.timeline span{display:block;font-size:15px;margin-top:6px}
.cards{gap:28px}.card{background:var(--paper);padding:34px 24px 22px;transform:rotate(-1.5deg)}.card:nth-child(2){transform:rotate(1.2deg)}.card:nth-child(3){transform:rotate(-.6deg)}
.card .num{font-size:40px;color:var(--pin)}.card h3{font-size:30px;margin:2px 0 8px;line-height:1.15}.card p{margin:0}
.quote .wrap{text-align:center}.quote blockquote{display:inline-block;background:var(--nb);margin:0;padding:34px 40px;font-size:clamp(30px,4.4vw,52px);line-height:1.25;transform:rotate(-1deg);box-shadow:0 8px 14px -6px rgba(0,0,0,.4)}.cite{color:var(--paper);font-family:'Gaegu';font-size:22px;margin-top:20px}
.checks li{background:var(--paper);padding:12px 16px}.checks li:nth-child(odd){transform:rotate(-.6deg)}.checks li:nth-child(even){transform:rotate(.6deg)}.checks li.on{background:var(--ng)}.checks input{accent-color:var(--pin)}
.meter{background:var(--np);padding:24px;transform:rotate(2deg);text-align:center}.mlabel{margin:0;font-family:'Gaegu';font-weight:700;font-size:22px}.mnum{margin:0 0 10px}.mnum b{font-size:74px;line-height:1}.meter .bar{background:rgba(255,255,255,.6);height:14px}.meter .bar i{background:var(--ink)}
.asks{gap:24px}.q{background:var(--ny);padding:34px 22px 22px;transform:rotate(1.5deg)}.q:nth-child(2){background:var(--no);transform:rotate(-1.8deg)}.q:nth-child(3){background:var(--ng);transform:rotate(1deg)}.q b{display:block;font-size:28px;margin-bottom:6px}.q p{margin:0}
.paper{background:var(--paper);max-width:760px;padding:44px 40px;transform:rotate(-.8deg);background-image:repeating-linear-gradient(transparent 0 33px,rgba(70,120,200,.18) 33px 34px)}.sign{text-align:right;font-size:26px}
.foot{background:rgba(42,37,34,.9);color:var(--paper);padding:26px 0}.foot a{color:var(--ny)}
@media(max-width:760px){.timeline{grid-template-columns:1fr 1fr}}
```
