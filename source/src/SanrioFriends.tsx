// Hand-drawn SVG interpretations. Characters belong to SANRIO; not official artwork.
export const friends = [
  "布丁狗",
  "大耳狗",
  "帕恰狗",
  "酷洛米",
  "Hello Kitty",
  "贝克鸭",
  "美乐蒂",
  "山姆企鹅",
  "人鱼汉顿",
  "双子星",
];
export function SanrioFriend({ index }: { index: number }) {
  const k = index % 10;
  const fill = [
    "#ffe9a1",
    "#fffafa",
    "#fffafa",
    "#50415c",
    "#fffafa",
    "#fffafa",
    "#ef99bb",
    "#80b8e6",
    "#8dd5d0",
    "#c7b9f0",
  ][k];
  return (
    <svg
      className={`sanrio-friend friend-${k}`}
      viewBox="0 0 100 90"
      aria-hidden="true"
    >
      {k === 9 ? (
        <g className="friend-sway">
          <path
            d="M9 72L19 46L44 47L50 72M50 72L59 45L83 46L94 72"
            fill="#fff7f4"
          />
          <circle cx="31" cy="38" r="22" fill="#a7d6f1" />
          <circle cx="70" cy="38" r="22" fill="#f2b6d2" />
          <ellipse cx="31" cy="43" rx="14" ry="16" fill="#ffe4d6" />
          <ellipse cx="70" cy="43" rx="14" ry="16" fill="#ffe4d6" />
          <path
            d="M10 36L27 16L47 36L30 29M49 35L68 15L89 36L69 28"
            fill="#b1cff2"
          />
          <path d="M49 35L68 15L89 36L69 28" fill="#f2b6d2" />
          <g className="friend-eyes" fill="#664f70">
            <circle cx="26" cy="44" r="1.6" />
            <circle cx="36" cy="44" r="1.6" />
            <circle cx="65" cy="44" r="1.6" />
            <circle cx="75" cy="44" r="1.6" />
          </g>
          <path
            d="M43 67L49 55L55 67L67 69L58 77L59 87L49 82L39 87L41 76L32 69Z"
            fill="#ffe69e"
          />
        </g>
      ) : (
        <>
          <g className="friend-sway">
            <ellipse cx="50" cy="71" rx="24" ry="17" fill={fill} />
            <g className="friend-wave">
              <ellipse
                cx="77"
                cy="61"
                rx="9"
                ry="15"
                transform="rotate(-35 77 61)"
                fill={fill}
                stroke="#76637b"
                strokeWidth="1.2"
              />
            </g>
            <ellipse
              cx="24"
              cy="70"
              rx="8"
              ry="12"
              transform="rotate(35 24 70)"
              fill={fill}
            />
            {[0, 1, 2].includes(k) && (
              <g className="friend-ears">
                <ellipse
                  cx={k === 1 ? 17 : 24}
                  cy={k === 1 ? 40 : 36}
                  rx={k === 1 ? 17 : 10}
                  ry={k === 1 ? 10 : 23}
                  fill={k === 2 ? "#433b49" : fill}
                  transform="rotate(28 24 36)"
                />
                <ellipse
                  cx={k === 1 ? 83 : 76}
                  cy={k === 1 ? 40 : 36}
                  rx={k === 1 ? 17 : 10}
                  ry={k === 1 ? 10 : 23}
                  fill={k === 2 ? "#433b49" : fill}
                  transform="rotate(-28 76 36)"
                />
              </g>
            )}
            {k === 3 && (
              <path
                d="M20 41L14 6L43 22L57 22L85 6L80 43Z"
                fill={fill}
                stroke="#43364c"
                strokeWidth="2"
              />
            )}
            {k === 4 && (
              <path
                d="M22 39L23 12L41 24L62 24L78 12L80 41Z"
                fill={fill}
                stroke="#c8b7c8"
                strokeWidth="1"
              />
            )}
            {k === 6 && (
              <g className="friend-ears">
                <ellipse
                  cx="36"
                  cy="20"
                  rx="10"
                  ry="23"
                  fill={fill}
                  transform="rotate(-16 36 20)"
                />
                <ellipse
                  cx="64"
                  cy="22"
                  rx="10"
                  ry="23"
                  fill={fill}
                  transform="rotate(18 64 22)"
                />
              </g>
            )}
            {k === 8 && (
              <>
                <path
                  d="M18 36L5 29L9 58L24 55M81 36L95 29L91 59L77 55"
                  fill={fill}
                />
                <path d="M35 17L41 5L50 16L59 5L65 19" fill={fill} />
              </>
            )}
            <ellipse
              cx="50"
              cy="43"
              rx={k === 1 ? 31 : 30}
              ry="26"
              fill={fill}
              stroke="#7b678733"
              strokeWidth="1.2"
            />
            {k === 0 && (
              <>
                <ellipse cx="50" cy="19" rx="22" ry="8" fill="#8e654d" />
                <path d="M35 17Q40 3 56 9L65 18" fill="#8e654d" />
                <path
                  d="M51 10L54 6"
                  stroke="#8e654d"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </>
            )}
            {k === 3 && (
              <>
                <ellipse cx="50" cy="49" rx="24" ry="18" fill="#fff5ed" />
                <path
                  d="M42 29Q41 19 50 20Q60 19 58 29L54 32L54 36L46 36L46 32Z"
                  fill="#ef9bb8"
                />
                <circle cx="47" cy="27" r="2" fill="#594461" />
                <circle cx="54" cy="27" r="2" fill="#594461" />
              </>
            )}
            {k === 6 && (
              <ellipse cx="50" cy="48" rx="24" ry="20" fill="#fff6ed" />
            )}
            {k === 7 && (
              <>
                <ellipse cx="50" cy="53" rx="23" ry="18" fill="#fff8ec" />
                <path d="M34 21L38 9L64 9L67 21Z" fill="#fff6ed" />
                <path d="M36 17H65" stroke="#eea6bf" strokeWidth="3" />
              </>
            )}
            {k === 5 && (
              <>
                <path d="M43 18Q36 5 49 7L55 18" fill="#f6e0ae" />
                <path d="M28 66L72 66L72 81L28 81Z" fill="#a5c9ec" />
                <path d="M44 68L50 75L56 68" fill="#fff9ee" />
              </>
            )}
            {k === 4 && (
              <g fill="#ee869e" stroke="#bf6482" strokeWidth="1">
                <ellipse
                  cx="68"
                  cy="24"
                  rx="8"
                  ry="12"
                  transform="rotate(35 68 24)"
                />
                <ellipse
                  cx="82"
                  cy="25"
                  rx="8"
                  ry="12"
                  transform="rotate(-35 82 25)"
                />
                <circle cx="75" cy="25" r="5" />
              </g>
            )}
            {k === 6 && (
              <g fill="#b6dfcc">
                <ellipse
                  cx="29"
                  cy="24"
                  rx="9"
                  ry="5"
                  transform="rotate(30 29 24)"
                />
                <ellipse
                  cx="42"
                  cy="24"
                  rx="9"
                  ry="5"
                  transform="rotate(-30 42 24)"
                />
                <circle cx="36" cy="25" r="4" fill="#fff1be" />
              </g>
            )}
            <g className="friend-eyes" fill={k === 1 ? "#78a8d4" : "#493b4c"}>
              {k === 8 ? (
                <>
                  <ellipse cx="38" cy="35" rx="10" ry="13" fill="white" />
                  <ellipse cx="62" cy="35" rx="10" ry="13" fill="white" />
                  <circle cx="40" cy="37" r="3" />
                  <circle cx="60" cy="37" r="3" />
                </>
              ) : (
                <>
                  <ellipse cx="38" cy={k === 3 ? 49 : 43} rx="2.8" ry="3.7" />
                  <ellipse cx="62" cy={k === 3 ? 49 : 43} rx="2.8" ry="3.7" />
                </>
              )}
            </g>
            {k === 5 || k === 7 ? (
              <ellipse cx="50" cy="53" rx="10" ry="5" fill="#f3bf6f" />
            ) : k === 8 ? (
              <ellipse
                cx="50"
                cy="54"
                rx="17"
                ry="6"
                fill="#eaa4b4"
                stroke="#9d7287"
                strokeWidth="1"
              />
            ) : k === 4 ? (
              <>
                <ellipse cx="50" cy="51" rx="4" ry="3" fill="#eed28e" />
                <path
                  d="M22 45L9 42M21 51L7 51M22 57L10 61M78 45L91 42M79 51L93 51M78 57L90 61"
                  stroke="#76637b"
                  strokeWidth="1.5"
                />
              </>
            ) : (
              <path
                d="M44 53Q50 59 56 53"
                fill="none"
                stroke={k === 1 ? "#78a8d4" : "#795a6e"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
            {k !== 4 && (
              <g fill="#edaec2" opacity=".65">
                <ellipse cx="28" cy="53" rx="5" ry="2.5" />
                <ellipse cx="72" cy="53" rx="5" ry="2.5" />
              </g>
            )}
            {k === 7 && (
              <path d="M39 70L49 74L61 70L60 81L50 77L40 81Z" fill="#e79dbe" />
            )}
          </g>
        </>
      )}
      <g className="friend-spark" fill="#e5bd73">
        <path d="M87 6L89 12L95 14L89 16L87 22L85 16L79 14L85 12Z" />
        <circle cx="11" cy="73" r="2" />
      </g>
    </svg>
  );
}
