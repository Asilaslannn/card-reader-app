// OCR sonuçlarını işle
function extractDetails(text) {
    const companyRegex = /([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+)/g;
    const nameRegex = /(Dr\.|Mr\.|Ms\.|Mrs\.)?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/g;
    const positionRegex = /(Manager|Director|Engineer|Specialist|Business Development|Imports|Marketing)/g;
    const phoneRegex = /(\+?[0-9]{1,4}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4})/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const cityCountryRegex = /(Jeddah|Dubai|Riyadh|Abu Dhabi|Zagreb|Düsseldorf|Saudi Arabia|UAE|United Arab Emirates|Germany|France|Australia)/g;

    const companies = text.match(companyRegex) || ["Unknown Company"];
    const names = text.match(nameRegex) || ["Responsible"];
    const positions = text.match(positionRegex) || ["Responsible"];
    const phones = text.match(phoneRegex).filter(phone => phone.trim().length > 4) || [];
    const emails = text.match(emailRegex) || ["No Email"];
    const citiesCountries = text.match(cityCountryRegex) || ["Unknown City", "Unknown Country"];

    const namesList = names.map(name => {
        const nameParts = name.split(" ");
        return {
            "Name": nameParts[1] ? nameParts[1] : "Responsible",
            "Surname": nameParts[2] ? nameParts[2] : "."
        };
    });

    const data = namesList.map((nameObj, index) => ({
        "Company": companies[index] || "Unknown",
        "Name": nameObj.Name,
        "Surname": nameObj.Surname,
        "Position": positions[index] || "Responsible",
        "Work Phone": phones[index] || "",
        "Other Phone": phones[index + 1] || "",
        "Email": emails[index] || "No Email",
        "City": citiesCountries[index] || "Unknown City",
        "Country": citiesCountries[index + 1] || "Unknown Country"
    }));

    return data;
}

// Dosya yükleme işlemleri ve ilerleme yüzdesi
$('#start').on('click', function () {
    $('#progressBar').css('width', '0%').attr('aria-valuenow', 0).text('0%');
    $('#progressText').text('İşlem başladı...');

    const files = $('#upload')[0].files;
    if (files.length === 0) {
        alert('Lütfen dosya yükleyin!');
        return;
    }

    Array.from(files).forEach((file, index) => {
        Tesseract.recognize(file, 'eng', {
            logger: (m) => {
                const progress = Math.floor(m.progress * 100);
                $('#progressBar').css('width', progress + '%').attr('aria-valuenow', progress).text(progress + '%');
                $('#progressText').text(`İşleniyor: ${file.name}... (${progress}%)`);
            },
        }).then(function (result) {
            const extractedData = extractDetails(result.data.text);
            displayTable(extractedData);
            $('#progressBar').css('width', '100%').attr('aria-valuenow', 100).text('100%');
            $('#progressText').text('İşlem %100 tamamlandı.');
        }).catch(function (error) {
            console.error('OCR hatası:', error);
            $('#progressText').text('Bir hata oluştu.');
        });
    });
});

// ChatGPT işlemini başlat
$('#startChatGPT').on('click', function () {
    $('#progressBar').css('width', '0%').attr('aria-valuenow', 0).text('0%');
    $('#progressText').text('ChatGPT işlemi başlatıldı...');

    const files = $('#upload')[0].files;
    if (files.length === 0) {
        alert('Lütfen dosya yükleyin!');
        return;
    }

    Array.from(files).forEach((file, index) => {
        Tesseract.recognize(file, 'eng').then(async function (result) {
            try {
                const chatGPTProcessedData = await useChatGPT(result.data.text); // ChatGPT API çağrısı
                displayChatGPTTable(chatGPTProcessedData); // Sonuçları tabloya yerleştir
            } catch (error) {
                console.error('ChatGPT hatası:', error);
                $('#progressText').text('ChatGPT işleminde bir hata oluştu.');
            }
        });
    });
});

// Tabloyu gösterme
function displayTable(data) {
    let tableHtml = `<table id="dataTable" class="table table-striped table-bordered">
        <thead><tr>
        <th>Company</th><th>Name</th><th>Surname</th><th>Position</th>
        <th>Work Phone</th><th>Other Phone</th><th>Email</th><th>City</th><th>Country</th></tr></thead><tbody>`;

    data.forEach(row => {
        tableHtml += `<tr>
            <td>${row.Company}</td>
            <td>${row.Name}</td>
            <td>${row.Surname}</td>
            <td>${row.Position}</td>
            <td>${row["Work Phone"]}</td>
            <td>${row["Other Phone"]}</td>
            <td>${row.Email}</td>
            <td>${row.City}</td>
            <td>${row.Country}</td></tr>`;
    });

    tableHtml += `</tbody></table>`;
    $('#output').html(tableHtml);
    $('#dataTable').DataTable(); // DataTable'ı yeniden başlatır
}

// ChatGPT tablosunu gösterme
function displayChatGPTTable(data) {
    let tableHtml = `<table id="chatGPTTable" class="table table-striped table-bordered">
        <thead><tr>
        <th>Company</th><th>Name</th><th>Surname</th><th>Position</th>
        <th>Work Phone</th><th>Other Phone</th><th>Email</th><th>City</th><th>Country</th></tr></thead><tbody>`;

    data.forEach(row => {
        tableHtml += `<tr>
            <td>${row.Company}</td>
            <td>${row.Name}</td>
            <td>${row.Surname}</td>
            <td>${row.Position}</td>
            <td>${row["Work Phone"]}</td>
            <td>${row["Other Phone"]}</td>
            <td>${row.Email}</td>
            <td>${row.City}</td>
            <td>${row.Country}</td></tr>`;
    });

    tableHtml += `</tbody></table>`;
    $('#chatgpt-output').html(tableHtml);
    $('#chatGPTTable').DataTable(); // DataTable'ı yeniden başlatır
}

// ChatGPT API çağrısı
async function fetchChatGPTResponse(text) {
    try {
        const response = await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer YOUR_API_KEY` // Buraya kendi API anahtarını koy
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: `Extract information from this text: ${text}`,
                max_tokens: 1000,
            }),
        });

        const data = await response.json();
        return data.choices[0].text;
    } catch (error) {
        console.error('ChatGPT API çağrısı hatası:', error);
        throw error;
    }
}

// ChatGPT API sonucunu işle
async function useChatGPT(text) {
    const chatGPTResult = await fetchChatGPTResponse(text);
    console.log("ChatGPT Result:", chatGPTResult);

    // Gelen sonucu JSON formatında bekleyelim ve tabloya dönüştürelim
    const parsedResult = JSON.parse(chatGPTResult);
    return parsedResult;
}
