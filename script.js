document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.getElementById('submit-btn');
    const userInput = document.getElementById('user-input');
    const responseOutput = document.getElementById('response-output');

    // API anahtarınızı burada tanımlayın
    const apiKey = "sk-RO0Pr2EW4Acg3SIk3R0CBZ1sfBNwQVPXRtPhwodVCtT3BlbkFJ4ppPQzIIBnO6U6mpEUdmCSmfKXj0ntgAvBtestsjEA";

    // "Gönder" butonuna tıklandığında API isteği yap
    submitButton.addEventListener('click', async function () {
        const prompt = userInput.value;
        if (!prompt) {
            alert("Lütfen bir soru girin!");
            return;
        }

        // API'ye istek yapmadan önce düğmeyi devre dışı bırak
        submitButton.disabled = true;
        submitButton.innerText = "İşleniyor...";

        try {
            const response = await fetch('https://api.openai.com/v1/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",  // Kullanılacak model
                    prompt: prompt,
                    max_tokens: 150  // Yanıtın uzunluğunu sınırlamak için
                })
            });

            const data = await response.json();
            const textResponse = data.choices[0].text.trim();

            // Yanıtı ekrana yazdır
            responseOutput.innerHTML = `<strong>Cevap:</strong> ${textResponse}`;

        } catch (error) {
            console.error("Hata oluştu:", error);
            responseOutput.innerHTML = "<strong>Bir hata oluştu. Lütfen tekrar deneyin.</strong>";
        } finally {
            // İşlem bittiğinde butonu yeniden aktif et
            submitButton.disabled = false;
            submitButton.innerText = "Gönder";
        }
    });
});
