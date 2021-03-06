

export default class LinkSystemStats{

    constructor(web3){

        this._web3 = web3;

    }

    getLatestBlocks(){

        const syncing = this._web3.eth.syncing;


        const latestBlockNumber = !syncing ? this._web3.eth.blockNumber : syncing.currentBlock;

        this._latestBlocks = [];

        for(let i = latestBlockNumber - 9; i <= latestBlockNumber; i++ ){

            this._latestBlocks.push(this._web3.eth.getBlock(i));

        }

        return this._latestBlocks;

    }

    getBlockTimes(){

        if(!this._latestBlocks || !this._latestBlocks.length){
            throw new Error('Must retrieve latest blocks to determine block times');
        }

        let blockTimes = [];

        // Get individual block times at the same time as we figure out the average
        this._totalTime = this._latestBlocks.reduce(
            (total, block, index)=>{

                let blockTime = 0;

                if(index !== 0){

                    blockTime = this._latestBlocks[index].timestamp - this._latestBlocks[index - 1].timestamp;
                    blockTimes.push(blockTime);

                }

                return  total + blockTime;

            }, 0);

        this._averageTime = this._totalTime / this._latestBlocks.length;

        return {
            blockTimes : blockTimes,
            average : this._averageTime
        }


    }

    getAverageDifficulty(){

        if(!this._latestBlocks || !this._latestBlocks.length){
            throw new Error('Must retrieve latest blocks to determine difficulty');
        }

        this._difficultySum = this._latestBlocks.reduce(
            (total, block)=>{

                return  total + parseInt(block.difficulty.toString());

            }, 0);

        this._averageDifficulty = (this._difficultySum / this._latestBlocks.length);
        return ( this._averageDifficulty / 1000000).toFixed(2);

    }

    getPeerCount(){

        return this._web3.net.peerCount;

    }

    getSync(){

        return this._web3.eth.syncing;

    }

    getGasPrice(){

        const wei = this._web3.eth.gasPrice.toString();
        return wei / 1000000000; // Return value in Gwei.

    }

    getHashRate(){  // The api applies only to mining nodes. Calculate from block difficulty and times

        if(!this._difficultySum || !this._totalTime){
            throw new Error('Need difficulty and block time to calculate hashrate');
        }

        return ((this._difficultySum / this._totalTime) / 1000000).toFixed(2);

    }

}