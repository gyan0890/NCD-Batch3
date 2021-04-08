//Algorithm
// 1. The first person to call the game - creates the game and locks in x amount of NEAR
// 2. After the game is created, game state changes to available and we can see the amount of NEAR locked
// 3. Player 2 can choose amongst a set of available games and lock their near
// 4. Once two players are in, game is set to start
// 5. Once game starts, a random number is generated 
// 6. One of the players is randomly asked to make a guess(Can make static for v0)
// 7. Heads - mapped to even number, Tails is mapped to odd number
// 8. Winning player gets total locked amount
// 9. Game state is changed to unavailable/complete
import { context, u128, PersistentVector, PersistentMap, logging, ContractPromiseBatch, RNG} from "near-sdk-as";

enum GameState {
    Created,
    InProgress,
    Completed,
    NotFound
}

/** 
 * Exporting a new class Game so it can be used outside of this file.
 */
@nearBindgen
export class Game {
    id: u32;
    gameState: GameState;
    deposit1: u128;
    deposit2: u128;
    player1: string;
    player2: string;
    player1Guess: boolean;
    player2Guess: boolean;
    winner: string;

    constructor() {

        /*
        Generates a random number for the gameId.
        Need to change this to counter eventually.
        */
        const rng = new RNG<u32>(1, u32.MAX_VALUE);
        const roll = rng.next();
        this.id = roll;
        this.deposit1 = context.attachedDeposit;
        this.deposit2 = u128.Zero;
        this.player1 = context.sender;
        this.gameState = GameState.Created;
    }

}

export const games = new PersistentVector<Game>("g");

export function createGame(): u32 {
    const game = new Game();
    games.push(game);
    return game.id;
}

export function joinGame(gameId: u32): boolean {
    //Loop through game Ids to check the game
    for(let i =0; i< games.length; i++){
        if(games[i].id == gameId){
            const newGame = new Game();
            /*
            Check if the game corresponds to a created game
            and if the same amount of deposit is attached.
            Also check if the same player is calling the 
            game or not.
            */
            // logging.log("Attached Deposit with this account " + context.attachedDeposit.toString());
            // logging.log("Game Deposit: " + games[i].deposit1.toString());
            // logging.log("Game State is: "+ games[i].gameState.toString());
            // logging.log("Context Sender is: "+ context.sender);
            // logging.log("Player1 is: "+ games[i].player1);

            //logging.log("Account Balance for this account is: "+ context.accountBalance);
            if(context.attachedDeposit >= games[i].deposit1 
                && games[i].gameState == GameState.Created
                && context.sender != games[i].player1){
                newGame.deposit1 = games[i].deposit1;
                newGame.deposit2 = context.attachedDeposit;
                newGame.gameState = GameState.InProgress;
                newGame.player1 = games[i].player1;
                newGame.player2 = context.sender;
                newGame.id = games[i].id;

                games.replace(i,newGame);
                
                return true;
            }
            else {
                return false;
            }
        }
    }
    return false;
}

export function chooseGuesser(gameId: u32): string {
    const randomNumber = new RNG<u32>(1, u32.MAX_VALUE);
    const randomNum = randomNumber.next();

    for(let i =0; i< games.length; i++){
        if(games[i].id == gameId && games[i].gameState == GameState.InProgress){
            if(randomNum % 3== 0){
                return games[i].player1; 
            }
            else
                return games[i].player2;
            }
    }
    return "Game Not Found";
    
}

export function makeAGuess(gameId: u32, guess: boolean): string {
    const newGame = new Game();
    for(let i =0; i< games.length; i++){
        if(games[i].id == gameId && games[i].gameState == GameState.InProgress) {
            newGame.id = games[i].id;
            newGame.deposit1 = games[i].deposit1;
            newGame.deposit2 = games[i].deposit2;
            newGame.player1 = games[i].player1;
            newGame.player2 = games[i].player2;
            newGame.gameState = games[i].gameState;
            if(context.sender == games[i].player1){
                newGame.player1Guess = guess;
            }
            else {
                newGame.player2Guess = guess;
            }
                
            games.replace(i,newGame);
            return "Done"
        }
    }
    return "Game Not Found";
}

export function finishGame(gameId: u32) : string {

  const randomNumber = new RNG<u32>(1, u32.MAX_VALUE);
  const randomNum = randomNumber.next();
  for(let i =0; i< games.length; i++)
  { 
    logging.log("In the for loop - finishGame function");
    logging.log("gameIs id: " + gameId.toString());
      if(games[i].id == gameId && 
        games[i].gameState == GameState.InProgress)
      {
        logging.log("Found a game in progress with is:" + games[i].id.toString());
        logging.log("Random number generated is: "+ randomNum.toString());
        logging.log("Player 1 address is: "+ games[i].player1);
        logging.log("Player 2 address is: "+ games[i].player2);

        if(randomNum %3 == 0){
          if(games[i].player2Guess == true) {
          logging.log("Game Winner is: "+ games[i].player2);
          const updateGame = new Game();
          updateGame.gameState = GameState.Completed;
          updateGame.player1 = games[i].player1;
          updateGame.player2 = games[i].player2;
          updateGame.deposit1 = games[i].deposit1;
          updateGame.deposit2 = games[i].deposit2;
          updateGame.id = games[i].id;
          updateGame.winner = games[i].player2;
          games.replace(i, updateGame);

          // logging.log("Game Winner is: "+ updateGame.winner);
          //Send 2*deposit to the winning player
          const to_beneficiary = ContractPromiseBatch.create(updateGame.winner);

          //logging.log("Beneficiary is: " + to_beneficiary.id.toString());
          // logging.log("Game Deposit 1 is: "+ updateGame.deposit1.toString());
          // logging.log("Game Deposit 2 is: "+ updateGame.deposit2.toString());
          to_beneficiary.transfer(u128.add(updateGame.deposit1, updateGame.deposit2));
          return updateGame.winner;
          }
          else {
            logging.log("Game Winner is: "+ games[i].player1);
            const updateGame = new Game();
            updateGame.gameState = GameState.Completed;
            updateGame.player1 = games[i].player1;
            updateGame.player2 = games[i].player2;
            updateGame.deposit1 = games[i].deposit1;
            updateGame.deposit2 = games[i].deposit2;
            updateGame.id = games[i].id;
            updateGame.winner = games[i].player1;
            games.replace(i, updateGame);
  
            // logging.log("Game Winner is: "+ updateGame.winner);
            //Send 2*deposit to the winning player
            const to_beneficiary = ContractPromiseBatch.create(updateGame.winner);
  
            //logging.log("Beneficiary is: " + to_beneficiary.id.toString());
            // logging.log("Game Deposit 1 is: "+ updateGame.deposit1.toString());
            // logging.log("Game Deposit 2 is: "+ updateGame.deposit2.toString());
            to_beneficiary.transfer(u128.add(updateGame.deposit1, updateGame.deposit2));
            return updateGame.winner;
          }
        }
        else {
          if(games[i].player2Guess == false){
          logging.log("Game Winner is: "+ games[i].player2);
          const updateGame = new Game();
          updateGame.gameState = GameState.Completed;
          updateGame.player1 = games[i].player1;
          updateGame.player2 = games[i].player2;
          updateGame.deposit1 = games[i].deposit1;
          updateGame.deposit2 = games[i].deposit2;
          updateGame.id = games[i].id;
          updateGame.winner = games[i].player2;
          games.replace(i, updateGame);

          // logging.log("Game Winner is: "+ updateGame.winner);
          //Send 2*deposit to the winning player
          const to_beneficiary = ContractPromiseBatch.create(updateGame.winner);

          //logging.log("Beneficiary is: " + to_beneficiary.id.toString());
          // logging.log("Game Deposit 1 is: "+ updateGame.deposit1.toString());
          // logging.log("Game Deposit 2 is: "+ updateGame.deposit2.toString());
          to_beneficiary.transfer(u128.add(updateGame.deposit1, updateGame.deposit2));
          return updateGame.winner;
        }
        else {
          logging.log("Game Winner is: "+ games[i].player1);
          const updateGame = new Game();
          updateGame.gameState = GameState.Completed;
          updateGame.player1 = games[i].player1;
          updateGame.player2 = games[i].player2;
          updateGame.deposit1 = games[i].deposit1;
          updateGame.deposit2 = games[i].deposit2;
          updateGame.id = games[i].id;
          updateGame.winner = games[i].player1;
          games.replace(i, updateGame);

          // logging.log("Game Winner is: "+ updateGame.winner);
          //Send 2*deposit to the winning player
          const to_beneficiary = ContractPromiseBatch.create(updateGame.winner);

          //logging.log("Beneficiary is: " + to_beneficiary.id.toString());
          // logging.log("Game Deposit 1 is: "+ updateGame.deposit1.toString());
          // logging.log("Game Deposit 2 is: "+ updateGame.deposit2.toString());
          to_beneficiary.transfer(u128.add(updateGame.deposit1, updateGame.deposit2));
          return updateGame.winner;
        }
    }
    }
  }
return 'None';
}

//Getters for all the game variables

//Returns all the active games which have been created
export function getActiveGames(): PersistentMap<u32, u128> {
  
  let tempGamesMap = new PersistentMap<u32, u128>("t");
  for(let i =0; i< games.length; i++){
      if(games[i].gameState == GameState.Created){
          tempGamesMap.set(games[i].id, games[i].deposit1);
      }
  }
  return tempGamesMap;
}

//Get the first player details
export function getPlayer1Details(gameId: i32): string {
    for(let i =0; i< games.length; i++){
        if(games[i].id == gameId){
            return games[i].player1;
        }
    }
    return "None";
}


//Get the second player details
export function getPlayer2Details(gameId: i32): string {
    for(let i =0; i< games.length; i++){
        if(games[i].id == gameId){
            return games[i].player2;
        }
    }
    return "None";
}

//Get the deposit deetails
export function getDeposit(gameId: i32): u128 {
    for(let i =0; i< games.length; i++){
        if(games[i].id == gameId){
            return games[i].deposit1;
        }
    }
    return u128.Zero;
}

//Get the Game State
export function getGameState(gameId: i32): GameState {
    for(let i =0; i< games.length; i++){
        if(games[i].id == gameId){
            return games[i].gameState;
        }
    }
    return GameState.NotFound;
}

//Get the winner of the game
export function getWinner(gameId: i32): string {
    for(let i =0; i< games.length; i++){
        if(games[i].id == gameId){
            if(games[i].gameState == GameState.Completed){
                return games[i].winner;
            }
        }
    }    
    return "None";
}


