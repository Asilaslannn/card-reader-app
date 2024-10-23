document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-upload');
    const progressBar = document.getElementById('progress-bar');
    const startProcessButton = document.getElementById('start-process');
    const dataTable = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    let uploadedFiles = [];

    // OpenAI API anahtarı (güvenli bir sunucuda saklanmalı)
    const apiKey = "sk-RO0Pr2EW4Acg3SIk3R0CBZ1sfBNwQVPXRtPhwodVCtT3BlbkFJ4ppPQzIIBnO6U6mpEUdmCSmfKXj0ntgAvBtestsjEA";  // Doğru OpenAI API anahtarını buraya ekle

    // Dosya yüklendiğinde "Başlat" butonunu aktif et
    fileInput.addEventListener('change', function (event) {
        uploadedFiles = event.target.files;
        if (uploadedFiles.length > 0) {
            startProcessButton.disabled = false;
        } else {
            startProcessButton.disabled = true;
        }
    });

    // "Başlat" butonuna basıldığında işlemi başlat
    startProcessButton.addEventListener('click', function () {
        if (uploadedFiles.length === 0) {
            alert("Lütfen dosya yükleyin!");
            return;
        }

        progressBar.style.width = '0%';
        progressBar.innerText = '0%';
        let totalFiles = uploadedFiles.length;
        let processedFiles = 0;

        Array.from(uploadedFiles).forEach((file, index) => {
            processFile(file).then(data => {
                // İşlenen verileri tabloya ekle
                addToTable(data);
                processedFiles++;
                updateProgressBar(processedFiles, totalFiles);
            }).catch(error => {
                console.error("Hata oluştu:", error);
                alert("Dosya işlenirken bir hata meydana geldi. Lütfen tekrar deneyin.");
            });
        });
    });

    // İlerleme çubuğunu güncelle
    function updateProgressBar(processed, total) {
        const progress = (processed / total) * 100;
        progressBar.style.width = progress + '%';
        progressBar.innerText = Math.floor(progress) + '%';
    }

    // Dosya işleme ve ChatGPT'den veri alma
    async function processFile(file) {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onload = async function (event) {
                const base64Data = event.target.result.split(',')[1];

                try {
                    const response = await fetch('https://api.openai.com/v1/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: "gpt-3.5-turbo",
                            prompt: `Bu kartvizitten şu bilgileri çıkart: Şirketin Adı, Kişinin Adı, Kişinin Soyadı, Kişinin Pozisyonu, Kişinin Numarası, Şirketin Numarası, Kişinin Mail Adresi, Şirketin Mail Adresi, Şehir, Ülke, Website. Eğer kartvizitte eksik bilgi varsa varsayılan olarak 'Responsible' ya da '.' koy.`,
                            max_tokens: 500
                        })
                    });

                    const result = await response.json();
                    const extractedData = extractDataFromResponse(result.choices[0].text);
                    resolve(extractedData);
                } catch (error) {
                    console.error("API ile bağlantı sırasında hata:", error);
                    reject(error);
                }
            };
            reader.readAsDataURL(file);  // Dosyayı base64 formatında okuyup işleme alıyoruz
        });
    }

    // ChatGPT'den dönen yanıtı tabloya uygun şekilde ayır
    function extractDataFromResponse(text) {
        const lines = text.split('\n').map(line => line.trim());
        return {
            company: lines[0] || 'Unknown',
            firstName: lines[1] || 'Responsible',
            lastName: lines[2] || '.',
            position: lines[3] || 'Responsible',
            personPhone: lines[4] || '',
            companyPhone: lines[5] || '',
            personEmail: lines[6] || '',
            companyEmail: lines[7] || '',
            city: lines[8] || '',
            country: lines[9] || '',
            website: lines[10] || ''
        };
    }

    // Verileri tabloya ekle
    function addToTable(data) {
        const row = dataTable.insertRow();
        row.insertCell(0).innerText = data.company;
        row.insertCell(1).innerText = data.firstName;
        row.insertCell(2).innerText = data.lastName;
        row.insertCell(3).innerText = data.position;
        row.insertCell(4).innerText = data.personPhone;
        row.insertCell(5).innerText = data.companyPhone;
        row.insertCell(6).innerText = data.personEmail;
        row.insertCell(7).innerText = data.companyEmail;
        row.insertCell(8).innerText = data.city;
        row.insertCell(9).innerText = data.country;
        row.insertCell(10).innerText = data.website;
    }

    // Excel indirme işlemi
    document.getElementById('download-excel').addEventListener('click', function () {
        const table = document.getElementById('data-table');
        const rows = Array.from(table.rows).map(row => Array.from(row.cells).map(cell => cell.innerText));

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'data_table.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // PDF indirme işlemi (html2pdf kütüphanesi ile yapılabilir)
    document.getElementById('download-pdf').addEventListener('click', function () {
        const element = document.getElementById('data-table');
        html2pdf().from(element).save('data_table.pdf');
    });
});
