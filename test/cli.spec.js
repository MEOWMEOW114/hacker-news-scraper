
const {cli, getTopStoryIds, getStoryItem } = require('../bin/cli.js');

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const chai = require('chai');
const assertArrays = require('chai-arrays');
const chaiThings = require('chai-things');

chai.use(assertArrays);
chai.use(chaiThings);

const expect = chai.expect;
const mock = new MockAdapter(axios);
const BASE_URL = 'https://hacker-news.firebaseio.com/v0/';

describe('top stories ids api', () => {

    it('test with failure response', async () => {
        mock.onGet(`${BASE_URL}topstories.json`).reply(500);
        const output = await getTopStoryIds();
        expect(output).to.be.ofSize(0);
    })

    it('test with timeout response', async () => {
        mock.onGet(`${BASE_URL}topstories.json`).networkError();
        const output = await getTopStoryIds();
        expect(output).to.be.ofSize(0);
    })

    // it('story item api', async () => {

       
    // });
  
});

describe('story item api,', () => {

    it('test with failure respnose', async()=> {
        const failureId = 223;

        mock.onGet(`${BASE_URL}item/${failureId}.json`).reply(500)
        const output = await getStoryItem(failureId);
        expect(output).to.be.null;
    })

    it('test with failure respnose', async()=> {

        const tempId = 8888;
        mock.onGet(`${BASE_URL}item/${tempId}.json`).reply(200, {
            id: tempId
        })
        const output = await getStoryItem(tempId);
        expect(output).to.have.property('id')
    })
})

describe('cli', () => {
    
    const dummyString = 'The comments parethe relevant story';
    const lengthString = 'https://stackoverflow.com/questions/1098040/checking-if-a-key-exists-in-a-javascript-objecthttps://stackoverflow.com/questions/1098040/checking-if-a-key-exists-in-a-javascript-objecthttps://stackoverflow.com/questions/1098040/checking-if-a-key-exists-in-a-javascript-objecthttps://stackoverflow.com/questions/1098040/checking-if-a-key-exists-in-a-javascript-object';
    const validUrl = 'https://stackoverflow.com/questions/1098040/checking-if-a-key-exists-in-a-javascript-object';

    it('20 top stories in which 6 have invalid uri', async()=> {
        // generate top story ids --> [1,2,3,4 .. 20]

        const getTopStoryIds = [...Array(20).keys()].map( i => i + 1);

        mock.onGet(`${BASE_URL}topstories.json`).reply(200,
            getTopStoryIds
        );
        getTopStoryIds.forEach( id => {
            mock.onGet(`${BASE_URL}item/${id}.json`).reply(200, {
                id,
                score: id,
                url: id % 3 === 0 ? 'asdfasd' : validUrl,
                descendants: id,
                ranks: id,
                title: dummyString,
                by: dummyString,
                points: id,
            })
        })
        const output = await cli(20);
        expect(output).to.be.ofSize(14);

    });

    it('20 top stories in which 6 have negative score or decendants', async()=> {
        // generate top story ids --> [1,2,3,4 .. 20]

        const getTopStoryIds = [...Array(20).keys()].map( i => i + 1);

        mock.onGet(`${BASE_URL}topstories.json`).reply(200,
            getTopStoryIds
        );
        getTopStoryIds.forEach( id => {
            mock.onGet(`${BASE_URL}item/${id}.json`).reply(200, {
                id,
                score: id % 5 === 0 ? -1 : id, 
                url: validUrl,
                descendants: id % 7 === 0 ? -1 : id, 
                ranks: id,
                title: dummyString,
                by: dummyString,
                points: id,
            })
        })
        const output = await cli(20);
        expect(output).to.be.ofSize(14);

    });
    
    it('20 top stories in which 4 have lengthy title or author', async()=> {

        const getTopStoryIds = [...Array(20).keys()].map( i => i + 1);

        mock.onGet(`${BASE_URL}topstories.json`).reply(200,
            getTopStoryIds
        );
        getTopStoryIds.forEach( id => {
            mock.onGet(`${BASE_URL}item/${id}.json`).reply(200, {
                id,
                score: id, 
                url: validUrl,
                descendants: id, 
                ranks: id,
                title: id % 9 === 0 ? lengthString: dummyString,
                by: id % 6 === 0 ? lengthString: dummyString,
                points: id,
            })
        })
        const output = await cli(40);
        expect(output).to.be.ofSize(16);

    });
    
    it('500 top stories in which only last 5 have api call success', async()=> {

        const getTopStoryIds = [...Array(500).keys()].map( i => i + 1);

        mock.onGet(`${BASE_URL}topstories.json`).reply(200,
            getTopStoryIds
        );
        getTopStoryIds.forEach( id => {
            if (id <= 200) {
                mock.onGet(`${BASE_URL}item/${id}.json`).timeout();
            } else if (id <= 495) {
                mock.onGet(`${BASE_URL}item/${id}.json`).networkError();
            } else {
                mock.onGet(`${BASE_URL}item/${id}.json`).reply(200, {
                    id,
                    score: id, 
                    url: validUrl,
                    descendants: id, 
                    ranks: id,
                    title: dummyString,
                    by: dummyString,
                    points: id,
                })
            }
        })
        const output = await cli(20);
        expect(output).to.be.ofSize(5);

    });

    it('no of top stories available is less than expected ', async()=> {

        const getTopStoryIds = [...Array(50).keys()].map( i => i + 1);

        mock.onGet(`${BASE_URL}topstories.json`).reply(200,
            getTopStoryIds
        );
        getTopStoryIds.forEach( id => {
            mock.onGet(`${BASE_URL}item/${id}.json`).reply(200, {
                id,
                score: id, 
                url: validUrl,
                descendants: id, 
                ranks: id,
                title: dummyString,
                by: dummyString,
                points: id,
            })
        })
        const output = await cli(100);
        expect(output).to.be.ofSize(50);

    });
})