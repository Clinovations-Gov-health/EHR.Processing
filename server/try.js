const { Client } = require('@googlemaps/google-maps-services-js');
const { default: Axios } = require('axios');

const client = new Client({});

async function main() {
    client.findPlaceFromText({
        params: { input: "21218", inputtype: "textquery", key: "AIzaSyAcUB8Q-yLCRmNtHMHJ_8Foec14t3PrYLg" },
    }).then(d => {
        console.log(d.data)
    }).catch(e => {
        console.log(e);
    });

    client.placeDetails({
        params: { place_id: "ChIJV0swVwEFyIkRMqbfSQD-2vY", key: "AIzaSyAcUB8Q-yLCRmNtHMHJ_8Foec14t3PrYLg" },
    }).then(d => {
        console.log(d.data.result.address_components);
    })
    /*
    const res = await Axios.get("https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=21218&inputtype=textquery&key=AIzaSyAcUB8Q-yLCRmNtHMHJ_8Foec14t3PrYLg");

    console.log(res); */
}

main();