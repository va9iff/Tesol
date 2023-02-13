let unique = ((a = 0) => () => a++)()
const $ = new Proxy({}, { get: (_, c) => document.querySelector(`.${c}`) })
const status = $.status
const el = str =>{
	const strs = str.split('.')
	let el = document.createElement(strs.shift())
	for (let cls of strs) el.classList.add(cls)
	return el
}

let main = $.main
let current = 0
let questions = []
let lastQuestion = document.createElement('div')

let quizesData = (await (await fetch("./quizes.txt")).text()).split('\n').map(couple => couple.split('@'))

let quizesEl = $.quizes
for (let [quizName, quizUrl] of quizesData){
	let quiz = document.createElement("div")
	quiz.innerText = quizName
	quiz.className = ('quiz')
	quizesEl.appendChild(quiz)
	quiz.onclick = e=>{
		// questionAdress = `./quizes/${quizName}.txt`
		startFreshQuestions(quizUrl)
	}
	document.body.classList.add("running")
}

// let questionAdress = "./questions.txt"

async function getQuestionsText(url){
	console.log(`fetching for quiz: ${url}`)
	let res = await fetch(url)
	let text = await res.text()
	return text
}

function hideui() {
	document.body.classList.add('hideui')
	document.body.classList.remove("running")

}

async function startFreshQuestions(url){
	document.body.classList.remove('hideui')
	document.body.classList.add('running')
	main.innerHTML = ''
	current = 0
	questions = []



	questions = await getQuestions(url)

	lastQuestion = createQuestion(questions[0])
	main.appendChild(lastQuestion)
	lastQuestion.classList.add('initial')
	lastQuestion.addEventListener("click",e=>lastQuestion.classList.remove('initial'))
	gotoNum.max = +questions.length	

}

async function getQuestions(url) {
	status.classList.add("fetching")
	status.innerText = "suallar alınır"
	let questionsText = await getQuestionsText(url)
	status.classList.add("fetchingDone")

	let questionsRaw = questionsText.split(/(?=#)/)
	let questions = questionsRaw.map(questionRaw => {
		let question = { asking: "~va9iff", answers: [], correctId: 0 }
		let components = questionRaw.split(/(?=(?:\n#)|(?:\n\+)|(?:\n-))/)
		// console.log(components)
		for (let [i, component] of components.entries()) {
			component = component.trim()/*.replace("\r\n", "<br>")*/
			component = component + ''
			if (component[0] == "#") {
				question.asking = component.substr(1).trim()
			} else if (component[0] == "-") {
				question.answers.push(component.substr(1).trim())
			} else if (component[0] == "+") {
				question.answers.push(component.substr(1).trim())
				question.correct = question.answers.length - 1
			}
		}
		return question
	})
	return questions
}


function goTo(num, direction = null /*true for next, flase for prev*/) {
	console.log(num)
	// console.log(num, current)
	direction ??= num > current
	console.log(num)
	num = +num
	let question = questions[num]
	question.num = num
	let q = createQuestion(question)

	q.classList.add(direction ? "fromRight" : "fromLeft")

	main.appendChild(q)
		setTimeout(() => lastQuestion.classList.remove(direction ? "fromRight" : "fromLeft"), 40)
		lastQuestion.classList.add(direction ? "fadeLeft" : "fadeRight")
	lastQuestion.removeAfter(300)
	lastQuestion = q
	current = num
	norm()
}

// setTimeout(()=>goTo(9),500)

function createQuestion(question) {
	let q = el("div.question")
	q.setAttribute("s", unique())
	console.log(question)
	question.num ??= current
	q.innerHTML = `
		<div class="asking">
			<i>${+question.num+1}.</i> ${question.asking}
		</div>
		<div class="answers"></div>
	`
	// q.querySelector('i').onclick = e=> {
	// 	e.target.after(createGoToDial(question.num))
	// }
	question.answerElements = []
	for (const [i, answer] of question.answers.entries()) {
		let answerElement = el(`div.answer`)
		question.answerElements.push(answerElement)
		if (question.selected == i) {
			answerElement.classList.add('selected')
			if (question.correct == i )
				answerElement.classList.add('correct')
		}
		answerElement.innerText = answer
		answerElement.onclick = e => {
			question.answerElements.forEach(ans=>ans.classList.remove('selected'))
			if (question.correct == i) answerElement.classList.add('correct')
			if (question.selected == i ) {
				answerElement.classList.remove('selected')
				delete question.selected
			} else {
				answerElement.classList.add('selected')
				question.selected = i

			}
		}
		q.querySelector(".answers").appendChild(answerElement)
		// console.log(question)
	}
	// console.log(q)
	q.removeAfter = t =>
		setTimeout(() => {
			// console.log(q)
			q.remove()
		}, t)
	return q
}



function next() {
	if (current >= questions.length - 1) {
		current = questions.length-1
		return
	} else {
		current ++
		goTo(current, true)
	}
}

function prev() {
	if (current <=  0) {
		current = 0
	} else {
		current--
		goTo(current, false)
	}
}

	
$.next.onclick = e => next()
$.prev.onclick = e => prev()


let norms = [$.fullScreen, $.eye, $.pull, $.goto]
let hides = [$.gotoNum]
function norm() {
	norms.forEach(a=>a.classList.remove('hidden'))
	hides.forEach(hide=>{
		hide.classList.add('hidden')
		hide.visible = false
	})
}
function spec(...specs) {
	[...norms, ...hides].forEach(a=>a.classList.add('hidden'))
	;[...specs].forEach(spec=>{
		spec.classList.remove('hidden')
		spec.visible = true
	})
}


$.eye.onclick = e=>{
	e.target.classList.toggle('highlight')
	main.classList.toggle('eyeOpen')
}

$.pull.onclick = e=>{
	main.classList.toggle('pulled')
	// e.target.classList.toggle('pulled')
}

$.fullScreen.onclick = e => document.body.requestFullscreen()

const gotoNum = $.gotoNum
$.goto.onclick = e=> {
	if (!gotoNum.visible) {
		spec($.goto, $.gotoNum)

		return null
	}
	goTo(+gotoNum.value-1)
	gotoNum.classList.add('hidden')
	norm()
}
gotoNum.onchange = e => {
	if (gotoNum.value > questions.length) gotoNum.value = questions.length
	if (gotoNum.value < 1 ) gotoNum.value = 1
	console.log(gotoNum)
	$.goto.onclick()
}



let moreOpened = false

$.more.onclick = e => {
	moreOpened = true
	$.topIcons.classList.add('moreOpened')
	$.more.classList.add('opened')
}
$.opt1.onclick = e => {
	console.log(moreOpened)
	if (moreOpened){
		e.stopPropagation()
		$.topIcons.classList.remove('moreOpened')
		$.more.classList.remove('opened')
	}
	moreOpened = false
	norm()
}



// swipes
let touchstartX = 0
let touchstartY = 0
let touchendX = 0
// let justSwiped = false
	
	
	

let fulledFirst = false
const firstFuller = e=>{
	document.removeEventListener("touchend", firstFuller)
	document.body.requestFullscreen().then(()=>{}).catch((err)=>{})
}
// document.addEventListener("touchend", firstFuller)

function startSwipe(e) {
	// justSwiped = false	
	touchstartX = e.changedTouches[0].screenX
	touchstartY = e.changedTouches[0].screenY
}

document.addEventListener('touchstart', e => {
	startSwipe(e)
})

let pullSwipe = false
window.pullPrevState =
// let pullPrevState = 
1
window.pullCurrentState = 1
let pullCurrentState = 1
let pullChange = false

let pullDiff = 300
function checkPull(e) {
	let y = e.changedTouches[0].screenY
	let x = e.changedTouches[0].screenX
	let diffX = touchstartX - x
	let diffY = touchstartY - y 
	// $.main.innerText = diffY
	if (Math.abs(diffX) > pullDiff * 1.2){}
	else if (diffY < -pullDiff) {
		main.classList.add('pulled')
		pullCurrentState = 1
		if (pullPrevState == 1) pullChange = false
			else pullChange = true
		pullSwipe = true
	}
	else if (diffY > pullDiff) {
		pullCurrentState = 0
		if (pullPrevState == 0) pullChange = false
			else pullChange = true
		pullSwipe = true
		main.classList.remove('pulled')
	}
}
document.addEventListener('touchmove', e => {
	checkPull(e)
}, {passive: true}) 

const swipeMinDiff = 70
function checkSwipe(e) {
	touchendX = e.changedTouches[0].screenX	
	let diffX = touchendX - touchstartX

	if (pullSwipe && pullChange) return
	if (Math.abs(diffX) < swipeMinDiff) return
	
	if (touchendX < touchstartX) next()
	if (touchendX > touchstartX) prev()
}

document.addEventListener('touchend', e => {
	checkSwipe(e)
	pullPrevState = pullCurrentState
	pullSwipe = false
})

$.more.addEventListener("touchend", e=>{
	e.stopPropagation()
})

$.quizesIcon.onclick = e => hideui()

// norm()
status.classList.add("hideStatus")
setTimeout(()=>status.remove(),300)

// startFreshQuestions()
hideui()

// $.quiz.click()