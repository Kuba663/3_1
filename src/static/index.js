(function(){
    var content = document.getElementById("countries");
    var form = document.getElementById("search");
    var template = document.getElementById("countryTemplate");
    
    form.addEventListener("submit", function (ev) {
        ev.preventDefault();

        const data = Object.fromEntries(new FormData(this));

        content.innerHTML = "";

        fetch(`/country/${data.country}`, {headers: {"Access-Control-Allow-Origin": "*"}}).then((res) => {
            res.json().then((data) => {
                for (var i = 0; i <  data.countries.length; i++) {
                    const country = data.countries[i];
                    const clone = document.importNode(template.content, true);
                    let td = clone.querySelectorAll("td");
                    td[0].innerHTML = `<a href="${country.links.wikipedia}">${country.names.common}</a>`; 
                    td[1].innerText = country.capitals[0].name;
                    td[2].innerText = country.population;
                    td[3].innerText = country.region;
                    td[4].innerText = country.subregion;
                    content.appendChild(clone);
                }
            })
        });
    });
})();