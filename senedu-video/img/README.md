# 재료 세트 이미지

SENEDU 이미지 생성으로 만든 첫 프레임 / 끝 프레임 이미지를 이 폴더에 넣습니다.

권장 이름
- `can-first.png` / `can-last.png`
- `cup-first.png` / `cup-last.png`
- `ruler-first.png` / `ruler-last.png`

넣은 뒤 `../index.html` 의 `KITS` 배열에서 해당 세트의
`firstImg` / `lastImg` 에 파일 이름만 적으면 미리보기가 뜹니다.

    firstImg: 'can-first.png', lastImg: 'can-last.png',

비워 두어도 페이지는 정상 동작합니다 — 이미지 자리에 안내가 뜨고
이미지 프롬프트는 그대로 복사할 수 있습니다.
