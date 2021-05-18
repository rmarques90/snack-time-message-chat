const https = require('https');

module.exports = {
    getThought() {
        return new Promise((resolve, reject) => {
            https.get('https://www.reddit.com/r/Showerthoughts/', (response) => {
                let dataChunks = [];
                response.on('data', chunk => {
                    dataChunks.push(chunk)
                });
                response.on('end', () => {
                    let data = Buffer.concat(dataChunks).toString('utf-8');
                    // console.log('Request end:', data, '\n\n\n');
                    let idxStart = data.indexOf('<script id="data">');
                    let idxSEnd = data.indexOf('</script>', idxStart);
                    let content = data.substring(idxStart, idxSEnd);
                    // console.log(content, '\n\n\n');
                    content = content.substring(32).replace(/;\s*$/, '');
                    // console.log(content, '\n\n\n');
                    try {
                        let parsedContent = JSON.parse(content);
                        // console.log(parsedContent.posts.models);
                        let posts = Object.entries(parsedContent.posts.models).map(([key, value]) => {
                            return {upvoteRatio: value.upvoteRatio, score: value.score, title: value.title};
                        });
                        posts.sort((p1, p2) => p1.score < p2.score ? 1 : -1);
                        console.log(posts[0]);
                        resolve(posts[0]);
                    } catch (e) {
                        console.log(e);
                        this.getThought().then(resolve).catch(reject);
                    }
                });
                response.on('error', err => reject(err));
            }).on('error', err => reject(err));
        });
    }
}
module.exports.getThought().then().catch(err => console.log('Error getting thoughts', err));