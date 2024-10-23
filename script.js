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
