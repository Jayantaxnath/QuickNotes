// Extracts the transcript from the Coursera page
(function() {
    let transcript = "";
    let phrases = document.querySelectorAll(".rc-Phrase span");

    if (!phrases.length) {
        phrases = document.querySelectorAll("span.css-4s48ix");
    }

    phrases.forEach(p => {
        transcript += p.innerText.trim() + " ";
    });

    return transcript.trim();
})();