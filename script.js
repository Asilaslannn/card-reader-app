// OCR sonuçlarını işle
function extractDetails(text) {
    const companyRegex = /(?:[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?(?:\s(?:Ltd|Co|Inc|LLC|Group|Corp|AG|S.A.|GmbH|PLC|Pty))?)/g;
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

// Görsel önizleme işlevi
$('#toggleImage').on('click', function() {
    const imgDiv = $('#imagePreview');
    if (imgDiv.is(":visible")) {
        imgDiv.hide();
        $(this).text('Görseli Göster');
    } else {
        imgDiv.show();
        $(this).text('Görseli Gizle');
    }
});

// Dosya yükleme işlemleri
$('#upload').on('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $('#uploadedImage').attr('src', e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// PDF ve Excel için dışa aktarma fonksiyonları buraya eklenecek...
