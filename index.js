const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', (req) => {
    let body = JSON.stringify(req.body)
    return body === '{}' ? '' : body
})

app.use(morgan(function (tokens, req, res) {
    return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req)
    ].join(' ')
  }
))

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-34-567890",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

const generateId = () => {
    let random = Math.random() * (200 - 1) + 1
    return Math.floor(random)
}

app.post('/api/persons', (req, res) => {
    const newId = generateId()

    const newName = req.body.name
    if (!newName) {
        return res.status(400).json({
            error: 'name is missing'
        })
    }

    const newNumber = req.body.number
    if (!newNumber) {
        return res.status(400).json({
            error: 'number is missing'
        })
    }

    const checkName = persons.find(p => p.name === newName)
    if (checkName) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        "name": newName,
        "number": newNumber,
        "id": newId,
    }

    persons = persons.concat(person)

    res.json(person)
})

app.get('/info', (req, res) => {
    let date = Date()
    res.send(
        `<p>Phonebook has info for ${persons.length} people</p>`
        + `<p>${date}</p>`
    )
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    let person = persons.find(p => p.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)

    res.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})