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

// Hardcoded prominent KBO players for common exceptions
const EXCEPTIONS: Record<string, string> = {
  "김도영": "Kim Do-yeong",
  "구자욱": "Koo Ja-wook",
  "최정": "Choi Jeong",
  "이정후": "Lee Jung-hoo",
  "류현진": "Ryu Hyun-jin",
  "양의지": "Yang Eui-ji",
  "박병호": "Park Byung-ho",
  "에레디아": "Heredia",
  "소크라테스": "Socrates",
  "데이비슨": "Davidson",
  "오스틴": "Austin",
  "로하스": "Rojas",
  "구본혁": "Koo Bon-hyeok",
  "강백호": "Kang Baek-ho",
  "페라자": "Peraza",
  "도슨": "Dawson",
  "레이예스": "Reyes",
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
  
  // Check exact exceptions first
  if (EXCEPTIONS[text]) return EXCEPTIONS[text];
  
  // Try to romanize each character
  let result = "";
  let isFirstChar = true;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);

    // If not a Korean syllable, leave it
    if (code < 0xAC00 || code > 0xD7A3) {
      if (char !== ' ') isFirstChar = true;
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
    
    // First character special rules (e.g. 김 -> Kim not Gim, 박 -> Park not Bak)
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
      
      // Capitalize first letter if not already done
      if (syl.length > 0 && syl[0] === syl[0].toLowerCase()) {
        syl = syl.charAt(0).toUpperCase() + syl.slice(1);
      }
    } else {
      syl = CHO[choStr] + JUNG[jungStr] + JONG[jongStr];
      // Add hyphen between given names
      if (text.length === 3 && i === 1) {
        syl = " " + syl.charAt(0).toUpperCase() + syl.slice(1);
      } else if (text.length === 3 && i === 2) {
        syl = "-" + syl;
      }
    }
    
    result += syl;
    isFirstChar = false;
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
  
  // Handle team names that are Korean
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
