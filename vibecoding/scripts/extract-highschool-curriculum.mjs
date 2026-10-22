// Read the curriculum map's embedded data without executing the app.
// Usage: node extract-highschool-curriculum.mjs <science-curriculum-map/index.html>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const input = process.argv[2];
if (!input) throw new Error('Provide the curriculum map HTML path.');
const source = fs.readFileSync(input, 'utf8');
const line = source.split(/\r?\n/).find(s => s.startsWith('const DATA = '));
if (!line) throw new Error('Embedded DATA not found.');
const data = JSON.parse(line.slice('const DATA = '.length).replace(/;\s*$/, ''));
// Correct one known table-text spill after checking the curriculum source block.
// source_sections.json: 통합과학1, 통합과학2 > 성취기준 > 10통과2-01-03 해설.
const correctedExplanation = '산화·환원 반응을 산소와 전자의 이동으로 설명하되, 산화수는 다루지 않는다.';
const oxidationExplanation = data.units.find(u=>u.id==='h2-01')?.haeseol.find(s=>s.code==='10통과2-01-03');
const corrections = [];
if (oxidationExplanation?.text.startsWith(correctedExplanation) && oxidationExplanation.text.includes('가치·태도')) {
  oxidationExplanation.text = correctedExplanation;
  corrections.push({code:'10통과2-01-03',field:'haeseol',reason:'원문 블록과 대조하여 해설 뒤에 붙은 내용 체계 표 문구 제거'});
}
const keys = ['h1', 'h2', ...Object.keys(data.subjects)];
const slugs = ['integrated-science-1','integrated-science-2','physics','chemistry','biology','earth-science','mechanics-energy','electromagnetism-quantum','matter-energy','chemical-reactions','cells-metabolism','genetics','earth-systems','planetary-space','science-history-culture','climate-ecology','convergence-inquiry'];
if (keys.length !== slugs.length) throw new Error('Review the subject mapping before extracting.');
const destination = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../downloads/highschool-curriculum');
fs.mkdirSync(destination, {recursive:true});
const appUrl = 'https://scienceisjo.github.io/teacher-toolkit/science-curriculum-map/';
const extracted = '2026-10-22';
const bullets = values => values.map(s => '- '+s).join('\n');
const subjects = keys.map((key,i) => {
  const units = data.units.filter(u => u.grade === key);
  const name = data.subjects[key]?.name || (key === 'h1' ? '통합과학1' : '통합과학2');
  return {key,name,track:data.subjects[key]?.track || '공통과목',file:slugs[i]+'.md',units:units.length,standards:units.reduce((n,u)=>n+u.standards.length,0),sourceUnits:units};
});
const allUnits = subjects.flatMap(s => s.sourceUnits);
const allCodes = allUnits.flatMap(u=>u.standards.map(s=>s.code));
if (new Set(allCodes).size !== allCodes.length) throw new Error('Duplicate standard code.');
function unitMarkdown(u) {
  const rows = [
    '### '+u.num+'. '+u.title, '', '앱 단원 ID: '+u.id, '',
    '#### 성취기준', '', ...u.standards.map(s=>'- ['+s.code+'] '+s.text), '',
    '#### 성취기준 해설', '',
    u.haeseol?.length ? u.haeseol.map(s=>'- '+(s.code?'['+s.code+'] ':'')+s.text).join('\n') : '앱에 수록된 해설 없음.', '',
    '#### 성취기준 적용 시 고려 사항', '', u.goryeo?.length ? bullets(u.goryeo) : '앱에 수록된 고려 사항 없음.', '',
    '#### 여기까지만 — 앱의 범위 제한 발췌', '', u.limits?.length ? bullets(u.limits) : '별도로 발췌된 제한 문장 없음. 위 해설과 고려 사항을 함께 확인한다.', '',
    '#### 성취기준별 성취수준', ''
  ];
  const levels = data.levels[u.id]?.codes || {};
  for (const s of u.standards) {
    rows.push('##### ['+s.code+']', '');
    if (!levels[s.code]) rows.push('앱에 수록된 성취수준 없음.', '');
    else rows.push(...Object.entries(levels[s.code]).map(([level,text])=>'- '+level+': '+text), '');
  }
  return rows.join('\n');
}
function heading(title) {
  return ['# '+title, '', '자료 구성: 조승재 · HNR TECH', '', '출처: [과학 나선 교육과정 지도]('+appUrl+') · 2022 개정 과학과 교육과정 · 추출일 '+extracted, '', '## 이 파일의 범위', '', '- 나선형 교육과정 앱에 수록된 고등학교 과학 교육과정 중 성취기준, 해설, 적용 시 고려 사항, 「여기까지만」, 성취기준별 성취수준을 옮겼습니다.', '- 해당 필드의 코드와 문장은 앱 데이터를 유지했습니다. 통합과학2 [10통과2-01-03] 해설 뒤에 섞인 내용 체계 표 문구 1건은 원문 추출 자료와 대조하여 제거했습니다.', '- 「여기까지만」은 앱에서 따로 발췌한 범위 제한이며, 해설과 고려 사항을 대체하지 않습니다.', '- 공식 고시문 전체가 아니라 앱 수록 자료의 발췌본입니다. 앱에 없는 과학탐구실험1·2 등은 추가하지 않았습니다. 탐구활동 목록·내용 체계 표·앱의 AI 문항 및 관찰 예시는 이 파일에 포함하지 않았습니다.', '- 실제 수업과 평가에 사용하기 전 성취기준 코드와 적용 범위를 원문으로 확인해 주세요.', '', '## AI에게 함께 요청할 내용', '', '내 수업 주제에 해당하는 성취기준 코드와 해설, 적용 시 고려 사항부터 확인해 줘. 선택한 과목의 범위를 넘어가는 내용은 넣지 마. 자료에서 확인되지 않는 기준·수준·실험 조건은 지어내지 말고 질문해 줘. 다른 과목의 내용을 섞지 말고, 수업 주제와 이 파일이 맞지 않으면 먼저 알려 줘.', ''].join('\n');
}
function subjectMarkdown(s) {
  return ['## '+s.name+' · '+s.track, '', s.units+'단원 · 성취기준 '+s.standards+'개', '', ...s.sourceUnits.map(unitMarkdown)].join('\n');
}
for (const s of subjects) fs.writeFileSync(path.join(destination,s.file), heading(s.name+' 교육과정')+'\n'+subjectMarkdown(s)+'\n');
fs.writeFileSync(path.join(destination,'highschool-science-all.md'),heading('고등학교 과학 교육과정 — 나선형 교육과정 앱 발췌')+'\n## 수록 과목\n\n'+subjects.map(s=>'- '+s.name+' ('+s.track+'): '+s.units+'단원 · '+s.standards+'개').join('\n')+'\n\n'+subjects.map(subjectMarkdown).join('\n\n')+'\n');
const manifest = {title:'나선형 교육과정 앱 · 고등학교 과학',source:appUrl,extracted,sourceDataSha256:crypto.createHash('sha256').update(line).digest('hex'),totalSubjects:subjects.length,totalUnits:allUnits.length,totalStandards:allCodes.length,fields:['standards','haeseol','goryeo','limits','levels.codes'],corrections,subjects:subjects.map(({sourceUnits,...s})=>s)};
fs.writeFileSync(path.join(destination,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({subjects:subjects.length,units:allUnits.length,standards:allCodes.length,files:subjects.length+2}));
