require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Contact = require('./models/contacts')

const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

// MORGAN MODULE
const morgan = require('morgan')

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
// End of Morgan module

app.post('/api/contacts', (req, res, next) => {
  const newName = req.body.name
  if (!newName) {
    return res.status(400).json({ error: 'name is missing' })
  }

  const newNumber = req.body.number
  if (!newNumber) {
    return res.status(400).json({ error: 'number is missing' })
  }

  const contact = new Contact({
    name: newName,
    number: newNumber,
  })

  contact.save()
    .then(savedContact => {
      return savedContact.toJSON()
    })
    .then(savedAndFormattedContact => {
      res.json(savedAndFormattedContact)
    })
    .catch(error => {
      next(error)
    })
})

app.get('/info', (req, res) => {
  Contact.find({}).then(result => {
    res.send(
      `<p>Phonebook has info for ${result.length} people</p>`
            + `<p>${Date()}</p>`
    )
  })
})

app.get('/api/contacts', (req, res) => {
  Contact.find({}).then(contacts => {
    res.json(contacts.map(contact => contact.toJSON()))
  })
})

app.get('/api/contacts/:id', (req, res, next) => {
  Contact.findById(req.params.id)
    .then(contact => {
      if (contact)
        res.json(contact.toJSON())
      else
        res.status(404).end()
    })
    .catch(error => next(error))
})

app.delete('/api/contacts/:id', (req, res, next) => {
  Contact.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error))
})

app.put('/api/contacts/:id', (req, res, next) => {
  const body = req.body

  const contact = {
    name: body.name,
    number: body.number,
  }

  Contact.findByIdAndUpdate(req.params.id, contact, { new: true })
    .then(result => res.json(result.toJSON()))
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})