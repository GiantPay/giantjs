export default class Wallet {

    constructor () {
        // TODO need to generate with hd wallet
        // pregenerated keys
        this.accounts = [
            {
                privateKey: 'YULqUkbYnFT6Fw6YS9Es1H94THRe4BrujuXNgtqT52UMgivrqq7K',
                publicKey: 'GUuf1RCuFmLAbyNFT5WifEpZTnLYk2rtVd'
            },
            {
                privateKey: 'YUsc83YuzURjo5eqezyCKUQXAMXets1Ko6edm9paexd7wD8DYhrU',
                publicKey: 'GPLkrYE3GdXDoZMz4zhxyBmTiF1N3AQvpH'
            },
            {
                privateKey: 'YVu4osRVAJoXQFDikchxQyfbDWuJGV1AxzCj2QyndQGZex4p6ogv',
                publicKey: 'Gf84TLVMVaEBD1Vb5ZSax39i8VorgB5nC3'
            },
            {
                privateKey: 'YUCYpjZzmAQSZfAWg2W6FZdqmAjzV2JcQPSCWJPrLq8UUoS73SEJ',
                publicKey: 'GKFej3xYYzbv8qD5p2Q6CGxQVz1uFXZcVo'
            },
            {
                privateKey: 'YVGWKh4k8V9M3fKAMjWpcHVQMHxopPpgob5ooBBhHi2mc8vopHPf',
                publicKey: 'GRfRyKN7wkswAeDrmLvg9JSjfoZd29gkTv'
            },
            {
                privateKey: 'YUHPzYgrjch1k7SA8kBwNUMhmYYQmZTZQ2ZuTMjwisFwWxULRVYE',
                publicKey: 'GPe8tZMKBATcvJMu3AY2waXm2Hj6nE3YEM'
            },
            {
                privateKey: 'YWReKSYWsbYBg3YVumJ2goETpTc667Na4jwbrLSnWnMv7gLsza2j',
                publicKey: 'GSQoMjQFm2b942Z9AnGHnfGSspuAZbcfJa'
            },
            {
                privateKey: 'YSrY4bh7q2sZNq1NskriUbo8B7UAdf8XHxuh752c3u3Xq1TzTgpN',
                publicKey: 'GbHkZrS9X6LRifRY73pA87ZuUw4Nn7nd3a'
            },
            {
                privateKey: 'YT7Qf6U5CMCxg9oqpT1Z3UVCqx4czSj3gJxLJH6TU74gHCR8T9eE',
                publicKey: 'GJrnCVYHuzNMNkHstvmUxY6znp5iTcXAmB'
            },
            {
                privateKey: 'YTGiw1qxeQFgJTRDwVGwMEXkSCxyxXWcYLGeRHMYekvhECaSiE5P',
                publicKey: 'GcKg5sgUUXFLxhKoScUFMQMN95iFbrkqVa'
            }
        ]
    }

    getAccounts () {
        return this.accounts.map((key) => key.publicKey)
    }
}