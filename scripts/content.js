const OPEN_AI_API_KEY = 'YOUR_OPEN_AI_API_KEY';

let questionText = null;
let answerTexts = [null, null, null, null];
let lastQuestion = null;

const choiceTextSelectors = [
    '[data-functional-selector=question-choice-text-0]',
    '[data-functional-selector=question-choice-text-1]',
    '[data-functional-selector=question-choice-text-2]',
    '[data-functional-selector=question-choice-text-3]',
];

// https://stackoverflow.com/a/36760383
const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (!mutation.addedNodes) {
            return;
        }
        const question = document.querySelector('[role=heading]');
        if (question) {
            updateQuestionText(question.innerText);
        }
        const answer = document.querySelector(choiceTextSelectors[0]);
        if (answer) {
            for (let i = 0; i < 4; i++) {
                const answer = document.querySelector(choiceTextSelectors[i]);
                if (answer) {
                    updateAnswerTexts(i, answer.innerText);
                }
            }
            if (questionText !== lastQuestion) {
                lastQuestion = questionText;
                let answerPrompt = '';
                for (let i = 0; i < 4; i++) {
                    answerPrompt += (i + 1) + '. ' + answerTexts[i] + '\n';
                }
                let prompt = 'Only output the selected answer\n\n' + questionText + '\n' + answerPrompt;
                console.log(prompt);
                fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + OPEN_AI_API_KEY,
                    },
                    body: JSON.stringify({
                        'model': 'gpt-3.5-turbo',
                        'messages': [
                            {
                                'role': 'user',
                                'content': prompt,
                            }
                        ]
                    })
                }).then(response => response.json()).then(data => {
                    const choice = data.choices[0].message.content;
                    console.log('Response:', choice);
                    const choiceIndex = parseInt(choice) ? parseInt(choice) - 1 : 2;
                    console.log('Selecting:', choiceIndex);
                    document.querySelector(choiceTextSelectors[choiceIndex]).click();
                });
            }
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

function updateQuestionText(s) {
    if (questionText !== s) {
        questionText = s;
        console.log('Question:', questionText);
    }
}

function updateAnswerTexts(i, s) {
    if (answerTexts[i] !== s) {
        answerTexts[i] = s;
        console.log('Answer ' + i + ':', answerTexts[i]);
    }
}
