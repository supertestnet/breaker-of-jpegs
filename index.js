import crypto from 'crypto'
import { Buff }      from '@cmdcode/buff-utils'
import { SecretKey } from '@cmdcode/crypto-utils'
import { Address, Signer, Tap, Tx, } from '@cmdcode/tapscript'
import fs      from 'fs/promises'
import { URL } from 'url'
import readline from 'readline'
import promptSync from 'prompt-sync';
const prompt = promptSync();
var getRand = size => crypto.getRandomValues(new Uint8Array(size));

function bytesToHex( bytes ) {
    return bytes.reduce( ( str, byte ) => str + byte.toString( 16 ).padStart( 2, "0" ), "" );
}

var breakTheJpegs = async () => {
	const imgpath = new URL('./soma.txt', import.meta.url).pathname
	const imgdata = await fs.readFile(imgpath).then(e => new Uint8Array(e))
	const marker   = Buff.encode('ord')
	const mimetype = Buff.encode('text/plain;charset=utf-8')
	const secret = bytesToHex( getRand( 32 ) );
	const seckey = new SecretKey(secret, { type: 'taproot' })
	const pubkey = seckey.pub
	const address1 = Address.p2tr.encode( pubkey, "mainnet" );
	console.log( "send 10000 sats here:", address1 );
	const script = [ pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', imgdata, 'OP_ENDIF' ]
	const tapleaf = Tap.encodeScript(script)
	const [ tpubkey, cblock ] = Tap.getPubKey(pubkey, { target: tapleaf })
	const address = Address.p2tr.fromPubKey(tpubkey, 'mainnet')
	const first_txid = prompt("What is the txid in which you sent the funds? ");
	if ( !first_txid ) return;
	var first_vout = prompt("What is the vout where the 10000 sats are in that transaction? ");
	var keep_going = false;
	if ( first_vout === 0 ) keep_going = true;
	if ( first_vout == "" && !keep_going ) return;
	first_vout = Number( first_vout );
	const init_tx = Tx.create({
	  vin  : [{
	    txid: first_txid,
	    vout: first_vout,
	    prevout: {
	      value: 10_000,
	      scriptPubKey: [ 'OP_1', pubkey ]
	    },
	  }],
	  vout : [{
	    value: 0,
	    scriptPubKey: Address.toScriptPubKey(address)
	  }]
	});
	var init_txid = Tx.util.getTxid( Tx.fmt.toBytes( init_tx ) );
	const init_sig = Signer.taproot.sign(seckey, init_tx, 0)
	init_tx.vin[0].witness = [ init_sig ]
	console.log( "" );
	console.log( "" );
	console.log( "" );
	console.log( "" );
	console.log( "---- Here are your transactions ----" );
	console.log( "" );
	console.log( "" );
	console.log( "" );
	console.log( "commit tx:", Tx.encode(init_tx).hex );
	console.log( "" );
	const txdata = Tx.create({
	  vin  : [{
	    txid: init_txid,
	    vout: 0,
	    prevout: {
	      value: 0,
	      scriptPubKey: Address.toScriptPubKey(address)
	    },
	  }],
	  vout : [{
	    value: 0,
	    scriptPubKey: ['OP_RETURN', '']
	  }]
	})

	const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf })
	txdata.vin[0].witness = [ sig, script, cblock ]
	const isValid = Signer.taproot.verify(txdata, 0, { pubkey, throws: true })
	var txhex = Tx.encode(txdata);
	console.log( "reveal tx:", txhex.hex );
  console.log( "" );
  console.log( "send both of those transactions to a miner and ask them to mine them" );
}
breakTheJpegs()
