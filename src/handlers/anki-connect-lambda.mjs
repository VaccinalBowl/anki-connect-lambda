import fetch from 'node-fetch';
import {pinyinify} from 'hanzi-tools';

function checkForSingleCharactersWithoutACard() {
    
    console.log(process.env.ANKI_CONNECT_URL);
    console.log(process.env.ANKI_CONNECT_PORT);
    let endpoint = 'http://' + process.env.ANKI_CONNECT_URL + ':' + process.env.ANKI_CONNECT_PORT;

    var requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");
    var requestBody = JSON.stringify({ "action": "findCards", "version": 6, "params": { "query": "deck:TestDeck" } });
    var requestOptions = {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody
    };
    
    fetch(endpoint, requestOptions)
        .then(response => {
            return response.json()
        })
        .then(ankiFindCardsResponse => {
            var cardIdArray = ankiFindCardsResponse.result;
            var cardInfoRequestBody = JSON.stringify({ "action": "cardsInfo", "version": 6, "params": { "cards": cardIdArray } });
            var cardInfoRequestOptions = {
                method: 'POST',
                headers: requestHeaders,
                body: cardInfoRequestBody
            };
            return fetch(endpoint, cardInfoRequestOptions);
        })
        .then(cardInfoResponse => cardInfoResponse.json())
        .then(cardInfoResponseJson => {
            var ankiCardArray = cardInfoResponseJson.result;
            let singleCharacterMap = new Map();
            let multipleChararacterCards = [];
            let singleCardCount = 0;
            let doubleCardCount = 0;
            console.log(`There are a total of ${ankiCardArray.length} cards`);

            ankiCardArray.forEach((ankiCard) => {
                let chinese = ankiCard.fields.Front.value;
                if (chinese.length == 1) {
                    singleCharacterMap.set(chinese, ankiCard);
                    singleCardCount++;
                } else {
                    multipleChararacterCards.push(ankiCard);
                    doubleCardCount++;
                }
            });
            console.log(`There are a total of ${singleCardCount} single character cards`);
            console.log(`There are a total of ${doubleCardCount} double character cards`);


            multipleChararacterCards.forEach((multiCharacterCard) => {
                let chinese = multiCharacterCard.fields.Front.value;
                chinese.split('').forEach(chineseCharacter => {
                    if (!singleCharacterMap.has(chineseCharacter)) {
                        var pinyin = pinyinify(chineseCharacter);
                        console.log(`${chineseCharacter},,${pinyin}`)
                    }
                });

            });
        }

        )
        .catch(error => console.log('error', error));
        


}

export const ankiConnectLambda = () => {
    checkForSingleCharactersWithoutACard();
    return "Done";
}
