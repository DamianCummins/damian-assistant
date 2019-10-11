# Damian Assistant

## Description
An Express.js web application with React.js Server Side Rendered (SSR) Chatbot UI, built around a TensorFlow.js Text Classification model. The application integrates with IBM Watson OpenScale to log payloads sent to the classification model.

## Model
The model has been trained to classify questions about my resume as one of the following intents: `['education', 'experience', 'goodbye', 'greeting', 'hobbies', 'options', 'projects', 'skills', 'thanks']`. The notebook used to train the model can be found in the [/notebook directory](https://github.com/DamianCummins/damian-assistant/tree/master/notebook).

The saved model has been converted using [TensorFlow Converter](https://www.tensorflow.org/js/tutorials/conversion/import_keras) and the binary & json output is located in the [/lib/model directory](https://github.com/DamianCummins/damian-assistant/tree/master/lib/model).

