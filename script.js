// OCR sonuçlarını işleyen fonksiyon
function extractDetails(text) {
    const companyRegex = /(FORLAM-RAIL|HARSCO|AMSTED|KONCAR|MARTINUS|JORS|Schwihag|Kolowag|Holland|Lantech|Matisa|Bonatrans|Duagon)/g;
    const nameRegex = /(Dr\.|Mr\.|Ms\.|Mrs\.)?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/g;
    const positionRegex = /(Manager|Director|Engineer|Specialist|Marketing|Sales|Development|Consultant)/g;
    const phoneRegex = /(\+?[0-9]{1,4}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4})/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const cityRegex = /(Jeddah|Dubai|Riyadh|Zagreb|Düsseldorf|Crissier|Nürnberg|Munich)/g;
    const countryRegex = /(Saudi Arabia|UAE|Germany|France|Australia|Switzerland|Czech Republic)/g;

    const companies = text.match(companyRegex) || ["Unknown Company"];
    const names = text.match(nameRegex) || ["Responsible"];
    const positions = text.match(positionRegex) || ["Responsible"];
    const phones = text.match(phoneRegex).filter(phone => phone.trim().length > 4) || [];
    const emails = text.match(emailRegex) || ["No Email"];
    const cities = text.match(cityRegex) || ["Unknown City"];
    const countries = text.match(countryRegex) || ["Unknown Country"];

    const namesList = names.map(name => {
        const nameParts = name.split(" ");
        return {
            "Name": nameParts[1] ? nameParts[1] : "Responsible",
            "Surname": nameParts[2] ? nameParts[2] : "."
        };
    });

    const data = namesList.map((nameObj, index) => ({
        "Company": companies[index] || "Unknown Company",
        "Name": nameObj.Name,
        "Surname": nameObj.Surname,
        "Position": positions[index] || "Responsible",
        "Work Phone": phones[index] || "",
        "Other Phone": phones[index + 1] || "",
        "Email": emails[index] || "No Email",
        "City": cities[index] || "Unknown City",
        "Country": countries[index] || "Unknown Country"
    }));

    return data;
}

// Tesseract işlemi
$('#start').on('click', function() {
    $('#progressBar').css('width', '0%').attr('aria-valuenow', 0).text('0%');
    $('#progressText').text('İşlem başladı...');
    
    const files = $('#upload')[0].files;
    if (files.length === 0) {
        alert('Lütfen dosya yükleyin!');
        return;
    }

    Array.from(files).forEach((file, index) => {
        Tesseract.recognize(file, 'eng')
            .progress(function(p) {
                const progress = Math.floor(p.progress * 100);
                $('#progressBar').css('width', progress + '%').attr('aria-valuenow', progress).text(progress + '%');
                $('#progressText').text(`İşleniyor: ${file.name}...`);
            })
            .then(function(result) {
                const extractedData = extractDetails(result.data.text);
                displayTable(extractedData);
                $('#progressBar').css('width', '100%').attr('aria-valuenow', 100).text('100%');
                $('#progressText').text('İşlem %100 tamamlandı.');
            });
    });
});

// Tabloyu göster
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
    $('#dataTable').DataTable();
}

// ChatGPT API Entegrasyonu için fonksiyon
async function fetchChatGPTResponse(text) {
    const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer YOUR_API_KEY`
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: `Extract information from this text: ${text}`,
            max_tokens: 1000
        })
    });

    const data = await response.json();
    return data.choices[0].text;
}

// ChatGPT Yanıtını Tabloya Eklemek
async function useChatGPT(text) {
    const chatGPTResult = await fetchChatGPTResponse(text);
    console.log("ChatGPT Result:", chatGPTResult);
    // ChatGPT'nin sonuçlarını işleyip tabloya ekleyin
}
