#!/usr/bin/env bash
set -e

echo
echo \$CONTRACT is $CONTRACT
echo \$OWNER is $OWNER
echo

#coin-toss-demo contract calls

# $OWNER = gyan.testnet

# Step1: Create a game and get the gameID, use it for all the further calls
near call $CONTRACT createGame --amount 15 --account_id $OWNER

# #call get player 1 details from the contract
#near call $CONTRACT getPlayer1Details '{"gameId":1464968695}' --account_id gyan.testnet

#Step 2: Get the gameState after game creation - should be 0

#near call $CONTRACT getGameState '{"gameId":1464968695}' --account_id gyan.testnet

#Step 3: Get all the gameIds and deposits for games that are in created state
#near call $CONTRACT getActiveGames --account_id $OWNER

#Step 4: Call joinGame using another account id
#near call $CONTRACT joinGame '{"gameId":1464968695}' --amount 5 --account_id gyanlakshmi.testnet

#Step 5: Get the game state after joining the game - should be 1
#near call $CONTRACT getGameState '{"gameId":1464968695}' --account_id gyan.testnet


#Step 6: Call function chooseGuesser to return who has been chosen to guess
#near call $CONTRACT chooseGuesser '{"gameId":1464968695}' --account_id gyan.testnet

#Step 7: Call makeAGuess function by the chosen guesser
#near call $CONTRACT makeAGuess '{"gameId":1464968695, "guess": false}' --account_id gyanlakshmi.testnet

#Step 8: Call finishGame to get the winner
#near call $CONTRACT finishGame '{"gameId":1464968695}' --account_id $OWNER

#near call $CONTRACT getWinner '{"gameId":1464968695}' --account_id $OWNER
# # ------------------------
# -------------------------
# ------------------------
# ------------------------
# ------------------------
# ------------------------
# ------------------------
# these functions are all "view" functions so they don't require a signature
# near view $CONTRACT showYouKnow     # this one returns false (function return value is void)
# near view $CONTRACT showYouKnow2    # this one returns true
# near view $CONTRACT sayHello        # this one returns a literal string

# ------------------------
# the next method uses a host function to retrieve the caller's name so it needs to be a CHANGE function (using "call" here)
# you can read more about host function restrictions here: https://docs.near.org/docs/develop/contracts/as/intro#view-and-change-functions
# ----
# near view $CONTRACT sayMyName
# ----
# so this is the solution, to replace "view" with "call" and include a signer
#
# the next method writes to storage.  storage is structured as key-value pairs
# near call $CONTRACT saveMyName --account_id $OWNER
# # ------------------------


# # ------------------------
# # these methods use a collection wrapper around blockchain storage
# # you can read more about collections here: https://docs.near.org/docs/concepts/data-storage
#near call $CONTRACT saveMyMessage '{"message":"hey again"}' --account_id $OWNER
# near call $CONTRACT getAllMessages --account_id $OWNER
# # ------------------------

