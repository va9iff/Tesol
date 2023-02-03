import {$} from '/query.js'
import {el} from '/el.js'
let main = $.main


let current = 0
let questions = []
let next = ()=> {
	current++
	if (current>=questions.length) current = questions.length - 1
}
let prev = ()=>{
	current--
	if (current < 0) current = 0
}

 async function getQuestions (){
	let questionsText = await (await fetch('./questions.txt')).text()
	let questionsRaw = questionsText.split(/(?=#)/)
	let questions = questionsRaw.map(questionRaw=>{
		let question = {asking:"~va9iff", answers:[], correctId: 0}
		let components = questionRaw.split(/(?=[#\+\-])/)
		for (let [i,component] of components.entries()) {
			component = component.trim().replace('\r\n', '<br>')
			if (component[0]=='#') {
				question.asking = component.substr(1)
			} else if (component[0]=='-') {
				question.answers.push(component.substr(1))
			}  else if (component[0]=='+') {
				question.answers.push(component.substr(1))
				question.correct = question.answers.length - 1
			} 
		}
		return question
	})
	return questions
}

function createQuestion(question) {
	let q = el('div.question')
	console.log(q)
	q.innerHTML = `
		<div class="asking">
			${current}/${question.asking}
		</div>
		<div class="answers">
			${question.answers.map(answer=>`<div class="answer">${answer}</div>`).join('')}
		</div>
	`
	return q
}

let lastQuestion = $.question

function removeAfter(el, t) {
	setTimeout(()=>el.remove(), t)
}
;(async ()=>{
	questions = await getQuestions()
	$.next.onclick = e=>{
		next()
		let q = createQuestion(questions[current])
		q.classList.add('fromLeft')
		lastQuestion.after(q)
		// lastQuestion.classList.add('fadeLeft')
		lastQuestion.remove()
		lastQuestion = q
	}
	$.prev.onclick = e=>{
		prev()
		let q = createQuestion(questions[current])
		lastQuestion.after(q)
		q.classList.add('fromRight')
		// lastQuestion.classList.add('fadeRight')
		lastQuestion.remove()
		lastQuestion = q
	}
})()


