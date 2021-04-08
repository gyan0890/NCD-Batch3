# Coin-Toss-Demo

This repository includes a coin-toss-demo project using AssemblyScript contracts targeting the NEAR platform.

## Usage
In this project, you can run the contracts to play a game of coin-toss between any two near accounts. The results of the game are randomly declared.

### Getting started

1. clone this repo to a local folder
2. run `yarn`


### Steps to run the project
1. Run the ./scripts/1.init.sh script to deploy the contract. Copy the contract address geenerated as dev-1234-123(for example) and set it
to point to the contract variable by setting export CONTRACT=dev-1234-123
2. Run the ./scripts/2.init.sh script to create a game. You can modify the amount of NEAR that you want to lock in the game by changing the --amount flag set in line 14. Default is 15 NEAR. 
3. The above script will return a gameId. Open another terminal to run the other scripts as you would need this gameId to call all the other contract functions.
4. Copy the gameId and replace it as the parameter in scripts 3.run.sh and 4.run.sh wherever you find the arguments {"gameId": "Your Newly Generated GameID"}
5. Run the script 3.run.sh - This will return a guesser as the output of the last call.
6. Copy the guesser wallet and paste it in script 4.run.sh at line : makeAGuess ... --account_id "Guesser Name". You can also change the "guess" variable to "true"/"false".
7. Run the script 4.run.sh and you will get a winner name at the end.
8. You can check the seecond last transaction ID returned as a result of 4.run.sh in the explorer to check if the total amount of NEAR were transferred to the winner or not!

### Steps to run Unit Tests
1. Run yarn test:unit to run the unit tests at the parent directory

### Contracts and Unit Tests

```txt
src
├── cointoss                        <-- coin toss contract
│   ├── README.md
│   ├── __tests__
│   │   ├── README.md
│   │   └── index.unit.spec.ts
│   └── assembly
│       └── index.ts
└── utils.ts                      <-- shared contract code
```
