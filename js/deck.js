//Колода
export default class Deck {
    constructor() {
        this.deckId;
        this.api = new DeckAPI();
    }

    async init() {
        this.deckId = await this.api.getNewDeckId();
        console.log('Deck initialized with: ID' + this.deckId);
    }

    async takeCards(cardsAmount) {
        const cards = await this.api.takeCards(this.deckId, cardsAmount);
        return cards;
    }

    async reshuffle() {
        this.api.reshuffle(this.deckId);
    }

}
//Класс для отправки запросов на апи сервера
class DeckAPI {

    constructor() {
        this.apiLink = `https://www.deckofcardsapi.com/api/deck/`;
        this.responce = null;
    }

    // принимает ссылку, возвращает ответ от сервера
    async getFetchData(link) {
            this.responce = await fetch(this.apiLink + link);
            const data = await this.responce.json();
            return data;
        }
        // Создать колоду и вернуть ее айди
    async getNewDeckId() {
        //Создание колоды, сервер возвращает обьект новой колоды
        const data = await this.getFetchData('new/shuffle/?deck_count=1');

        return data.deck_id;
    }

    async takeCards(deckId, cardsAmount) {
        const error = document.querySelector('.error');
        const reshuffleBtn = document.querySelector('.reshuffle-btn');
        const newGameButton = document.querySelector('.new-game-btn')
        const takeCardButton = document.querySelector('.take-card-btn');
        const stopButton = document.querySelector('.stand-btn');
        const remaining = document.querySelector('.cards-amount');

        const data = await this.getFetchData(`${deckId}/draw/?count=${cardsAmount}`);
        remaining.innerText = `${data.remaining}`;

        if (!data.success) {
            error.innerText = 'No cards in deck!';
            reshuffleBtn.classList.remove('hidden');
            newGameButton.disabled = true;
            takeCardButton.disabled = true;
            stopButton.disabled = true;

            return [];
        }
        return data.cards;
    }

    async reshuffle(deckId) {
        this.getFetchData(`${deckId}/shuffle/`);
    }
}