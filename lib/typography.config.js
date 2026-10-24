// Site-wide typography settings, used by lib/typography.js at build time.
// Change these and rebuild — no template edits needed.
module.exports = {
  polish: {
    // Polish "sierotki": these one-letter words never end a line.
    singleLetterWords: ["a", "i", "o", "u", "w", "z"],

    // Optional, stricter rule: also keep these short words with the next
    // word. Off by default because joining too many words can make narrow
    // mobile lines ragged. Turn on here, or set TYPO_PL_EXTENDED=1 in the
    // build environment (e.g. Vercel → Settings → Environment Variables).
    useExtendedWords: process.env.TYPO_PL_EXTENDED === "1",
    extendedWords: [
      "do", "ku", "na", "od", "po",
      "we", "za", "ze", "co", "czy",
      "że", "bo", "by", "jak", "niż",
      "ja", "ty", "on", "my", "wy",
      "go", "mu", "mi", "ci", "je",
      "nie", "bez", "dla", "nad",
      "pod", "przy", "lub", "ani",
      "ale", "więc",
    ],
  },

  // Editorial line break: type "||" inside any heading in the CMS to force a
  // line break there (e.g. "Everything you need to || create on-brand work").
  // It only applies from this width up (see .ed-br in style.css); below it
  // the heading wraps automatically, because a break that looks right on
  // desktop is rarely right on a phone.
  editorialBreakMarker: "||",
  editorialBreakMinWidth: 768,
};
