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
import { context, u128, PersistentMap, logging, ContractPromiseBatch, RNG} from "near-sdk-as";

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

export const games = new PersistentMap<u32, Game>("g");

export function createGame(): u32 {
    logging.log("Attached Deposit with this account " + context.attachedDeposit.toString());
    logging.log("In contract");
    const game = new Game();
    games.set(game.id, game);
    return game.id;
}

export function joinGame(gameId: u32): boolean {
    //Loop through game Ids to check the game
    const game = games.getSome(gameId);
    if(game != null){
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
            if(context.attachedDeposit >= game.deposit1 
                && game.gameState == GameState.Created
                && context.sender != game.player1){
                    game.deposit2 = context.attachedDeposit;
                    game.gameState = GameState.InProgress;
                    game.player2 = context.sender;
                games.set(game.id, game);
                
                return true;
            }
            else {
                return false;
            }
    }
    return false;
}

export function chooseGuesser(gameId: u32): string {
    const randomNumber = new RNG<u32>(1, u32.MAX_VALUE);
    const randomNum = randomNumber.next();
    const game = games.getSome(gameId);

    if(game != null){
        if(game.gameState == GameState.InProgress){
            if(randomNum % 3== 0){
                return game.player1; 
            }
            else
                return game.player2;
            }
    }
    return "Game Not Found";
    
}

export function makeAGuess(gameId: u32, guess: boolean): string {

    const game = games.getSome(gameId);
    if(game != null){
        if(game.gameState == GameState.InProgress) {
            if(context.sender == game.player1){
                game.player1Guess = guess;
            }
            else {
                game.player2Guess = guess;
            }
                
            games.set(game.id,game);
            return "Done"
        }
    }
    return "Game Not Found";
}

export function finishGame(gameId: u32) : string {

  const randomNumber = new RNG<u32>(1, u32.MAX_VALUE);
  const randomNum = randomNumber.next();
  const game = games.getSome(gameId);
   
    // logging.log("In the for loop - finishGame function");
    // logging.log("gameIs id: " + gameId.toString());
      if(game != null && 
        game.id == GameState.InProgress)
      {
        // logging.log("Found a game in progress with is:" + games[i].id.toString());
        // logging.log("Random number generated is: "+ randomNum.toString());
        // logging.log("Player 1 address is: "+ games[i].player1);
        // logging.log("Player 2 address is: "+ games[i].player2);

        if(randomNum %3 == 0){
          if(game.player2Guess == true) {
          logging.log("Game Winner is: "+ game.player2);
          game.gameState = GameState.Completed;
          game.winner = game.player2;
          games.set(game.id, game);

          // logging.log("Game Winner is: "+ updateGame.winner);
          //Send 2*deposit to the winning player
          const to_beneficiary = ContractPromiseBatch.create(game.winner);

          //logging.log("Beneficiary is: " + to_beneficiary.id.toString());
          // logging.log("Game Deposit 1 is: "+ updateGame.deposit1.toString());
          // logging.log("Game Deposit 2 is: "+ updateGame.deposit2.toString());
          to_beneficiary.transfer(u128.add(game.deposit1, game.deposit2));
          return game.winner;
          }
          else {
            logging.log("Game Winner is: "+ game.player1);
            game.gameState = GameState.Completed;
            game.winner = game.player1;
            games.set(game.id, game);
  
            // logging.log("Game Winner is: "+ updateGame.winner);
            //Send 2*deposit to the winning player
            const to_beneficiary = ContractPromiseBatch.create(game.winner);
  
            //logging.log("Beneficiary is: " + to_beneficiary.id.toString());
            // logging.log("Game Deposit 1 is: "+ updateGame.deposit1.toString());
            // logging.log("Game Deposit 2 is: "+ updateGame.deposit2.toString());
            to_beneficiary.transfer(u128.add(game.deposit1, game.deposit2));
            return game.winner;
          }
        }
        else {
          if(game.player2Guess == false){
          logging.log("Game Winner is: "+ game.player2);
          game.gameState = GameState.Completed;
          game.winner = game.player2;
          games.set(game.id, game);

          // logging.log("Game Winner is: "+ updateGame.winner);
          //Send 2*deposit to the winning player
          const to_beneficiary = ContractPromiseBatch.create(game.winner);

          //logging.log("Beneficiary is: " + to_beneficiary.id.toString());
          // logging.log("Game Deposit 1 is: "+ updateGame.deposit1.toString());
          // logging.log("Game Deposit 2 is: "+ updateGame.deposit2.toString());
          to_beneficiary.transfer(u128.add(game.deposit1, game.deposit2));
          return game.winner;
        }
        else {
          logging.log("Game Winner is: "+ game.player1);
          game.gameState = GameState.Completed;
          game.winner = game.player1;
          games.set(game.id, game);

          // logging.log("Game Winner is: "+ updateGame.winner);
          //Send 2*deposit to the winning player
          const to_beneficiary = ContractPromiseBatch.create(game.winner);

          //logging.log("Beneficiary is: " + to_beneficiary.id.toString());
          // logging.log("Game Deposit 1 is: "+ updateGame.deposit1.toString());
          // logging.log("Game Deposit 2 is: "+ updateGame.deposit2.toString());
          to_beneficiary.transfer(u128.add(game.deposit1, game.deposit2));
          return game.winner;
        }
    }
    }
return 'None';
}

//Getters for all the game variables

//Returns all the active games which have been created
// export function getActiveGames(): Array<u32> {
  
//   let tempGamesMap = new Array<u32>();

//   for(let i =0; i< games.length; i++){
//       if(games[i].gameState == GameState.Created){
//           tempGamesMap.push(games[i].id);
//       }
//   }
//   return tempGamesMap;
// }

// export function getActiveGamesDeposit(): Array<u128> {
  
//     let tempGamesMap = new Array<u128>();
  
//     for(let i =0; i< games.length; i++){
//         if(games[i].gameState == GameState.Created){
//             tempGamesMap.push(games[i].deposit1);
//         }
//     }
//     return tempGamesMap;
//   }

//Get the first player details
export function getPlayer1Details(gameId: i32): string {
    const game = games.getSome(gameId);
    if(game != null){
            return game.player1;
    }
    return "None";
}


//Get the second player details
export function getPlayer2Details(gameId: i32): string {
    const game = games.getSome(gameId);
    if(game != null){
            return game.player2;
    }
    return "None";
}

//Get the deposit deetails
export function getDeposit(gameId: i32): u128 {
    const game = games.getSome(gameId);
    if(game != null){
            return game.deposit1;
    }
    return u128.Zero;
}

//Get the Game State
export function getGameState(gameId: i32): GameState {
    const game = games.getSome(gameId);
    if(game != null){
            return game.gameState;
    }
    return GameState.NotFound;
}

//Get the winner of the game
export function getWinner(gameId: i32): string {
    const game = games.getSome(gameId);
    if(game != null && game.gameState == GameState.Completed){
            return game.winner;
    }    
    return "None";
}


