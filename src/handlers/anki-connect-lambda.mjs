
import {pinyinify} from 'hanzi-tools';

function removeTags(str) {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
          
    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace( /(<([^>]+)>)/ig, '');
}

async function checkForSingleCharactersWithoutACard() {
    
    console.info(process.env.ANKI_CONNECT_URL);
    console.info(process.env.ANKI_CONNECT_PORT);
    let endpoint = 'http://' + process.env.ANKI_CONNECT_URL + ':' + process.env.ANKI_CONNECT_PORT;

    var requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");
    var requestBody = JSON.stringify({ "action": "findCards", "version": 6, "params": { "query": "deck:ChinesePodDeck" }});
    
    var requestOptions = {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody
    };
    
    let cardInfoResponseJson = await fetch(endpoint, requestOptions)
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
       

        .catch(error => console.info('error', error));

        var ankiCardArray = cardInfoResponseJson.result;
        let singleCharacterMap = new Map();
        let multipleChararacterCards = [];
        let singleCardCount = 0;
        let doubleCardCount = 0;
        console.info(`There are a total of ${ankiCardArray.length} cards`);

        ankiCardArray.forEach((ankiCard) => {
            let chinese = removeTags(ankiCard.fields.Front.value);
                    
            if ((chinese.length == 1) && (chinese.match(/[\u3400-\u9FBF]/)))  {
                singleCharacterMap.set(chinese, ankiCard);
                singleCardCount++;
            } else {
                multipleChararacterCards.push(ankiCard);
                doubleCardCount++;
            }
        });

        console.info(`There are a total of ${singleCardCount} single character cards`);
        console.info(`There are a total of ${doubleCardCount} double character cards`);
        
        var newNotes = [];
        multipleChararacterCards.forEach((multiCharacterCard) => {
            let chinese = multiCharacterCard.fields.Front.value;
            chinese.split('').forEach(chineseCharacter => {
                if ((!singleCharacterMap.has(chineseCharacter) && chineseCharacter.match(/[\u3400-\u9FBF]/))) {
                    var pinyin = pinyinify(chineseCharacter);
                    console.info(`${chineseCharacter},,${pinyin}`)
                    var note = {
                        "deckName":"ChinesePodDeck",
                        "modelName":"Basic",
                        "fields": {
                            "Front": chineseCharacter,
                            "Back": "",
                            "Pinyin": pinyin
                        }
                    }
                    newNotes.push(note);
                    singleCharacterMap.set(chineseCharacter,null);
                }
            });
        });
        console.info(`${newNotes.length} will be added`);
        requestHeaders = new Headers();
        requestHeaders.append("Content-Type", "application/json");
        requestBody = JSON.stringify({ "action": "addNotes", "version": 6, "params": { "notes": newNotes }});
        requestOptions = {
            method: 'POST',
            headers: requestHeaders,
            body: requestBody
        };
        
        let addNoteResponseJson = await fetch(endpoint, requestOptions)
            .then(addNoteResponse => addNoteResponse.json());

        addNoteResponseJson.result.forEach(noteId => {console.info(noteId)});
        return "Done";
}

export const ankiConnectLambda = async (event,context) => {
    let res = await checkForSingleCharactersWithoutACard();
    return res;

}
