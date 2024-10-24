document.getElementById('upload').onchange = function(event) {
    const file = event.target.files[0];

    if (file) {
        const controls = document.querySelector('.controls');
        controls.style.display = 'block'; // Görseli göster/gizle ve başlat butonlarını göster

        const imageContainer = document.getElementById('imageContainer');
        const uploadedImage = document.getElementById('uploadedImage');
        
        // Görselin gösterilmesi
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage.src = e.target.result;
            imageContainer.style.display = 'none'; // Başlangıçta görsel gizli olacak
        };
        reader.readAsDataURL(file);

        // "Show Image" butonuna tıklayınca görseli göster/gizle
        const toggleImageBtn = document.getElementById('toggleImage');
        let isImageVisible = false;
        toggleImageBtn.onclick = function() {
            if (isImageVisible) {
                imageContainer.style.display = 'none';
                toggleImageBtn.innerText = 'Show Image';
            } else {
                imageContainer.style.display = 'block';
                toggleImageBtn.innerText = 'Hide Image';
            }
            isImageVisible = !isImageVisible;
        };

        // "Start" butonunu etkinleştir
        const startBtn = document.getElementById('startProcessing');
        startBtn.disabled = false;

        // "Start" butonuna tıklandığında OCR işlemi başlar
        startBtn.onclick = function() {
            startBtn.disabled = true; // İşlem başladıktan sonra buton devre dışı bırakılır
            processFile(file);
        };
    }
};

function processFile(file) {
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.querySelector('.progress-container');
    progressContainer.style.display = 'block'; // İlerleme çubuğunu göster

    Tesseract.recognize(
        file,
        'eng',
        {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const progress = Math.floor(m.progress * 100);
                    progressBar.style.width = progress + '%';
                    progressBar.innerText = progress + '%';
                }
            },
        }
    ).then(({ data: { text } }) => {
        const extractedData = extractDetails(text);
        console.log("Extracted Data:", extractedData);
        document.getElementById('output').innerText = JSON.stringify(extractedData, null, 2);

        // Tabloyu göster
        displayTable(extractedData);

        // Excel'e yazma butonunu ekle
        const exportButton = document.createElement("button");
        exportButton.innerText = "Export to Excel";
        exportButton.onclick = () => exportToExcel(extractedData);
        document.body.appendChild(exportButton);
    });
}

function extractDetails(text) {
    const companyAndNameRegex = /([A-Z][a-z]+\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g; // Çoklu kelimelerden oluşan isim/şirket adı (örnek: Chat GPT Ltd)
    const positionRegex = /(Manager|Director|CEO|CFO|Engineer|Technician|Specialist|Assistant|Owner)/i; // Pozisyon
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g; // E-posta
    const phoneRegex = /(\+?[0-9\-\s().]+)/g; // Telefon numarası
    const websiteRegex = /(www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g; // Web siteleri
    const cityCountryRegex = /(City|Şehir|Country|Ülke):?\s*([A-Za-z\s]+)/g; // Şehir ve ülke

    // Çoklu kelimelerden oluşan şirket adı ve isimleri algıla
    const companyAndNames = text.match(companyAndNameRegex) || ["NULL"];
    const emails = text.match(emailRegex) || ["NULL"];
    const phones = text.match(phoneRegex).filter(phone => phone.trim().length > 4) || ["NULL"];
    const websites = text.match(websiteRegex) || ["NULL"];
    const positions = text.match(positionRegex) || ["NULL"];
    const locations = [...text.matchAll(cityCountryRegex)] || [["NULL", "NULL"]];

    const data = companyAndNames.map((name, index) => ({
        "Company/Name": name || "NULL", // Şirket ismi veya kişi ismi olarak aynı regex kullanılabilir
        "Position": positions[index] || "NULL",
        "Person Phone": phones[index] || "NULL",
        "Company Phone": phones[index + 1] || "NULL", // Şirket telefonu
        "Person Email": emails[index] || "NULL",
        "Company Email": emails[index + 1] || "NULL", // Şirket e-postası
        "Website": websites[index] || "NULL",
        "City": locations[index] ? locations[index][1] : "NULL",
        "Country": locations[index] ? locations[index][2] : "NULL"
    }));

    return data;
}

function displayTable(extractedData) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = ''; // Eski tabloyu temizle

    const table = document.createElement('table');
    table.setAttribute('border', '1');
    const headers = ["Company/Name", "Position", "Person Phone", "Company Phone", "Person Email", "Company Email", "Website", "City", "Country"];
    const headerRow = table.insertRow(0);
    headers.forEach(header => {
        const cell = headerRow.insertCell();
        cell.textContent = header;
    });

    extractedData.forEach((rowData, rowIndex) => {
        const row = table.insertRow(rowIndex + 1);
        headers.forEach((header, cellIndex) => {
            const cell = row.insertCell(cellIndex);
            cell.textContent = rowData[header];
        });
    });

    tableContainer.appendChild(table);
}

function exportToExcel(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "OCR_Data.xlsx");
}
