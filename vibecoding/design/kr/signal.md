# 밤하늘 시그널 (`signal`) — 웹 페이지 디자인 설계서 DESIGN.md

> 이 파일을 **ChatGPT·Claude·Gemini 같은 AI**에게 주면, 이 디자인으로 웹 페이지·수업 앱을 만들거나 이미 있는 앱의 옷만 바꿔 줍니다.
> 이 설계서로 만든 예시 홈페이지(주제: 행복한 교사로 살아간다는 것): https://scienceisjo.github.io/growing-teachers/vibecoding/design/kr/signal/

- 남색 / 크림 두 면 + 앤티크 골드 하나
- 명조 제목 속 강조 낱말은 언제나 골드
- 1px 선만, 카드·둥근 모서리 없음

밝기 섞임 · 꾸밈 정도 높음 · 제목 Nanum Myeongjo 800 · 본문 Pretendard 400

## 사용법 (사람이 읽는 안내)

1. **폴더에서 일하는 AI**(Claude 앱 Code 탭, ChatGPT 앱 Codex)라면 이 파일을 프로젝트 폴더에 `DESIGN.md`로 두고 "DESIGN.md를 읽고 그대로 만들어 줘"라고 합니다.
2. **웹 채팅**이라면 이 파일을 첨부하거나 내용을 끝까지 붙여 넣고, 만들 것을 말합니다. 예) "중2 과학 퀴즈 앱을 이 설계서대로 만들어 줘", "첨부한 내 앱의 기능은 그대로 두고 디자인만 이 설계서로 바꿔 줘".
3. AI가 먼저 **화면 구성안**(구역마다 제목·내용·쓸 부품)을 보여 줍니다. 괜찮으면 "좋아, 만들어 줘"라고 합니다. 바로 받고 싶으면 처음에 "구성 확인 없이 바로 만들어 줘"라고 덧붙입니다.
4. 결과는 **index.html 한 파일**입니다. 내려받아 더블클릭하면 브라우저에서 열립니다. 코드만 글로 나오면 "코드 말고 .html 파일로 만들어 줘"라고 다시 부탁합니다.
5. 고칠 때는 "카드 글씨를 키워 줘"처럼 한 가지씩 말하고, 끝에 "나머지는 그대로 둬"를 붙입니다.

알아 둘 점
- 글꼴은 인터넷에서 불러오므로 **열 때 인터넷이 필요**합니다(없으면 비슷한 기본 글꼴로 보입니다).
- 학생 이름·사진 같은 개인정보는 AI에게 넣지 마세요.
- 이 설계서는 조승재(해누리중)가 k-slide.web.app(한글폰트 슬라이드 디자인 갤러리)의 설계서 짜임을 참고해 웹 페이지용으로 새로 쓴 것입니다.

## 글꼴과 라이선스

- 제목 Nanum Myeongjo 800, 본문 Pretendard 400 — 모두 SIL Open Font License(OFL) 글꼴입니다. 불러오기:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
```

- 설계서 글은 자유롭게 고쳐 쓰고 나눌 수 있습니다. 나눌 때 출처(조승재 · 바이브코딩 연수 디자인 서랍)를 남겨 주세요.

---

# ▼▼▼ 여기부터 AI에게 주는 지시서 ▼▼▼

(위의 '사용법'은 사람을 위한 안내입니다. AI는 아래를 따르세요.)

## 0. 당신(AI)의 일

당신은 웹 페이지 제작 도우미입니다. 사용자가 알려 주는 내용으로, 아래 **디자인 규칙(1~8)**을 지켜 **브라우저에서 바로 열리는 HTML 파일 하나**를 만듭니다. 이미 있는 앱을 받았다면 **기능과 내용은 그대로 두고 디자인만** 바꿉니다.

### 진행 순서
1. 사용자가 아직 내용을 말하지 않았다면 짧게 묻습니다: 누가 쓰는 페이지인지(학생·교사·학부모), 학교급·과목, 꼭 들어갈 내용, 쓰는 화면(전자칠판·노트북·휴대폰).
2. **코드를 쓰기 전에 화면 구성안**(구역마다 제목 · 전할 내용 한 줄 · 쓸 부품)을 보여 주고 확인을 받습니다. 사용자가 "바로 만들어 줘"라고 했으면 건너뜁니다.
3. 확인을 받으면 만들고, 내보내기 전에 아래 '내보내기 전 점검'을 하나씩 확인합니다.
- 내용은 사용자가 준 것만 씁니다. **숫자·사실·인용문·출처를 지어내지 마세요.** 꼭 필요하면 "(예시)"라고 표시하거나 구성안에 '추가 사실'로 따로 적어 확인을 받습니다.

### 반드시 지킬 것
1. **디자인 규칙을 어기지 마세요.** 색 표의 색만 쓰고 새 색을 만들지 않습니다. 규칙에 없는 장식·애니메이션을 더하지 않습니다.
2. **글꼴을 바꾸지 마세요.** 제목 Nanum Myeongjo 800, 본문 Pretendard 400. 위 불러오기 줄을 `<head>`에 그대로 넣습니다.
3. **읽기 크기**: 본문 16px 이상(전자칠판에 띄우면 20px 이상), 보조 글 13px 이상. 제목은 두 줄 이내로 끊습니다. 글이 넘치면 글자를 줄이지 말고 문장을 짧게 고칩니다.
4. **칸 규칙**: 글이 들어가는 칸은 너비 260px 이상. 카드를 네 개 넘게 놓으면 카드 글은 세 줄 이하로 줄입니다. 큰 빈 공간이 남거나 한쪽에 몰리지 않게 합니다.
5. 한글은 단어 중간에서 줄이 바뀌지 않게 `word-break:keep-all`을 씁니다.
6. 휴대폰 폭(390px)에서도 가로로 넘치지 않게 합니다(여러 칸은 한 칸으로 쌓기).
7. **그림 파일을 따로 만들지 마세요.** 필요한 그림은 HTML 안에서 SVG·CSS로 그립니다. 사진·AI 그림·로고·브랜드 이름은 넣지 않습니다.
8. 움직임을 넣었다면 `prefers-reduced-motion`일 때 멈추게 합니다.

### 출력 방식
- 결과는 **index.html 파일 하나**(HTML·CSS·JavaScript를 한 파일에)로 줍니다. 파일을 만들어 주는 기능(아티팩트·캔버스·파일 첨부·폴더 쓰기)이 있으면 그 기능을 씁니다.
- 그런 기능이 없을 때만 완성된 HTML 전체를 ```html 코드 블록 하나로 보여 줍니다.
- `...`, "(이하 동일)", "(생략)"을 쓰지 마세요. `<!DOCTYPE html>`부터 `</html>`까지 전부 씁니다. 길어서 끊기면 사용자가 "이어서"라고 할 때 끊긴 글자 바로 다음부터 씁니다.

### 내보내기 전 점검 (하나라도 아니면 고친 뒤 내보내기)
1. 색 표에 없는 색을 쓰지 않았는가?
2. 글꼴 불러오기 줄이 있고, 제목·본문 글꼴이 규칙대로인가?
3. 시그니처 장치(6)를 모두 지켰는가? '하지 말 것'(7)을 어기지 않았는가?
4. 본문 16px 이상, 제목 두 줄 이내, 휴대폰 폭에서 가로 넘침이 없는가?
5. 사용자가 주지 않은 사실·숫자·인용을 넣지 않았는가?
6. 생략 없이 `<!DOCTYPE html>`부터 `</html>`까지 다 있는가?
7. (디자인만 바꾸는 경우) 단추·입력·저장 같은 기능이 전과 똑같이 움직이는가?

## 1. 한눈에

밤하늘 아래 연구 노트. 남색과 크림 두 면을 번갈아 쓰고, 앤티크 골드 하나가 제목 속 강조 낱말과 번호를 맡습니다. 카드나 둥근 모서리 없이 1px 선과 굵은 명조 제목만으로 품위를 냅니다. 발표·보고·기념 페이지에 맞습니다.

## 2. 색

| 이름 | 값 | 쓰는 곳 |
|---|---|---|
| `navy` | `#0f1b3d` | 짙은 면 |
| `cream` | `#f6f1e4` | 밝은 면 |
| `gold` | `#b8975a` | 유일한 강조: 제목 속 강조 낱말·번호·선 |
| `on-navy` | `#e9e3d3` | 짙은 면 글자 |
| `on-cream` | `#1b2440` | 밝은 면 글자 |
| `hair-d` | `rgba(233,227,211,.22)` | 짙은 면 선 |
| `hair-l` | `rgba(27,36,64,.2)` | 밝은 면 선 |

## 3. 글꼴

| 역할 | 글꼴 |
|---|---|
| 제목·숫자·로고 | Nanum Myeongjo 800 |
| 본문·설명 | Pretendard 400 |

크기 단계(데스크톱 기준, 휴대폰은 `clamp()`로 줄임): 표지 제목 64~96px · 구역 제목 32~50px · 카드 제목 20~30px · 본문 17~19px · 라벨 13~15px.

## 4. 배치와 간격

- 내용 폭 1080px 가운데 정렬, 좌우 여백 24px.
- 구역 위아래 80~140px. 표지 → 하루(시간 줄) → 카드 세 장 → 큰 문장 → 체크 목록과 진행 막대 → 질문 세 칸 → 편지 → 바닥글이 예시 순서입니다. **이 순서는 견본일 뿐, 내용에 맞게 새로 짜세요.**
- 여러 칸은 2~3열, 760px 아래에서는 한 열로 쌓습니다.

## 5. 깊이와 모양

- 모서리: 0
- 그림자: 없음

## 6. 시그니처 장치 (해당 부품을 쓸 때는 반드시)

- 제목 속 강조 낱말 하나는 <em>으로 골드(한글은 기울이지 않고 색만)
- 번호·시간은 골드 명조
- 구역은 1px 선으로만 나눔
- 표지는 남색 면에 별빛 점 몇 개

## 7. 할 것 / 하지 말 것

할 것
- 본문은 Pretendard 400, 줄 간격 1.8
- 숫자 큰 글씨는 명조
- 단추는 1px 골드 테두리 직사각형

하지 말 것
- 카드 상자·둥근 모서리 금지
- 골드를 넓은 면에 칠하기 금지
- 세 번째 색 금지
- 그라데이션 금지

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
:root{--navy:#0f1b3d;--cream:#f6f1e4;--gold:#b8975a;--on-n:#e9e3d3;--on-c:#1b2440;--hd:rgba(233,227,211,.22);--hl:rgba(27,36,64,.2)}
body{background:var(--cream);color:var(--on-c);font-family:'Pretendard Variable',Pretendard,sans-serif;font-size:17px;line-height:1.8}
h1,h2,h3,.logo,.num,time,.mnum b,blockquote,.q b{font-family:'Nanum Myeongjo',serif;font-weight:800}
em{font-style:normal;color:var(--gold)}
.nav{background:var(--navy);color:var(--on-n);border-bottom:1px solid var(--hd)}.logo{font-size:19px}.nav nav a{font-size:14px;letter-spacing:.12em;opacity:.8}
.eyebrow{color:var(--gold);font-size:13px;letter-spacing:.25em;margin:0 0 16px;font-weight:600}
.hero{background:var(--navy);color:var(--on-n);padding:130px 0 120px}.hero h1{font-size:clamp(44px,7vw,84px);line-height:1.2;margin:0 0 28px}
.lead{max-width:600px;opacity:.82;font-size:19px;margin:0 0 40px}
.btn{border:1px solid var(--gold);color:var(--gold);padding:12px 28px;font-size:15px;letter-spacing:.1em}.btn.primary{background:var(--gold);color:var(--navy)}
.deco{background-image:radial-gradient(1.4px 1.4px at 12% 22%,#e9e3d3 99%,transparent),radial-gradient(1px 1px at 28% 70%,#e9e3d3 99%,transparent),radial-gradient(1.6px 1.6px at 72% 18%,#b8975a 99%,transparent),radial-gradient(1px 1px at 86% 54%,#e9e3d3 99%,transparent),radial-gradient(1.2px 1.2px at 58% 84%,#e9e3d3 99%,transparent),radial-gradient(1px 1px at 92% 86%,#b8975a 99%,transparent);opacity:.8}
.sec{padding:96px 0;border-top:1px solid var(--hl)}.sec:nth-of-type(odd){background:var(--navy);color:var(--on-n);border-top-color:var(--hd)}
h2{font-size:clamp(30px,4vw,48px);margin:0 0 40px;line-height:1.3}
.timeline li{padding:20px 0;border-top:1px solid var(--hl)}.timeline time{color:var(--gold);font-size:26px}.timeline b{font-weight:600}.timeline span{opacity:.8}
.cards{gap:0}.card{padding:6px 28px;border-left:1px solid var(--hd)}.card:first-child{border-left:0;padding-left:0}.card .num{color:var(--gold);font-size:46px}.card h3{font-size:23px;margin:4px 0 12px}.card p{opacity:.8;margin:0}
.quote blockquote{margin:0;font-size:clamp(30px,4.2vw,50px);line-height:1.45}.cite{color:var(--gold);letter-spacing:.2em;font-size:13px;margin-top:22px}
.checks{gap:0}.checks li{border-top:1px solid var(--hd);padding:16px 0}.checks input{accent-color:var(--gold)}.checks li.on span{color:var(--gold)}
.meter{border-top:1px solid var(--gold);padding-top:18px}.mlabel{margin:0;letter-spacing:.2em;font-size:13px;color:var(--gold)}.mnum b{font-size:68px;color:var(--gold)}.meter .bar{height:1px;background:var(--hd)}.meter .bar i{background:var(--gold);height:3px;margin-top:-1px}
.asks{gap:0}.q{padding:0 28px;border-left:1px solid var(--hl)}.q:first-child{border-left:0;padding-left:0}.q b{display:block;font-size:23px;margin-bottom:10px}.q p{margin:0;opacity:.85}
.paper{max-width:720px;border-left:1px solid var(--gold);padding:6px 0 6px 34px}.sign{color:var(--gold)!important;font-family:'Nanum Myeongjo',serif;font-weight:700}
.foot{background:var(--navy);color:var(--on-n);padding:30px 0;font-size:14px;border-top:1px solid var(--hd)}.foot a{color:var(--gold)}
@media(max-width:760px){.card,.q{border-left:0;padding:18px 0!important;border-top:1px solid var(--hd)}}
```
