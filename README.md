# Breaker of jpegs
A tool for increasing the off-by-one bug in ordinal explorers

# How to break ordinals

On 2023-05-04 I introduced an off-by-one bug into ordinal theory in the following bitcoin transaction: https://mempool.space/tx/c1e0db6368a43f5589352ed44aa1ff9af33410e4a9fd9be0f6ac42d9e4117151

The index.js tool in this repository will let you do the same thing. Here are the steps:

1. Clone this github repo: `git clone https://github.com/supertestnet/breaker-of-jpegs.git`
2. Enter the directory and make it a nodejs pacakge: `cd breaker-of-jpegs && npm init -y`
3. Ensure you are running node version 19.0.0. (I installed `nvm` and then ran `nvm install 19.0.0` to do this.)
4. Install the dependencies: `npm i crypto @cmdcode/buff-utils @cmdcode/crypto-utils @cmdcode/tapscript fs/promises url prompt-sync`
5. Modify your package.json and add this line to turn the package into a module: `"type": "module",` <-- add that line under `"main": "index.js",`
6. Run the app with `node index.js`
7. Send 10k sats to the bitcoin address it shows you
8. Enter the txid and vout of your transaction when it prompts you for that info
9. It will spit out two bitcoin transactions. Send both of them to a bitcoin miner to get them mined. Lots of mining pools have telegram channels or contact forms on their websites. Ask me for help if you can't fine a bitcoin miner on your own.
