// Simple Korean Romanization for KBO Names
// This provides a fallback for names that don't have a hardcoded English equivalent

const CHO: Record<string, string> = {
  "ㄱ": "g", "ㄲ": "kk", "ㄴ": "n", "ㄷ": "d", "ㄸ": "tt", "ㄹ": "r",
  "ㅁ": "m", "ㅂ": "b", "ㅃ": "pp", "ㅅ": "s", "ㅆ": "ss", "ㅇ": "",
  "ㅈ": "j", "ㅉ": "jj", "ㅊ": "ch", "ㅋ": "k", "ㅌ": "t", "ㅍ": "p", "ㅎ": "h"
};

const JUNG: Record<string, string> = {
  "ㅏ": "a", "ㅐ": "ae", "ㅑ": "ya", "ㅒ": "yae", "ㅓ": "eo", "ㅔ": "e",
  "ㅕ": "yeo", "ㅖ": "ye", "ㅗ": "o", "ㅘ": "wa", "ㅙ": "wae", "ㅚ": "oe",
  "ㅛ": "yo", "ㅜ": "u", "ㅝ": "wo", "ㅞ": "we", "ㅟ": "wi", "ㅠ": "yu",
  "ㅡ": "eu", "ㅢ": "ui", "ㅣ": "i"
};

const JONG: Record<string, string> = {
  "": "", "ㄱ": "k", "ㄲ": "k", "ㄳ": "k", "ㄴ": "n", "ㄵ": "n", "ㄶ": "n",
  "ㄷ": "t", "ㄹ": "l", "ㄺ": "k", "ㄻ": "m", "ㄼ": "p", "ㄽ": "l", "ㄾ": "l",
  "ㄿ": "p", "ㅀ": "l", "ㅁ": "m", "ㅂ": "p", "ㅄ": "p", "ㅅ": "t", "ㅆ": "t",
  "ㅇ": "ng", "ㅈ": "t", "ㅊ": "t", "ㅋ": "k", "ㅌ": "t", "ㅍ": "p", "ㅎ": "t"
};

// Hardcoded KBO player name exceptions (foreign players sourced from DB)
const EXCEPTIONS: Record<string, string> = {
  // Korean players (irregular romanization)
  "김도영": "Kim Do-yeong",
  "구자욱": "Koo Ja-wook",
  "최정": "Choi Jeong",
  "이정후": "Lee Jung-hoo",
  "류현진": "Ryu Hyun-jin",
  "양의지": "Yang Eui-ji",
  "박병호": "Park Byung-ho",
  "구본혁": "Koo Bon-hyeok",
  "강백호": "Kang Baek-ho",
  // Foreign players (all confirmed in DB)
  "가라비토": "Garabito",
  "감보아": "Gamboa",
  "네일": "Neil",
  "데이비슨": "Davidson",
  "디아즈": "Diaz",
  "라일리": "Riley",
  "레예스": "Reyes",
  "레이예스": "Reyes",
  "로건": "Logan",
  "로젠버그": "Rosenberg",
  "로하스": "Rojas",
  "리베라토": "Liberato",
  "맥브룸": "McBroom",
  "메르세데스": "Mercedes",
  "반즈": "Barnes",
  "벨라스케즈": "Velasquez",
  "소크라테스": "Socrates",
  "스톤": "Stone",
  "스티븐슨": "Stevenson",
  "알칸타라": "Alcantara",
  "앤더슨": "Anderson",
  "에레디아": "Heredia",
  "에르난데스": "Hernandez",
  "오스틴": "Austin",
  "올러": "Oller",
  "와이스": "Weiss",
  "웰스": "Wells",
  "위즈덤": "Wisdom",
  "잭로그": "Logue",
  "치리노스": "Chirinos",
  "카디네스": "Cardines",
  "케이브": "Cave",
  "윈": "Wijn",        // 코엔 윈 → compact → 윈
  "콜어빈": "Irvin",
  "쿠에바스": "Cuevas",
  "톨허스트": "Tolhurst",
  "패트릭": "Patrick",
  "페라자": "Peraza",
  "도슨": "Dawson",
  "폰세": "Ponce",
  "푸이그": "Puig",
  "플로리얼": "Florial",
  "헤이수스": "Jesus",
  "화이트": "White",
  "후라도": "Jurado",
  // Teams
  "기아": "KIA",
  "두산": "Doosan",
  "롯데": "Lotte",
  "삼성": "Samsung",
  "키움": "Kiwoom",
  "한화": "Hanwha",
};

export function romanizeKorean(text: string): string {
  if (!text) return "";
  
  if (EXCEPTIONS[text]) return EXCEPTIONS[text];
  
  let result = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);

    if (code < 0xAC00 || code > 0xD7A3) {
      result += char;
      continue;
    }

    const index = code - 0xAC00;
    const choIndex = Math.floor(index / 588);
    const jungIndex = Math.floor((index - (choIndex * 588)) / 28);
    const jongIndex = index % 28;

    const choStr = Object.keys(CHO)[choIndex];
    const jungStr = Object.keys(JUNG)[jungIndex];
    const jongStr = Object.keys(JONG)[jongIndex];

    let syl = "";
    
    if (i === 0) {
      if (char === "김") syl = "Kim";
      else if (char === "이") syl = "Lee";
      else if (char === "박") syl = "Park";
      else if (char === "최") syl = "Choi";
      else if (char === "정") syl = "Jeong";
      else if (char === "강") syl = "Kang";
      else if (char === "조") syl = "Cho";
      else if (char === "윤") syl = "Yoon";
      else if (char === "장") syl = "Jang";
      else if (char === "임") syl = "Lim";
      else syl = CHO[choStr] + JUNG[jungStr] + JONG[jongStr];
      
      if (syl.length > 0 && syl[0] === syl[0].toLowerCase()) {
        syl = syl.charAt(0).toUpperCase() + syl.slice(1);
      }
    } else {
      syl = CHO[choStr] + JUNG[jungStr] + JONG[jongStr];
      if (text.length === 3 && i === 1) {
        syl = " " + syl.charAt(0).toUpperCase() + syl.slice(1);
      } else if (text.length === 3 && i === 2) {
        syl = "-" + syl;
      }
    }
    
    result += syl;
  }

  return result;
}

function compactForeignPlayerName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed.includes(" ")) return trimmed;
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] || trimmed;
}

export function formatPlayerName(name: string, lang: "ko" | "en"): string {
  const compactName = compactForeignPlayerName(name);
  if (lang === "ko") return compactName;
  return romanizeKorean(compactName);
}

export function formatTeamName(team: string, lang: "ko" | "en"): string {
  if (lang === "ko") return team;
  
  const teamExceptions: Record<string, string> = {
    "두산": "Doosan",
    "롯데": "Lotte",
    "삼성": "Samsung",
    "키움": "Kiwoom",
    "한화": "Hanwha",
    "기아": "KIA",
  };
  
  return teamExceptions[team] || team;
}

// ─── QWERTY → Korean (handle IME-off mistyping) ──────────────────────────────

const QWERTY_TO_JAMO: Record<string, string> = {
  q:"ㅂ", w:"ㅈ", e:"ㄷ", r:"ㄱ", t:"ㅅ",
  y:"ㅛ", u:"ㅕ", i:"ㅑ", o:"ㅐ", p:"ㅔ",
  a:"ㅁ", s:"ㄴ", d:"ㅇ", f:"ㄹ", g:"ㅎ",
  h:"ㅗ", j:"ㅓ", k:"ㅏ", l:"ㅣ",
  z:"ㅋ", x:"ㅌ", c:"ㅊ", v:"ㅍ", b:"ㅠ", n:"ㅜ", m:"ㅡ",
};

const CHO_LIST = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JUNG_LIST = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const JONG_LIST = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const VOWELS = new Set(JUNG_LIST);
const VALID_JONG = new Set(["ㄱ","ㄲ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"]);

function makeSyllable(cho: string, jung: string, jong = ""): string {
  const ci = CHO_LIST.indexOf(cho);
  const vi = JUNG_LIST.indexOf(jung);
  const ji = JONG_LIST.indexOf(jong);
  if (ci < 0 || vi < 0 || ji < 0) return cho + jung + jong;
  return String.fromCharCode(0xAC00 + (ci * 21 + vi) * 28 + ji);
}

function composeJamo(jamos: string[]): string {
  let result = "";
  let cho = "", jung = "", jong = "";

  const flush = () => {
    if (cho && jung) result += makeSyllable(cho, jung, jong);
    else if (cho) result += cho;
    else if (jung) result += makeSyllable("ㅇ", jung, jong);
    cho = ""; jung = ""; jong = "";
  };

  for (const j of jamos) {
    if (VOWELS.has(j)) {
      if (jong) {
        // tentative jong becomes next syllable's cho
        const savedJong = jong;
        if (cho && jung) result += makeSyllable(cho, jung, "");
        cho = savedJong; jung = j; jong = "";
      } else if (jung) {
        flush(); cho = "ㅇ"; jung = j;
      } else if (cho) {
        jung = j;
      } else {
        cho = "ㅇ"; jung = j;
      }
    } else {
      // consonant
      if (jong) {
        flush(); cho = j;
      } else if (jung) {
        if (VALID_JONG.has(j)) jong = j;
        else { flush(); cho = j; }
      } else if (cho) {
        flush(); cho = j;
      } else {
        cho = j;
      }
    }
  }
  flush();
  return result;
}

/**
 * Convert an English-keyboard string typed while IME was off
 * back into Korean. e.g. "rlaehdud" → "김도영"
 * Returns the original string unchanged if no mapping is possible.
 */
export function qwertyToKorean(input: string): string {
  const jamos = input.toLowerCase().split("").map(c => QWERTY_TO_JAMO[c] ?? c);
  // If nothing was mapped, return original
  if (jamos.every((j, i) => j === input[i])) return input;
  return composeJamo(jamos);
}
