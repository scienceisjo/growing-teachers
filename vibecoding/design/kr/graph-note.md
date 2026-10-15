# 모눈 노트 (`graph-note`) — 웹 페이지 디자인 설계서 DESIGN.md

> 이 파일을 **ChatGPT·Claude·Gemini 같은 AI**에게 주면, 이 디자인으로 웹 페이지·수업 앱을 만들거나 이미 있는 앱의 옷만 바꿔 줍니다.
> 이 설계서로 만든 예시 홈페이지(주제: 행복한 교사로 살아간다는 것): https://scienceisjo.github.io/growing-teachers/vibecoding/design/kr/graph-note/

- 모눈종이 바탕 + 검정 글씨 + 빨간 펜 하나
- 왼쪽 빨간 여백선, 형광펜 밑줄로 강조
- 상자는 직각, 그림자 대신 모눈과 여백선

밝기 밝음 · 꾸밈 정도 보통 · 제목 Do Hyeon 400 · 본문 Pretendard 400

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

- 제목 Do Hyeon 400, 본문 Pretendard 400 — 모두 SIL Open Font License(OFL) 글꼴입니다. 불러오기:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap">
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
2. **글꼴을 바꾸지 마세요.** 제목 Do Hyeon 400, 본문 Pretendard 400. 위 불러오기 줄을 `<head>`에 그대로 넣습니다.
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

공책 한 쪽을 그대로 펼친 화면. 연한 모눈 바탕에 검정 글씨로 쓰고, 빨간 펜 하나로 여백선·번호·단추를 칠합니다. 강조할 낱말에는 형광펜을 그어 줍니다. 수업 정리·실험 기록·안내문처럼 차근차근 읽히는 페이지에 맞습니다.

## 2. 색

| 이름 | 값 | 쓰는 곳 |
|---|---|---|
| `paper` | `#fbfbf7` | 바탕 |
| `grid` | `rgba(70,130,180,.13)` | 모눈 선(16px 칸) |
| `ink` | `#1c1c1c` | 글자 |
| `pencil` | `#5b5b5b` | 본문 |
| `red` | `#d6402f` | 유일한 강조: 여백선·번호·단추 |
| `marker` | `rgba(255,214,0,.55)` | 형광펜(제목 속 낱말 밑에만) |

## 3. 글꼴

| 역할 | 글꼴 |
|---|---|
| 제목·숫자·로고 | Do Hyeon 400 |
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

- 바탕 전체에 16px 모눈
- 구역 왼쪽에 2px 빨간 여백선
- 제목 속 강조 낱말은 형광펜 밑줄(글자 아래 40%만 칠함)
- 번호는 빨간 동그라미 안에

## 7. 할 것 / 하지 말 것

할 것
- 상자는 흰 종이색 + 1px 연필색 테두리 + 직각
- 본문은 회색 연필색, 줄 간격 1.75
- 단추는 빨간 테두리 직사각형

하지 말 것
- 둥근 모서리 금지
- 그라데이션·흐린 그림자 금지
- 빨강 외의 강조색 금지(형광펜은 밑줄로만)
- 모눈 위에 긴 글을 상자 없이 늘어놓기 금지

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
:root{--paper:#fbfbf7;--grid:rgba(70,130,180,.13);--ink:#1c1c1c;--pen:#5b5b5b;--red:#d6402f;--mk:rgba(255,214,0,.55)}
body{background-color:var(--paper);background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:16px 16px;color:var(--ink);font-family:'Pretendard Variable',Pretendard,sans-serif;font-size:17px;line-height:1.75}
h1,h2,h3,.logo,.num,time,.mnum b,blockquote,.q b{font-family:'Do Hyeon',sans-serif;font-weight:400}
mark{background:linear-gradient(transparent 58%,var(--mk) 58%);color:inherit;padding:0 .08em}
.nav{background:var(--paper);border-bottom:2px solid var(--ink)}.logo{font-size:22px}.nav nav a{font-size:15px;color:var(--pen)}.nav nav a:hover{color:var(--red)}
.eyebrow{font-size:14px;font-weight:700;color:var(--red);margin:0 0 10px}
.sec .wrap,.hero .wrap{border-left:2px solid var(--red);padding-left:28px}
.hero{padding:96px 0 90px}.hero h1{font-size:clamp(44px,7vw,80px);line-height:1.15;margin:0 0 22px}
.lead{max-width:600px;color:var(--pen);font-size:19px;margin:0 0 30px;background:var(--paper)}
.btn{border:2px solid var(--red);padding:11px 24px;font-weight:700;color:var(--red);background:var(--paper)}.btn.primary{background:var(--red);color:#fff}
.sec{padding:76px 0}h2{font-size:clamp(30px,4.2vw,46px);margin:0 0 30px;line-height:1.2}
.timeline{gap:0;background:#fff;border:1px solid var(--pen)}.timeline li{padding:14px 18px;border-top:1px dashed rgba(0,0,0,.2)}.timeline li:first-child{border-top:0}.timeline time{color:var(--red);font-family:'Do Hyeon';font-size:24px}.timeline span{color:var(--pen)}
.cards{gap:20px}.card{background:#fff;border:1px solid var(--pen);padding:24px}
.card .num{display:inline-flex;width:44px;height:44px;border:2px solid var(--red);border-radius:50%;align-items:center;justify-content:center;color:var(--red);font-size:20px}
.card h3{font-size:24px;margin:12px 0 8px}.card p{color:var(--pen);margin:0}
.quote blockquote{margin:0;font-size:clamp(30px,4.2vw,50px);line-height:1.35}.cite{color:var(--red);font-weight:700;margin-top:14px}
.checks li{background:#fff;border:1px solid var(--pen);padding:12px 16px}.checks li.on span{text-decoration:line-through;text-decoration-color:var(--red);text-decoration-thickness:2px}.checks input{accent-color:var(--red)}
.meter{background:#fff;border:1px solid var(--pen);padding:22px}.mlabel{margin:0;color:var(--pen)}.mnum{margin:4px 0 12px}.mnum b{font-size:60px;color:var(--red)}.meter .bar{height:12px;border:1px solid var(--ink);background:var(--paper)}.meter .bar i{background:var(--mk)}
.asks{gap:18px}.q{background:#fff;border:1px solid var(--pen);padding:22px}.q b{display:block;font-size:22px;margin-bottom:6px}.q p{margin:0;color:var(--pen)}
.paper{background:#fff;border:1px solid var(--pen);padding:38px;max-width:760px;background-image:repeating-linear-gradient(transparent 0 31px,rgba(214,64,47,.18) 31px 32px)}.paper p{color:var(--pen)}.sign{text-align:right;color:var(--red)!important;font-family:'Do Hyeon'}
.foot{background:var(--ink);color:var(--paper);padding:26px 0}.foot a{color:#ffd84d}
@media(max-width:760px){.sec .wrap,.hero .wrap{padding-left:16px;margin-left:12px}}
```
