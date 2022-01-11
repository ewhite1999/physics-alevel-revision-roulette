// Creating a global event listener for the question/answer toggle
document.addEventListener("click", (e) => {
  if (e.target.matches("p")) {
    let flashCard = e.target.parentNode;
    flashCard.firstChild.classList.toggle("hidden");
    flashCard.lastChild.classList.toggle("hidden");
  }
});

// Load in the data.
const loadData = async () => {
  let response = await fetch("./data.json");
  let data = await response.json();
  return data;
};

// Create an array of just one of each subtopic.
const filterTopic = async () => {
  let data = await loadData();
  const L = data.length;
  let subtopics = [];
  for (let i = 0; i < L; i++) {
    let currentTopic = data[i]["Sub-topic"];
    if (subtopics.indexOf(currentTopic) === -1) subtopics.push(currentTopic);
  }
  return subtopics;
};

function checkAll(checked) { // pass true or false to check or uncheck all
  var inputs = document.getElementsByClassName("checkbox");
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].type == "checkbox") {
      inputs[i].checked = checked;
      // This way it won't flip flop them and will set them all to the same value which is passed into the function
    }
  }
}

const createSelectAll = (div, eventListener) => {
  button = document.createElement("button")

  button.classList.add("btn", "form_btn", "form_select");
  button.innerText = "Select All"

  button.addEventListener("click", function (e) {
    e.preventDefault()
    checkAll(true)
    eventListener();
  })

  div.appendChild(button)

  spacer = document.createElement("a")
  spacer.innerText = " "
  div.appendChild(spacer)

  button = document.createElement("button")
  button.classList.add("btn", "form_btn", "form_select");
  button.innerText = "Unselect All"

  button.addEventListener("click", function (e) {
    e.preventDefault()
    checkAll(false)
    eventListener();
  })

  div.appendChild(button)
}

// A function to create a tick-box menu.
const createDropDown = (divId, optionsArr, eventListener) => {
  const div = document.createElement("div");
  div.classList.add("form_control");
  div.id = divId;

  createSelectAll(div, eventListener);

  let L = optionsArr.length;
  for (let i = 0; i < L; i++) {
    let currentTopic = optionsArr[i];

    let label = document.createElement("label");
    label.for = currentTopic.replace(/\s/g, "");

    let formBox = document.createElement("div");
    formBox.classList.add("form_select");
    label.appendChild(formBox);
    let span = document.createElement("span");
    span.innerText = currentTopic;

    let input = document.createElement("input");
    input.type = "checkbox";
    input.id = currentTopic.replace(/\s/g, "");
    input.name = currentTopic.replace(/\s/g, "");
    input.value = currentTopic;
    input.classList.add("checkbox");
    formBox.appendChild(input);
    formBox.appendChild(span);

    div.appendChild(label);
  }

  div.addEventListener("input", eventListener);
  return div;
};

// Populate input checkbox with all the subtopics
const populateTopic = async () => {
  let topics = await filterTopic();
  const container = document.querySelector(".container");

  let form = document.createElement("form");
  form.classList.add("form");

  let topicDiv = createDropDown("select_topic_div", topics, selectNumber);
  form.appendChild(topicDiv);

  container.appendChild(form);
};

// A function to add a number input
const selectNumber = () => {
  clearNum();
  const form = document.querySelector(".form");

  const div = document.createElement("div");
  div.classList.add("form_control");
  div.id = "select_qs";

  const label = document.createElement("label");
  label.htmlFor = "numberOfQs";
  label.innerText = "How many questions? (4-10)";
  div.appendChild(label);

  const multiCol = document.createElement("div");
  multiCol.id = "two_col";
  div.appendChild(multiCol);

  const input = document.createElement("input");
  input.type = "number";
  input.id = "numberOfQs";
  input.classList.add("form_select");
  input.name = "numberOfQs";
  input.min = 4;
  input.max = 10;
  input.addEventListener("input", generateBtn);
  multiCol.appendChild(input);

  form.appendChild(div);
};

// A function to create the generate btn
const generateBtn = () => {
  clearBtns();

  const form = document.querySelector(".form");
  const multiCol = document.querySelector("#two_col");

  const btn = document.createElement("button");
  btn.classList.add("btn", "form_btn", "form_select");
  btn.innerText = "Generate!";
  btn.id = "generate_btn_div";
  multiCol.appendChild(btn);

  // Preventing the default behavior of the form and handling the submit.
  form.onsubmit = function (e) {
    e.preventDefault();
    let target = e.target;
    handleSubmit(target);
  };
};

// What happens when the generate btn is pressed.
const handleSubmit = async (target) => {
  let checkboxes = target.querySelectorAll(".checkbox");
  let checked = [];
  checkboxes.forEach((box) => {
    if (box.checked == true) {
      checked.push(box.value);
    }
  });

  // getting the number of questions
  let numberOfQuestions = target.querySelector("#numberOfQs").value;
  // getting an object containing matching questions
  let questions = await getQuestions(checked);
  // generating an array of random locations for Qs
  let qsLocation = randomLocs(questions.length, numberOfQuestions);
  // Creating an array of the question/answer objects for each
  let questionsToAsk = [];
  for (let i = 0; i < qsLocation.length; i++) {
    let index = qsLocation[i];
    questionsToAsk.push(questions[index]);
  }
  // Adding the questions to the DOM
  createQuestions(questionsToAsk);

  // Auto-scrolling to questions when generate pressed
  window.location.hash = "";
  window.location.hash = "#question_anchor";
};

// A function to make the questions card
const createQuestions = (currentArr) => {
  clearQuestions();
  const container = document.querySelector(".container");

  const wrapper = document.createElement("div");
  wrapper.classList.add("content_wrap");
  container.appendChild(wrapper);

  const currentWrap = document.createElement("div");
  currentWrap.classList.add("question_wrap");
  currentWrap.id = "question_anchor";
  wrapper.appendChild(currentWrap);

  let currentTitle = document.createElement("h2");
  currentTitle.classList.add("subtitle");
  currentTitle.innerText = "Questions:";
  currentWrap.appendChild(currentTitle);

  createQuestionCard(currentArr, currentWrap);
};

const createQuestionCard = (arr, wrapper) => {
  for (let i = 0; i < arr.length; i++) {
    let questionObject = arr[i];
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question_container");

    let question = document.createElement("p");
    question.innerText = questionObject["question"];
    questionDiv.appendChild(question);

    let answer = document.createElement("p");
    answer.innerText = questionObject["answer"];
    answer.classList.add("hidden");
    questionDiv.appendChild(answer);

    wrapper.appendChild(questionDiv);
  }
};

// Generating a random int (max not included)
const randomLocs = (max, num) => {
  let i = 0;
  let locs = [];
  while (i < num) {
    let randomNum = Math.floor(Math.random() * max);
    if (locs.indexOf(randomNum) === -1) {
      locs.push(randomNum);
      i++;
    }
  }
  return locs;
};

// Get question numbers.
const getQuestions = async (subtopicArr) => {
  // loading data
  let data = await loadData();
  const L = data.length;
  let questions = [];
  // Creating an array of q/a objects that match the subtopics
  subtopicArr.forEach((subtopic) => {
    for (let i = 0; i < L; i++) {
      let question = data[i]["Question"];
      let answer = data[i]["Answer"];
      if (data[i]["Sub-topic"] === subtopic) {
        questions.push({ question, answer });
      }
    }
  });

  return questions;
};

// Clear questions
const clearQuestions = () => {
  let questionWrapper = document.querySelectorAll(".content_wrap");
  for (let i = 0; i < questionWrapper.length; i++) {
    currentWrapper = questionWrapper[i];
    currentWrapper.remove();
  }
};

// Clear buttons
const clearBtns = () => {
  clearQuestions();
  let generateBtns = document.querySelectorAll("#generate_btn_div");
  for (let i = 0; i < generateBtns.length; i++) {
    currentBtn = generateBtns[i];
    currentBtn.remove();
  }
};

// Clear number option
const clearNum = () => {
  clearBtns();
  let numberInputs = document.querySelectorAll("#select_qs");
  for (let i = 0; i < numberInputs.length; i++) {
    currentNumInput = numberInputs[i];
    currentNumInput.remove();
  }
};

// Start of with the choose topic
populateTopic();
