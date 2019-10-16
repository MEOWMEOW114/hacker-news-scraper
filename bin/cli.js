
const axios = require('axios');
const URL = require('url').URL;
const BASE_URL = 'https://hacker-news.firebaseio.com/v0/';

const getTopStoryIds = async () => {
    try {
        const response = await axios.get(`${BASE_URL}topstories.json`, {}, { timeout: 8});
        const storyIds = response.data;
        return storyIds;
    } catch(e) {
        return [];
    }
}

const getStoryItem = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}item/${id}.json`, {}, { timeout: 8});
        return response.data;
    } catch(e) {
        return null;
    }
}


const getStories = async (ids, count) => {

    let cloneIds = [...ids];
    let result = [];
    let currentTask = ids.splice(0, count);

    // call story item api in batch with size = count. 
    // until all ids are used 
    // or the result have sufficient amount of items
    while (currentTask && currentTask.length > 0 || ids.length > 0 && result.length < count) {

        const tempResults = (await Promise.all(
            (currentTask.map( async (id) => 
                await getStoryItem(id))
            )
        )).filter( result => {
            if (!result) return false;

            // ensure that title and author are non empty strings not longer than 256 characters.
            if (!result.title || result.title.length > 256) return false;
            if (!result.by || result.by.length > 256) return false;

            // points, comments and rank are integers >= 0.
            if (!result['score'] || result.score < 0) return false;
            if (!result['descendants'] || result.descendants < 0) return false;

            // ensure that uri is a valid URI
            try {
                if (!result.url || !(new URL(result.url))) return false;
            } catch(e) {
                return false;
            }

            return true;

        }).map( result => ({
            // map to expected return keys.
            title: result.title,
            uri: result.url,
            author: result.by,
            points: result.score,
            comments: result.descendants,
            ranks: cloneIds.indexOf(result.id) + 1,
        }));

        result = [...result, ...tempResults];

        currentTask = ids.splice(0, count - result.length);        
    }
    return result;
}

 module.exports = {
     cli: async (count) => {
        const ids = await getTopStoryIds();
        let output = [];
        if (ids.length > 0) {
            output = await getStories(ids, count);
        } 
        console.log(output);
        return output;
    },
    getTopStoryIds,
    getStoryItem,
    getStories,
 } 

