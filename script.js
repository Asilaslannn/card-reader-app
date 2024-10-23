// OCR sonuçlarını işleyen fonksiyon
function extractDetails(text) {
    const companyRegex = /(AL ARFAJ|[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+ Co|[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+ Ltd|[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+ IMPORTS|[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+ COMMERCIAL)/g; // Şirket adları
    const nameRegex = /(Dr\.|Mr\.|Ms\.|Mrs\.)?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?/g; // İsim ve soyisim
    const positionRegex = /(Manager|Director|Engineer|Specialist|Business Development|Imports)/g; // Pozisyon
    const phoneRegex = /(\+?[0-9\-\s().]+)/g; // Telefon numarası
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g; // E-posta adresi
    const cityRegex = /(Jeddah|Dubai|Riyadh|Abu Dhabi)/g; // Şehir tanıma
    const countryRegex = /(Saudi Arabia|UAE|United Arab Emirates)/g; // Ülke tanıma

    // Verileri yakala
    const companies = text.match(companyRegex) || ["Unknown Company"];
    const names = text.match(nameRegex) || ["Responsible"];
    const positions = text.match(positionRegex) || ["Responsible"];
    const phones = text.match(phoneRegex).filter(phone => phone.trim().length > 4) || [];
    const emails = text.match(emailRegex) || ["No Email"];
    const cities = text.match(cityRegex) || ["Unknown City"];
    const countries = text.match(countryRegex) || ["Unknown Country"];

    // İsim ve soyisim ayrımı (Özellikle Dr., Mr. gibi unvanları tespit edelim)
    const namesList = names.map(name => {
        const nameParts = name.split(" ");
        return {
            "Name": nameParts[1] ? nameParts[1] : "Responsible", // Unvan varsa adı al
            "Surname": nameParts[2] ? nameParts[2] : "." // Soyadı varsa al yoksa '.'
        };
    });

    // Tekrarlayan verileri temizle
    const uniqueCompanies = [...new Set(companies)];
    const uniqueCities = [...new Set(cities)];
    const uniqueCountries = [...new Set(countries)];

    // Tablo için düzenlenmiş veri formatı
    const data = namesList.map((nameObj, index) => ({
        "Company": uniqueCompanies[0] || "Unknown",
        "Name": nameObj.Name,
        "Surname": nameObj.Surname,
        "Position": positions[index] || "Responsible",
        "Work Phone": phones[index] || "",
        "Other Phone": phones[index + 1] || "",
        "Email": emails[index] || "No Email",
        "City": uniqueCities[0] || "Unknown",
        "Country": uniqueCountries[0] || "Unknown"
    }));

    return data;
}

// Tabloyu oluşturup HTML'ye yerleştiren fonksiyon
function displayTable(data) {
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');

    // Tablonun başlık satırlarını oluştur
    const headers = ['Company', 'Name', 'Surname', 'Position', 'Work Phone', 'Other Phone', 'Email', 'City', 'Country'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Tablonun veri satırlarını oluştur
    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(cellData => {
            const td = document.createElement('td');
            td.textContent = cellData;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    // Oluşturulan tabloyu HTML'deki "output" div'ine ekle
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = ''; // Önceki içeriği temizle
    outputDiv.appendChild(table);
}

// Başlat butonuna tıklanınca işlemi başlatan fonksiyon
async function processAndDisplayData() {
    const fileInput = document.getElementById('upload');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (fileInput.files.length === 0) {
        alert("Lütfen bir dosya seçin.");
        return;
    }

    progressBar.value = 0;
    progressText.textContent = "İşlem başlatıldı...";

    const file = fileInput.files[0];
    
    Tesseract.recognize(file, 'eng', {
        logger: (m) => {
            if (m.status === 'recognizing text') {
                progressBar.value = m.progress * 100;
                progressText.textContent = `İşlem %${Math.round(m.progress * 100)} tamamlandı.`;
            }
        }
    }).then(({ data: { text } }) => {
        const extractedData = extractDetails(text);
        
        // Tabloyu göster
        displayTable(extractedData);

        // ChatGPT ile veri işleme
        useChatGPT(text).then(chatGPTProcessedData => {
            console.log("ChatGPT Result:", chatGPTProcessedData);
        });
    }).catch(err => {
        progressText.textContent = "Bir hata oluştu: " + err.message;
    });
}

// Başlat butonuna tıklanınca işlemi başlat
document.getElementById('start').onclick = processAndDisplayData;
