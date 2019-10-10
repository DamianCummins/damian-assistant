import * as tf from "@tensorflow/tfjs-node";
import lancasterStemmer from "lancaster-stemmer";
import intents from "./intents.json";

let model;

const fields = ["response", "intent", "probabilities"];
let words = [];
let classes = [];

/**
 * init
 * Load the model and intents
 */
async function init() {
    // Load model
    model = await tf.loadLayersModel("file://./lib/model/model.json");

    // Process intents and classes
    const ignoreWords = ["?"];
    const classesSet = new Set();

    intents.intents.forEach((intent) => {
        intent.patterns.forEach((pattern) => {
            words = [
                ...words,
                ...pattern.split(/(\.)|(,)|(\'.)|(\?)/g).join(" ").split(/[ ]/g)];
            classesSet.add(intent.tag);
        });
    });

    classes = Array.from(classesSet);
    words = Array.from(new Set(words
        .filter(word => ignoreWords.indexOf(word) === -1 && word.length > 0)
        .map(word => lancasterStemmer(word))));
    
    // Handle some inconsistencies between lancaster stemmer in python vs javascript
    words.push('univers');
    words[words.indexOf('scy')] = 'sci';
    words[words.indexOf('down-tim')] = 'down-time';

    words.sort();
    classes.sort();

    return Promise.resolve();
}

/**
 * predict
 * Predict the intent of an incoming message and randomly select 
 * one of the responses for that intent
 * @param {String[]} message 
 */
function predict(message) {
    // encode the text using bag of words
    const bow = _bow(message[0], words);

    // pass the tensor to the model for prediction
    const inputData = tf.tensor2d([bow]);
    const prediction = model.predict(inputData);
    
    return prediction.data()
        .then((data) => {
            // retain probability indices before sorting and reversing
            // as we use it to get the class label
            const results = Array.from(data)
                .map((probability, index) => [probability, index])
                .sort()
                .reverse();

            // choose the highest score
            const result = results[0];
            
            const probabilities = Object.values(data);
            const values = [
                _getResponse(classes[result[1]]),
                classes[result[1]],
                probabilities
            ];
            return Promise.resolve(values);
        });
}

function _getResponse(tag) {
    const tagObj = intents.intents.find((value) => value.tag === tag);
    return tagObj.responses[Math.floor(Math.random() * Math.floor(tagObj.responses.length))];
}

function _cleanUpSentence(sentence) {
    let sentenceWords = sentence.split(" ");
    sentenceWords = sentenceWords.map((word) => lancasterStemmer(word));
    return sentenceWords;
}

function _bow(sentence, words) {
    const sentenceWords = _cleanUpSentence(sentence);
    const bag = new Array(words.length).fill(0.0);
    sentenceWords.forEach((sentenceWord) => {
        words.forEach((word, index) => {
            if(word === sentenceWord) {
                bag[index] = 1.0
            }
        });
    });
    return bag;
}

export default {
    init,
    predict,
    getClasses: () => classes,
    getFields: () => fields
}
