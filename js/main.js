import Deck from './deck.js';

const dealerCardBlock = document.querySelector('.dealer-cards');
const playerCardBlock = document.querySelector('.player-cards');
const dealerSumText = document.querySelector('.dealer-sum');
const playerSumText = document.querySelector('.player-sum');
const newGameButton = document.querySelector('.new-game-btn')
const takeCardButton = document.querySelector('.take-card-btn');
const stopButton = document.querySelector('.stand-btn');
const reshuffleBtn = document.querySelector('.reshuffle-btn');
const remaining = document.querySelector('.cards-amount');

let message = document.querySelector('.message');
let dealerCards = [];
let playerCards = [];
let dealerSum = 0;
let playerSum = 0;
let firstMove = true;
let playerStand = false;
let originalCardImage = undefined;
const deck = new Deck();

async function takeFromDeck(cardAmount) {
    let newDealerCards;
    let newPlayerCards;
    if (firstMove) {
        newDealerCards = await deck.takeCards(cardAmount);
        dealerCards = dealerCards.concat(newDealerCards);
        firstMove = false;
    }
    if (!playerStand) {
        newPlayerCards = await deck.takeCards(cardAmount);
        playerCards = playerCards.concat(newPlayerCards)
    } else {
        newDealerCards = await deck.takeCards(cardAmount);
        dealerCards = dealerCards.concat(newDealerCards);
    }
}

async function renderCards() {

    dealerCardBlock.innerHTML = '';
    playerCardBlock.innerHTML = '';
    playerCards.forEach(card => {
        playerCardBlock.appendChild(getCardImg(card.image));
    });
    dealerCards.forEach(card => {
        dealerCardBlock.appendChild(getCardImg(card.image));
    });
}

function getCardImg(src) {

    const cardImg = document.createElement('img');
    cardImg.classList.add('card');
    cardImg.setAttribute('src', src);
    cardImg.setAttribute('alt', 'card image');

    return cardImg;
}

function countRenderSum() {
    dealerSum = 0;
    playerSum = 0;
    dealerCards.forEach(card => {
        switch (card.value) {
            case 'ACE':
                dealerSum += 1;
                break;
            case 'KING':
            case 'QUEEN':
            case 'JACK':
                dealerSum += 10;
                break;
            default:
                dealerSum += parseInt(card.value);
                break;
        }
    });
    dealerSumText.innerText = dealerSum;
    playerCards.forEach(card => {
        switch (card.value) {
            case 'ACE':
                playerSum += 1;
                break;
            case 'KING':
            case 'QUEEN':
            case 'JACK':
                playerSum += 10;
                break;
            default:
                playerSum += parseInt(card.value);
                break;
        }
    });
    playerSumText.innerText = playerSum;
}
takeCardButton.addEventListener('click', async() => {
    newGameButton.disabled = true;
    if (playerCards.length < 5) {
        await takeFromDeck(1);
        countRenderSum();
        message.innerText = `You have ${playerSum}. ${playerCards.length < 5? 'Hit or Stand?':''}`;
        console.log(playerCards.length);
        checkWinner();
        await renderCards();
    } else {
        takeCardButton.disabled = true; //заглушка
        message.innerText = 'You cannot take more cards!';
        checkWinner();
        await renderCards();
    }

});

stopButton.addEventListener('click', async() => {
    playerStand = true;
    console.log('Player stand');
    message.innerText = `Dealer's turn...`;
    takeCardButton.disabled = true;
    stopButton.disabled = true;
    newGameButton.disabled = false;
    const randNum = parseInt(Math.random() * (18 - 16) + 16); // сумма очков дилера (по правилам) должна быть >=16, дилер обязан остановть добор при >=17.
    console.log('Dealer min score: ' + randNum);
    for (let index = 0; index < 3; index++) {
        if (dealerSum <= randNum) {
            await takeFromDeck(1);
            countRenderSum();
        }
    }
    checkWinner();
    await renderCards();
});

newGameButton.addEventListener('click', async() => {
    if (parseInt(remaining.innerText) < 4) {
        console.log(remaining.innerText);
        newGameButton.disabled = true;
        const error = document.querySelector('.error');
        error.innerText = 'Not enough cards in deck to start a new game';
        reshuffleBtn.classList.remove('hidden');
    } else {
        dealerCards = [];
        playerCards = [];
        dealerSum = 0;
        playerSum = 0;
        firstMove = true;
        playerStand = false;
        message.innerText = '';
        takeCardButton.disabled = false;
        stopButton.disabled = false;
        newGameButton.disabled = true;
        dealerSumText.classList.add('hidden');
        playerSumText.classList.add('hidden');
        message.innerText = 'Dealing cards...';
        try {
            await takeFromDeck(2);
            originalCardImage = dealerCards[1].image;
            dealerCards[1].image = 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Card_back_01.svg';
            await renderCards();
            countRenderSum();
            message.innerText = `You have ${playerSum}. Hit or Stand?`;
        } catch (error) {
            // await renderCards();
        }
    }
});
reshuffleBtn.addEventListener('click', async() => {
    await deck.reshuffle();
    document.location.reload();
});

function checkWinner() {
    let gameOver = false;
    console.log('Playercards: ' + playerCards.length);
    if (playerSum > 21) {
        message.innerText = 'You loose! You went over 21.';
        gameOver = true;
    } else if (playerSum == 21) {
        message.innerText = 'You win with 21!';
        gameOver = true;
    } else if (dealerSum > 21) {
        message.innerText = 'You win! Dealer went over 21.';
        gameOver = true;
    } else if (dealerSum == 21) {
        message.innerText = 'You loose! Dealer has 21!';
        gameOver = true;
    } else if (playerStand || (playerCards.length == 5)) {
        if (dealerSum < playerSum) {
            message.innerText = 'You win with ' + playerSum + '.' + ' Dealer has ' + dealerSum + '.';
            gameOver = true;
        } else if (playerSum < dealerSum) {
            message.innerText = 'Dealer wins with ' + dealerSum + '.' + ' You have ' + playerSum + '.';
            gameOver = true;
        } else if (playerSum == dealerSum) {
            message.innerText = `It's a DRAW!`;
            gameOver = true;
        }
    }
    if (gameOver) {
        takeCardButton.disabled = true;
        stopButton.disabled = true;
        newGameButton.disabled = false;
        dealerCards[1].image = originalCardImage;
        dealerSumText.classList.remove('hidden');
        playerSumText.classList.remove('hidden');
    }
}

async function main() {

    await deck.init();
    takeCardButton.disabled = true;
    stopButton.disabled = true;
}

await main();