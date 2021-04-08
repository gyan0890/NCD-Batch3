import {
  createGame,
  joinGame,
  chooseGuesser,
  makeAGuess,
  finishGame,
  getActiveGames,
  getPlayer1Details,
  getPlayer2Details,
  getDeposit,
  getGameState,
  getWinner,
} from "../assembly/index";

import { storage, VMContext, u128 } from "near-sdk-as";

describe("Create a Game", () => {
  it('creates a new game', () => {
    VMContext.setAttached_deposit(u128.from('10000000000000000000000'));
    const gameId = createGame();
    expect(gameId).toBeTruthy("Game Id returned was non-null");
  })
});

describe("Return the details of a newly created game", () => {

  
  it('return the game state as 0', () => {
    VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
    const gameId = createGame();
    const gameState = getGameState(gameId);
    expect(gameState).toStrictEqual(0);
  });

  it('return the player 1 details', () => {
    VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
    VMContext.setSigner_account_id('gyan.testnet');
    const gameId = createGame();
    const player1 = getPlayer1Details(gameId);
    expect(player1).toStrictEqual('gyan.testnet');
  });


});

describe("A Player 2 joining an existing game", () => {

  
  it('another player joins the game', () => {
    VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
    VMContext.setSigner_account_id('gyan.testnet');
    const gameId = createGame();

    VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
    VMContext.setSigner_account_id('gyanlakshmi.testnet');
    const gameJoined = joinGame(gameId);
    expect(gameJoined).toBeTruthy;
    
  });

  it('now the game state changes to 1', () => {
    VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
    VMContext.setSigner_account_id('gyan.testnet');
    const gameId = createGame();

    VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
    VMContext.setSigner_account_id('gyanlakshmi.testnet');
    joinGame(gameId);
    const gameState = getGameState(gameId);
    const player2 = getPlayer2Details(gameId);
    expect(gameState).toStrictEqual(1);
    expect(player2).toStrictEqual('gyanlakshmi.testnet');
  });

  it('making the choice and finishing the game', () => {
    VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
    VMContext.setSigner_account_id('gyan.testnet');
    const gameId = createGame();

    VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
    VMContext.setSigner_account_id('gyanlakshmi.testnet');
    joinGame(gameId);
    

    const guesser = chooseGuesser(gameId);
    VMContext.setSigner_account_id(guesser);
    const guessValue = makeAGuess(gameId, false);

    expect(guessValue).toStrictEqual("Done");
    
  });

});

describe("Sad paths - failures", () => {

  
  it('same player joins the game', () => {
    VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
    VMContext.setSigner_account_id('gyan.testnet');
    const gameId = createGame();

    VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
    VMContext.setSigner_account_id('gyan.testnet');
    const gameJoined = joinGame(gameId);
    expect(gameJoined).toBeFalsy;
    
  });

  it('game deposit is returned 0', () => {
    //VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
    VMContext.setSigner_account_id('gyan.testnet');
    const gameId = createGame();
    const getDeposit1 = getDeposit(gameId);
    expect(getDeposit1).toBeFalsy;

  });

  // it('making the choice and finishing the game', () => {
  //   VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
  //   VMContext.setSigner_account_id('gyan.testnet');
  //   const gameId = createGame();

  //   VMContext.setAttached_deposit(u128.from('5000000000000000000000'));
  //   VMContext.setSigner_account_id('gyanlakshmi.testnet');
  //   joinGame(gameId);
    

  //   const guesser = chooseGuesser(gameId);
  //   VMContext.setSigner_account_id(guesser);
  //   const guessValue = makeAGuess(gameId, false);
  //   const gameFinish = finishGame(gameId);
  //   //expect(guessValue).toStrictEqual("Done");
    
  // });

});
