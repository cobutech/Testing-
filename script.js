document.addEventListener("DOMContentLoaded", () => {
  // Typing Animation
  const typingText = document.getElementById("typing-text");
  const websiteName = "𝐂𝐎𝐁𝐔𝐓𝐄𝐂𝐇 𝐏𝐑𝐄𝐌𝐈𝐔𝐌";

  let isErasing = false;
  let charIndex = 0;

  function type() {
    if (!isErasing && charIndex < websiteName.length) {
      typingText.textContent += websiteName[charIndex];
      charIndex++;
      setTimeout(type, 100);
    } else if (isErasing && charIndex > 0) {
      typingText.textContent = websiteName.substring(0, charIndex - 1);
      charIndex--;
      setTimeout(type, 100);
    } else {
      isErasing = !isErasing;
      setTimeout(type, 2000); // Delay before restarting
    }
  }

  type();

  // Rotating Sentences Animation
  const rotatingText = document.getElementById("rotating-text");
  const sentences = [
    "𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐂𝐎𝐁𝐔𝐓𝐄𝐂𝐇 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐕𝐈𝐏 𝐖𝐄𝐁𝐒𝐈𝐓𝐄!",
    "𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐔𝐒 𝐅𝐎𝐑 𝐓𝐇𝐄 𝐁𝐑𝐒𝐓 𝐓𝐄𝐂𝐇𝐍𝐎𝐋𝐎𝐆𝐘 𝐒𝐎𝐋𝐔𝐓𝐈𝐎𝐍𝐒.",
    "𝐘𝐎𝐔𝐑 premium 𝐄𝐗𝐏𝐄𝐑𝐈𝐄𝐍𝐂𝐄 𝐒𝐓𝐔𝐑𝐓'𝐒 𝐇𝐄𝐑𝐄.",
    "𝐉𝐎𝐈𝐍 𝐎𝐔𝐑 𝐕𝐈𝐏 𝐖𝐄𝐁𝐒𝐈𝐓𝐄 𝐓𝐎𝐃𝐀𝐘!",
  ];

  let index = 0;

  function updateSentence() {
    rotatingText.textContent = sentences[index];
    index = (index + 1) % sentences.length; // Loop back to the start
  }

  // Update the sentence every 10 seconds (matches animation duration)
  setInterval(updateSentence, 10000);

  // Initialize the first sentence
  updateSentence();
});