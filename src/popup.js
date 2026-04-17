let API_KEY = "";
let API_URL = "https://api.groq.com/openai/v1/chat/completions";

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("generate-btn");
    const status = document.getElementById("progress-text");
    const container = document.getElementById("result-container");
    const output = document.getElementById("result");

    const setStatus = (msg, isError = false) => {
        status.innerText = msg;
        status.style.color = isError ? "red" : "#3ca125";
        status.classList.remove("hidden");
    };

    // Load settings from storage
    chrome.storage.local.get(["apiKey", "apiUrl"], (data) => {
        if (data.apiKey) API_KEY = data.apiKey;
        if (data.apiUrl) API_URL = data.apiUrl;

        document.getElementById("api-key-input").value = API_KEY;
        document.getElementById("api-url-input").value = API_URL;
    });

    // Restore previous notes on load from session storage only
    chrome.storage.session.get(["lastNotes"], (data) => {
        if (data.lastNotes) {
            output.innerHTML = marked.parse(data.lastNotes.trim());
            renderMathInElement(output, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true }
                ]
            });
            container.classList.remove("hidden");
        }
    });

    // Settings Logic
    const settingsBtn = document.getElementById("settings-btn");
    const settingsPanel = document.getElementById("settings-panel");
    const saveSettingsBtn = document.getElementById("save-settings-btn");

    settingsBtn.addEventListener("click", () => {
        settingsPanel.classList.toggle("hidden");
    });

    saveSettingsBtn.addEventListener("click", async () => {
        API_KEY = document.getElementById("api-key-input").value.trim();
        API_URL = document.getElementById("api-url-input").value.trim() || "https://api.groq.com/openai/v1/chat/completions";

        await chrome.storage.local.set({ apiKey: API_KEY, apiUrl: API_URL });

        const sStatus = document.getElementById("settings-status");
        sStatus.classList.remove("hidden");
        setTimeout(() => sStatus.classList.add("hidden"), 2000);
    });

    btn.addEventListener("click", async () => {
        if (!API_KEY) {
            setStatus("Please set your Groq API key in Settings (⚙️)", true);
            settingsPanel.classList.remove("hidden");
            return;
        }

        btn.disabled = true;
        container.classList.add("hidden");
        setStatus("Extracting transcript...");

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) throw new Error("No active tab found");

            const injection = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["src/content.js"]
            });

            const transcript = injection?.[0]?.result;
            if (!transcript) throw new Error("No transcript found on this page.");

            navigator.clipboard.writeText(transcript).catch(() => { });

            setStatus("Processing chunks...");
            const words = transcript.split(/\s+/);
            const chunks = [];
            for (let i = 0; i < words.length; i += 2100) {
                chunks.push(words.slice(i, i + 2100).join(" "));
            }

            const summaries = [];
            for (let i = 0; i < chunks.length; i++) {
                setStatus(`Processing chunk ${i + 1}/${chunks.length}...`);
                summaries.push(await generateNotes(chunks[i], "notes"));
            }

            setStatus("Merging final notes...");
            const finalNotes = await generateNotes(summaries.join("\n\n"), "merge");

            // Cache for subsequent visits (clears on extension reload)
            await chrome.storage.session.set({ lastNotes: finalNotes });

            setStatus("Rendering...");
            output.innerHTML = marked.parse(finalNotes.trim());
            renderMathInElement(output, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true }
                ]
            });

            container.classList.remove("hidden");
            status.classList.add("hidden");

        } catch (err) {
            setStatus("Error: " + err.message, true);
        } finally {
            btn.disabled = false;
        }
    });
});

async function generateNotes(content, type) {
    const prompt = type === "notes"
        ? `Convert the transcript into ultra-concise study notes.\n- Maximum <=20 bullet points\n- Each bullet ≤30 words\n- Keep only key concepts, formulas, definitions.\n\n${content}`
        : `Merge the following notes into final high quality notes.\n- Remove duplicates\n- Keep high-value points & formulas\n- Group logically with headings\n- Only return the notes, no extra text.\n\n${content}`;

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
        body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                { role: "system", content: "You are an expert study-notes generator." },
                { role: "user", content: prompt }
            ],
            temperature: 0.2
        })
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "";
}