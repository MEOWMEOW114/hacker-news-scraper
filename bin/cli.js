
const axios = require('axios');
const URL = require('url').URL;
const BASE_URL = 'https://hacker-news.firebaseio.com/v0/';

const getTopStoryIds = async () => {
    try {
        const response = await axios.get(`${BASE_URL}topstories.json`);
        const storyIds = response.data;
        return storyIds;
    } catch(e) {
        return [];
    }
}

const getStoryItem = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}item/${id}.json`);
        return response.data;
    } catch(e) {
        return null;
    }
}


const getStories = async (ids, count) => {

    let cloneIds = [...ids];
    let result = [];
    let currentTask = ids.splice(0, count);
    // console.log('currentTAsk,', currentTask )

    while (currentTask && result.length < count) {
        // console.log('result.length,', result.length )

        const tempResults = (await Promise.all(
            (currentTask.map( async (id) => 
                await getStoryItem(id))
            )
        )).filter( result => {

            if (!result) return false;

            // if (result.score < 100) return false;

            if (result.score < 0) return false;

            if (!(new URL(result.url))) return false;

            return true;
        }).map( result => ({
            title: result.title,
            uri: result.url,
            author: result.by,
            points: result.score,
            comments: result.descendants,
            // ranks: result.kids.length,
            ranks: cloneIds.indexOf(result.id)
        }));
        // console.log('validResults', tempResults.length)

        result = [...result, ...tempResults];

        currentTask = ids.splice(0, count - result.length);        
    }
    return result;
}

 module.exports = async (count) => {
    const ids = await getTopStoryIds();
    // console.log(ids)
    const output = await getStories(ids, count);
    console.log(output)
    // console.log(output.length)
}