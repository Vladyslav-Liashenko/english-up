// Неправильні дієслова: V1 | V2 | V3 | укр | рус
window.VERBS_RAW = `
be|was / were|been|бути|быть
beat|beat|beaten|бити|бить
become|became|become|ставати|становиться
begin|began|begun|починати|начинать
bend|bent|bent|гнути|гнуть
bet|bet|bet|битися об заклад|держать пари
bite|bit|bitten|кусати|кусать
blow|blew|blown|дути|дуть
break|broke|broken|ламати|ломать
bring|brought|brought|приносити|приносить
build|built|built|будувати|строить
burn|burnt / burned|burnt / burned|горіти, палити|гореть, жечь
buy|bought|bought|купувати|покупать
catch|caught|caught|ловити|ловить
choose|chose|chosen|обирати|выбирать
come|came|come|приходити|приходить
cost|cost|cost|коштувати|стоить
cut|cut|cut|різати|резать
deal|dealt|dealt|мати справу|иметь дело
dig|dug|dug|копати|копать
do|did|done|робити|делать
draw|drew|drawn|малювати|рисовать
dream|dreamt / dreamed|dreamt / dreamed|мріяти, бачити сни|мечтать, видеть сны
drink|drank|drunk|пити|пить
drive|drove|driven|керувати авто|водить машину
eat|ate|eaten|їсти|есть
fall|fell|fallen|падати|падать
feed|fed|fed|годувати|кормить
feel|felt|felt|відчувати|чувствовать
fight|fought|fought|битися|драться
find|found|found|знаходити|находить
fly|flew|flown|літати|летать
forbid|forbade|forbidden|забороняти|запрещать
forget|forgot|forgotten|забувати|забывать
forgive|forgave|forgiven|прощати|прощать
freeze|froze|frozen|замерзати|замерзать
get|got|got / gotten|отримувати, ставати|получать, становиться
give|gave|given|давати|давать
go|went|gone|йти, їхати|идти, ехать
grow|grew|grown|рости|расти
hang|hung|hung|вішати|вешать
have|had|had|мати|иметь
hear|heard|heard|чути|слышать
hide|hid|hidden|ховати|прятать
hit|hit|hit|ударяти|ударять
hold|held|held|тримати|держать
hurt|hurt|hurt|завдавати болю|причинять боль
keep|kept|kept|зберігати|хранить
know|knew|known|знати|знать
lay|laid|laid|класти|класть
lead|led|led|вести|вести
learn|learnt / learned|learnt / learned|вчити|учить
leave|left|left|залишати, їхати|оставлять, уезжать
lend|lent|lent|позичати (комусь)|одалживать (кому-то)
let|let|let|дозволяти|позволять
lie|lay|lain|лежати|лежать
light|lit|lit|запалювати|зажигать
lose|lost|lost|губити, програвати|терять, проигрывать
make|made|made|робити, створювати|делать, создавать
mean|meant|meant|означати|означать
meet|met|met|зустрічати|встречать
pay|paid|paid|платити|платить
put|put|put|класти|класть
quit|quit|quit|кидати, звільнятися|бросать, увольняться
read|read|read|читати|читать
ride|rode|ridden|їздити верхи|ездить верхом
ring|rang|rung|дзвонити|звонить
rise|rose|risen|підніматися|подниматься
run|ran|run|бігти|бежать
say|said|said|казати|сказать
see|saw|seen|бачити|видеть
seek|sought|sought|шукати|искать
sell|sold|sold|продавати|продавать
send|sent|sent|надсилати|отправлять
set|set|set|встановлювати|устанавливать
shake|shook|shaken|трясти|трясти
shine|shone|shone|сяяти|сиять
shoot|shot|shot|стріляти|стрелять
show|showed|shown|показувати|показывать
shut|shut|shut|зачиняти|закрывать
sing|sang|sung|співати|петь
sink|sank|sunk|тонути|тонуть
sit|sat|sat|сидіти|сидеть
sleep|slept|slept|спати|спать
speak|spoke|spoken|говорити|говорить
spend|spent|spent|витрачати, проводити час|тратить, проводить время
spread|spread|spread|поширювати|распространять
stand|stood|stood|стояти|стоять
steal|stole|stolen|красти|красть
stick|stuck|stuck|приклеювати|приклеивать
swim|swam|swum|плавати|плавать
take|took|taken|брати|брать
teach|taught|taught|навчати|учить (кого-то)
tear|tore|torn|рвати|рвать
tell|told|told|розповідати|рассказывать
think|thought|thought|думати|думать
throw|threw|thrown|кидати|бросать
understand|understood|understood|розуміти|понимать
wake|woke|woken|прокидатися|просыпаться
wear|wore|worn|носити (одяг)|носить (одежду)
win|won|won|перемагати|побеждать
write|wrote|written|писати|писать
`;

window.VERBS = window.VERBS_RAW.trim().split('\n').map(function (l) {
  var p = l.split('|');
  return { v1: p[0], v2: p[1], v3: p[2], uk: p[3], ru: p[4] };
});
