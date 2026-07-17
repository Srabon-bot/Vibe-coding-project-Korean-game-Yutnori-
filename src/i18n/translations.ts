export type Language = 'en' | 'ko' | 'bn';

export type TFunc = (key: string, vars?: Record<string, string | number>) => string;

export const LANGUAGES: Language[] = ['en', 'ko', 'bn'];

/** Native display name for each language — always shown in its own script, never translated. */
export const LANGUAGE_META: Record<Language, { nativeName: string }> = {
  en: { nativeName: 'English' },
  ko: { nativeName: '한국어' },
  bn: { nativeName: 'বাংলা' },
};

const en: Record<string, string> = {
  'app.title': 'Yutnori (윷놀이)',

  'home.title': 'Yutnori',
  'home.subtitle': 'A traditional Korean board game',
  'home.chooseCharacters': 'Choose your characters',
  'home.pieceCount': 'Pieces per player',
  'home.pieceCountTraditional': '4 pieces (traditional)',
  'home.pieceCountQuick': '2 pieces (quick game)',
  'home.localPlay': 'Local Play',
  'home.localPlayDesc': 'Two players, one device',
  'home.vsAi': 'VS AI',
  'home.vsAiDesc': 'One player vs the computer',
  'home.footer': 'Throw the yut sticks, race your pieces home, catch your opponent along the way.',

  'home.aiDifficulty.title': 'Choose AI difficulty',
  'home.aiDifficulty.easy': 'Easy',
  'home.aiDifficulty.easyDesc': 'Moves at random — great for learning the ropes',
  'home.aiDifficulty.medium': 'Medium',
  'home.aiDifficulty.mediumDesc': 'Plays sensible, straightforward moves',
  'home.aiDifficulty.hard': 'Hard',
  'home.aiDifficulty.hardDesc': 'Plays to win — catches and finishes whenever it can',
  'home.aiNickname': 'AI · {level}',

  'settings.soundOn': 'Sound On',
  'settings.soundOff': 'Sound Off',
  'settings.howToPlay': 'How to Play',
  'settings.newGame': 'New Game',
  'settings.language': 'Language',

  'tutorial.title': 'How to play Yutnori (윷놀이)',
  'tutorial.card1.title': 'Finish all 4 pieces first',
  'tutorial.card1.body':
    'Throw the yut sticks and move a piece by the number shown. The first player to bring all 4 pieces across the finish wins.',
  'tutorial.card2.title': 'Yut throws',
  'tutorial.card3.title': 'Stacking and capturing',
  'tutorial.card3.body':
    "Land on your own piece to stack up and move together. Land on an opponent's piece to send it back to Start — and you get another throw.",
  'tutorial.card4.title': 'Shortcuts through the center',
  'tutorial.card4.body':
    'Land exactly on a junction or the center to unlock a shortcut on your next move. Check the on-board preview and pick the better route.',
  'tutorial.card5.title': 'A living cosmos',
  'tutorial.card5.body':
    "The board's 29 points represent the 28 constellations circling the North Star at the center. The sticks' flat and round sides are yin and yang, and pieces travel counterclockwise — just like the Big Dipper wheeling around the pole star.",
  'tutorial.play': "Let's play!",

  'animal.do': 'Pig',
  'animal.gae': 'Dog',
  'animal.geol': 'Sheep',
  'animal.yut': 'Cow',
  'animal.mo': 'Horse',

  'kind.do': 'Do',
  'kind.gae': 'Gae',
  'kind.geol': 'Geol',
  'kind.yut': 'Yut',
  'kind.mo': 'Mo',
  'kind.backdo': 'Back-do',

  'distance.do': '1 space',
  'distance.gae': '2 spaces',
  'distance.geol': '3 spaces',
  'distance.yut': '4 spaces + extra throw',
  'distance.mo': '5 spaces + extra throw',
  'distance.backdo': '1 space back',

  'position.start': 'Start',
  'position.center': 'Center',
  'position.shortcut': 'On the shortcut',
  'position.outer': 'Outer {n}/20',

  'throwHeader.forward.one': '{kind} · move {steps} step',
  'throwHeader.forward.other': '{kind} · move {steps} steps',
  'throwHeader.back.one': '{kind} · move {steps} step back',
  'throwHeader.back.other': '{kind} · move {steps} steps back',

  'piece.label': 'Piece {n}',
  'piece.stackSuffix': ' (+{count})',

  'branch.title': 'A shortcut is available!',
  'branch.body': 'Your piece reached {position}. Continue along the outer path, or cut through the center?',
  'branch.optionFinish': 'Head straight to the finish',
  'branch.optionShortcut': 'Take the shortcut through the center',
  'branch.optionOuter': 'Continue along the outer path ({position})',

  'assignment.title': 'Choose a move',

  'rules.reminder':
    "Land on a junction to unlock a shortcut, stack your own pieces, capture your opponent's. Bring all 4 pieces home first to win.",

  'hint.firstThrow': 'Nice throw! Pick a legal move below — or keep throwing if you earned an extra turn.',
  'hint.firstCatch': 'Caught! Their piece is sent back to start, and you get another throw.',
  'hint.firstStack': 'Stacked! Those pieces now move together as one group for the rest of the game.',

  'throwButton.checking': 'Checking the result',
  'throwButton.throw': 'Throw sticks',

  'turn.judging': "Judging {nickname}'s throw",
  'turn.turn': "{nickname}'s turn",

  'win.title': '{nickname} wins!',
  'win.subtitle': 'All pieces made it home. 축하합니다! (Congratulations!)',
  'win.playAgain': 'Play again',
  'win.banner3d': '{nickname} WINS!',

  'newGame.title': 'Start a new game?',
  'newGame.body': "The current game's progress will be lost.",
  'newGame.cancel': 'Cancel',
  'newGame.confirm': 'Start new game',

  'customization.title': "Who's playing?",
  'customization.or': 'or',
  'customization.playerPlaceholder': 'Player {n}',
  'customization.changePhoto': 'Change photo',
  'customization.addPhoto': 'Add photo (optional)',
  'customization.remove': 'Remove',
  'customization.errorType': 'Please choose an image file.',
  'customization.errorSize': 'Image is too large (max 2MB).',
  'customization.alreadyPicked': '{name} is already picked',
  'customization.start': 'Start game',

  'throwOverlay.result': 'Throw result',

  'preview.sendsBack': '{kind} sends it back to Start',
  'preview.finishes': '{kind} — finishes!',
  'preview.choosePath': '{kind} — choose a path here',
  'preview.landsHere': '{kind} lands here',
};

const ko: Record<string, string> = {
  'app.title': '윷놀이',

  'home.title': '윷놀이',
  'home.subtitle': '한국 전통 보드게임',
  'home.chooseCharacters': '캐릭터를 선택하세요',
  'home.pieceCount': '말 개수',
  'home.pieceCountTraditional': '4개 (전통)',
  'home.pieceCountQuick': '2개 (빠른 게임)',
  'home.localPlay': '로컬 플레이',
  'home.localPlayDesc': '한 기기로 두 명이 함께',
  'home.vsAi': 'AI 대전',
  'home.vsAiDesc': '컴퓨터와 대결',
  'home.footer': '윷을 던지고, 말을 이동시키고, 상대의 말을 잡아보세요.',

  'home.aiDifficulty.title': 'AI 난이도를 선택하세요',
  'home.aiDifficulty.easy': '쉬움',
  'home.aiDifficulty.easyDesc': '무작위로 움직여요 — 처음 배우기 좋아요',
  'home.aiDifficulty.medium': '보통',
  'home.aiDifficulty.mediumDesc': '합리적이고 무난한 수를 둬요',
  'home.aiDifficulty.hard': '어려움',
  'home.aiDifficulty.hardDesc': '이기려고 최선을 다해요 — 잡기와 완주를 놓치지 않아요',
  'home.aiNickname': 'AI · {level}',

  'settings.soundOn': '효과음 켜짐',
  'settings.soundOff': '효과음 꺼짐',
  'settings.howToPlay': '게임 방법',
  'settings.newGame': '새 게임',
  'settings.language': '언어',

  'tutorial.title': '윷놀이 하는 법',
  'tutorial.card1.title': '말 4개를 먼저 모두 완주시키세요',
  'tutorial.card1.body':
    '윷가락을 던져 나온 수만큼 말을 이동시키세요. 4개의 말을 모두 먼저 완주시키는 사람이 승리합니다.',
  'tutorial.card2.title': '윷 던지기 결과',
  'tutorial.card3.title': '말 업기와 잡기',
  'tutorial.card3.body':
    '자신의 말이 있는 칸에 도착하면 말을 업어서 함께 움직입니다. 상대의 말이 있는 칸에 도착하면 그 말을 처음으로 돌려보내고, 한 번 더 던질 수 있습니다.',
  'tutorial.card4.title': '중앙을 통과하는 지름길',
  'tutorial.card4.body':
    '갈림길이나 중앙에 정확히 도착하면 다음 이동에서 지름길을 사용할 수 있습니다. 보드 위 미리보기를 확인하고 더 나은 경로를 선택하세요.',
  'tutorial.card5.title': '살아있는 우주',
  'tutorial.card5.body':
    '말판의 29개의 자리는 중앙의 북극성을 도는 28개의 별자리를 나타냅니다. 윷가락의 평평한 면과 둥근 면은 각각 음과 양을 상징하며, 말은 북두칠성이 북극성을 도는 방향처럼 시계 반대 방향으로 이동합니다.',
  'tutorial.play': '게임 시작!',

  'animal.do': '돼지',
  'animal.gae': '개',
  'animal.geol': '양',
  'animal.yut': '소',
  'animal.mo': '말',

  'kind.do': '도',
  'kind.gae': '개',
  'kind.geol': '걸',
  'kind.yut': '윷',
  'kind.mo': '모',
  'kind.backdo': '백도',

  'distance.do': '1칸',
  'distance.gae': '2칸',
  'distance.geol': '3칸',
  'distance.yut': '4칸 + 추가 던지기',
  'distance.mo': '5칸 + 추가 던지기',
  'distance.backdo': '1칸 뒤로',

  'position.start': '시작점',
  'position.center': '중앙',
  'position.shortcut': '지름길 위',
  'position.outer': '바깥길 {n}/20',

  'throwHeader.forward.one': '{kind} · {steps}칸 이동',
  'throwHeader.forward.other': '{kind} · {steps}칸 이동',
  'throwHeader.back.one': '{kind} · {steps}칸 뒤로 이동',
  'throwHeader.back.other': '{kind} · {steps}칸 뒤로 이동',

  'piece.label': '말 {n}',
  'piece.stackSuffix': ' (+{count})',

  'branch.title': '지름길을 사용할 수 있어요!',
  'branch.body': '말이 {position}에 도착했습니다. 바깥길로 계속 갈까요, 중앙을 가로질러 갈까요?',
  'branch.optionFinish': '결승점으로 바로 가기',
  'branch.optionShortcut': '중앙을 통과하는 지름길로 가기',
  'branch.optionOuter': '바깥길로 계속 가기 ({position})',

  'assignment.title': '이동할 말 선택',

  'rules.reminder':
    '갈림길에 도착하면 지름길이 열리고, 자신의 말은 업을 수 있으며 상대의 말은 잡을 수 있습니다. 4개의 말을 먼저 모두 완주시키면 승리합니다.',

  'hint.firstThrow': '좋은 던지기예요! 아래에서 이동할 말을 선택하세요 — 추가 던지기를 얻었다면 계속 던지세요.',
  'hint.firstCatch': '잡았습니다! 상대의 말이 시작점으로 돌아가고, 한 번 더 던질 수 있습니다.',
  'hint.firstStack': '업었습니다! 이 말들은 이제 게임이 끝날 때까지 하나의 그룹으로 함께 움직입니다.',

  'throwButton.checking': '결과 확인 중',
  'throwButton.throw': '윷 던지기',

  'turn.judging': '{nickname}님의 던지기 판정 중',
  'turn.turn': '{nickname}님의 차례',

  'win.title': '{nickname}님 승리!',
  'win.subtitle': '모든 말이 완주했습니다. 축하합니다!',
  'win.playAgain': '다시 하기',
  'win.banner3d': '{nickname} 승리!',

  'newGame.title': '새 게임을 시작할까요?',
  'newGame.body': '현재 게임의 진행 상황이 사라집니다.',
  'newGame.cancel': '취소',
  'newGame.confirm': '새 게임 시작',

  'customization.title': '누가 플레이하나요?',
  'customization.or': '또는',
  'customization.playerPlaceholder': '플레이어 {n}',
  'customization.changePhoto': '사진 변경',
  'customization.addPhoto': '사진 추가 (선택 사항)',
  'customization.remove': '삭제',
  'customization.errorType': '이미지 파일을 선택해 주세요.',
  'customization.errorSize': '이미지 용량이 너무 큽니다 (최대 2MB).',
  'customization.alreadyPicked': '{name}은(는) 이미 선택되었습니다',
  'customization.start': '게임 시작',

  'throwOverlay.result': '던지기 결과',

  'preview.sendsBack': '{kind} — 시작점으로 돌아감',
  'preview.finishes': '{kind} — 완주!',
  'preview.choosePath': '{kind} — 여기서 경로 선택',
  'preview.landsHere': '{kind} — 여기 도착',
};

const bn: Record<string, string> = {
  'app.title': 'ইউতনরি (윷놀이)',

  'home.title': 'ইউতনরি',
  'home.subtitle': 'একটি ঐতিহ্যবাহী কোরিয়ান বোর্ড গেম',
  'home.chooseCharacters': 'আপনার চরিত্র বেছে নিন',
  'home.pieceCount': 'ঘুঁটির সংখ্যা',
  'home.pieceCountTraditional': '৪টি ঘুঁটি (ঐতিহ্যবাহী)',
  'home.pieceCountQuick': '২টি ঘুঁটি (দ্রুত খেলা)',
  'home.localPlay': 'লোকাল প্লে',
  'home.localPlayDesc': 'দুই খেলোয়াড়, এক ডিভাইস',
  'home.vsAi': 'এআই-এর বিরুদ্ধে',
  'home.vsAiDesc': 'কম্পিউটারের বিরুদ্ধে খেলুন',
  'home.footer': 'ইউত কাঠি ছুঁড়ুন, ঘুঁটি নিয়ে দৌড়ান, পথে প্রতিপক্ষকে ধরুন।',

  'home.aiDifficulty.title': 'এআই কঠিনতা বেছে নিন',
  'home.aiDifficulty.easy': 'সহজ',
  'home.aiDifficulty.easyDesc': 'এলোমেলোভাবে চলে — শেখার জন্য ভালো',
  'home.aiDifficulty.medium': 'মাঝারি',
  'home.aiDifficulty.mediumDesc': 'বুদ্ধিদীপ্ত, সাধারণ চাল খেলে',
  'home.aiDifficulty.hard': 'কঠিন',
  'home.aiDifficulty.hardDesc': 'জেতার জন্য খেলে — ধরা ও সমাপ্তির সুযোগ হাতছাড়া করে না',
  'home.aiNickname': 'AI · {level}',

  'settings.soundOn': 'সাউন্ড চালু',
  'settings.soundOff': 'সাউন্ড বন্ধ',
  'settings.howToPlay': 'খেলার নিয়ম',
  'settings.newGame': 'নতুন খেলা',
  'settings.language': 'ভাষা',

  'tutorial.title': 'ইউতনরি খেলার নিয়ম (윷놀이)',
  'tutorial.card1.title': 'সবার আগে ৪টি ঘুঁটি শেষ করুন',
  'tutorial.card1.body':
    'ইউত কাঠি ছুঁড়ে যে সংখ্যা আসবে, সেই অনুযায়ী ঘুঁটি সরান। যে খেলোয়াড় প্রথমে ৪টি ঘুঁটিকে সম্পূর্ণ পথ পার করাতে পারবে, সে জয়ী হবে।',
  'tutorial.card2.title': 'ইউত ছোঁড়ার ফলাফল',
  'tutorial.card3.title': 'ঘুঁটি জড়ো করা ও ধরা',
  'tutorial.card3.body':
    'নিজের ঘুঁটির ঘরে পৌঁছালে ঘুঁটিগুলো একসাথে জড়ো হয়ে চলবে। প্রতিপক্ষের ঘুঁটির ঘরে পৌঁছালে সেই ঘুঁটি শুরুতে ফিরে যাবে এবং আপনি আরেকবার ছোঁড়ার সুযোগ পাবেন।',
  'tutorial.card4.title': 'কেন্দ্রের মধ্য দিয়ে শর্টকাট',
  'tutorial.card4.body':
    'কোনো মোড় বা কেন্দ্রে সঠিকভাবে পৌঁছালে পরের চালে শর্টকাট খুলে যাবে। বোর্ডের প্রিভিউ দেখে ভালো পথটি বেছে নিন।',
  'tutorial.card5.title': 'একটি জীবন্ত মহাবিশ্ব',
  'tutorial.card5.body':
    'বোর্ডের ২৯টি বিন্দু কেন্দ্রের ধ্রুবতারাকে ঘিরে থাকা ২৮টি নক্ষত্রমণ্ডলকে নির্দেশ করে। কাঠির চ্যাপ্টা ও গোল দিক যথাক্রমে ইয়িন ও ইয়াং প্রতিনিধিত্ব করে, আর ঘুঁটিগুলো সপ্তর্ষিমণ্ডল ধ্রুবতারাকে যেভাবে ঘোরে, সেভাবেই ঘড়ির কাঁটার বিপরীত দিকে চলে।',
  'tutorial.play': 'চলো খেলি!',

  'animal.do': 'শূকর',
  'animal.gae': 'কুকুর',
  'animal.geol': 'ভেড়া',
  'animal.yut': 'গরু',
  'animal.mo': 'ঘোড়া',

  'kind.do': 'দো',
  'kind.gae': 'গে',
  'kind.geol': 'গোল',
  'kind.yut': 'ইউত',
  'kind.mo': 'মো',
  'kind.backdo': 'ব্যাক-দো',

  'distance.do': '১ ঘর',
  'distance.gae': '২ ঘর',
  'distance.geol': '৩ ঘর',
  'distance.yut': '৪ ঘর + বাড়তি চাল',
  'distance.mo': '৫ ঘর + বাড়তি চাল',
  'distance.backdo': '১ ঘর পেছনে',

  'position.start': 'শুরু',
  'position.center': 'কেন্দ্র',
  'position.shortcut': 'শর্টকাটে',
  'position.outer': 'বাইরের পথ {n}/20',

  'throwHeader.forward.one': '{kind} · {steps} ঘর সামনে',
  'throwHeader.forward.other': '{kind} · {steps} ঘর সামনে',
  'throwHeader.back.one': '{kind} · {steps} ঘর পেছনে',
  'throwHeader.back.other': '{kind} · {steps} ঘর পেছনে',

  'piece.label': 'ঘুঁটি {n}',
  'piece.stackSuffix': ' (+{count})',

  'branch.title': 'একটি শর্টকাট পাওয়া যাচ্ছে!',
  'branch.body': 'আপনার ঘুঁটি {position}-এ পৌঁছেছে। বাইরের পথ ধরে চালিয়ে যাবেন, নাকি কেন্দ্র দিয়ে শর্টকাট নেবেন?',
  'branch.optionFinish': 'সরাসরি শেষ প্রান্তে যান',
  'branch.optionShortcut': 'কেন্দ্র দিয়ে শর্টকাট নিন',
  'branch.optionOuter': 'বাইরের পথ ধরে চালিয়ে যান ({position})',

  'assignment.title': 'একটি চাল বেছে নিন',

  'rules.reminder':
    'মোড়ে পৌঁছালে শর্টকাট খুলে যায়, নিজের ঘুঁটি জড়ো করা যায় এবং প্রতিপক্ষের ঘুঁটি ধরা যায়। ৪টি ঘুঁটি সবার আগে ঘরে আনতে পারলেই জয়।',

  'hint.firstThrow': 'সুন্দর চাল! নিচে থেকে একটি বৈধ চাল বেছে নিন — অতিরিক্ত চাল পেয়ে থাকলে আবার ছুঁড়ুন।',
  'hint.firstCatch': 'ধরা পড়েছে! প্রতিপক্ষের ঘুঁটি শুরুতে ফিরে গেছে, আর আপনি আরেকবার ছোঁড়ার সুযোগ পেয়েছেন।',
  'hint.firstStack': 'জড়ো হয়েছে! এই ঘুঁটিগুলো এখন থেকে খেলার বাকি সময় একসাথে একটি দল হিসেবে চলবে।',

  'throwButton.checking': 'ফলাফল যাচাই করা হচ্ছে',
  'throwButton.throw': 'কাঠি ছুঁড়ুন',

  'turn.judging': '{nickname}-এর চাল যাচাই করা হচ্ছে',
  'turn.turn': '{nickname}-এর পালা',

  'win.title': '{nickname} জয়ী!',
  'win.subtitle': 'সব ঘুঁটি ঘরে পৌঁছে গেছে। অভিনন্দন! (축하합니다!)',
  'win.playAgain': 'আবার খেলুন',
  'win.banner3d': '{nickname} বিজয়ী!',

  'newGame.title': 'নতুন খেলা শুরু করবেন?',
  'newGame.body': 'বর্তমান খেলার অগ্রগতি হারিয়ে যাবে।',
  'newGame.cancel': 'বাতিল',
  'newGame.confirm': 'নতুন খেলা শুরু করুন',

  'customization.title': 'কে খেলছেন?',
  'customization.or': 'অথবা',
  'customization.playerPlaceholder': 'খেলোয়াড় {n}',
  'customization.changePhoto': 'ছবি পরিবর্তন করুন',
  'customization.addPhoto': 'ছবি যোগ করুন (ঐচ্ছিক)',
  'customization.remove': 'মুছুন',
  'customization.errorType': 'অনুগ্রহ করে একটি ছবি ফাইল বেছে নিন।',
  'customization.errorSize': 'ছবির আকার খুব বড় (সর্বোচ্চ ২ মেগাবাইট)।',
  'customization.alreadyPicked': '{name} ইতিমধ্যে নির্বাচিত হয়েছে',
  'customization.start': 'খেলা শুরু করুন',

  'throwOverlay.result': 'চালের ফলাফল',

  'preview.sendsBack': '{kind} — শুরুতে ফিরে যাবে',
  'preview.finishes': '{kind} — সমাপ্ত!',
  'preview.choosePath': '{kind} — এখানে পথ বেছে নিন',
  'preview.landsHere': '{kind} এখানে থামবে',
};

const DICTS: Record<Language, Record<string, string>> = { en, ko, bn };

/** Looks up `key` in `lang`'s dictionary (falling back to English, then the raw key), then
 * substitutes any `{name}` placeholders from `vars`. */
export function translate(lang: Language, key: string, vars?: Record<string, string | number>): string {
  const template = DICTS[lang][key] ?? DICTS.en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}
