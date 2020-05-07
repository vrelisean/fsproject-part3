const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Syntax: node mongo.db [password] [new name] [new number]')
  process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://fullstack:${password}@cluster0-vspmi.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Contact = mongoose.model('Contact', contactSchema)

if (process.argv.length === 3) {
  Contact.find({}).then(response => {
    console.log('phonebook:')
    response.forEach(contact => console.log(contact.name, contact.number))
    mongoose.connection.close()
  })
}
else {
  const contact = new Contact({
    name: process.argv[3],
    number: process.argv[4] || '',
  })

  contact.save().then(response => {
    console.log(`added ${response.name} number ${response.number} to phonebook`)
    mongoose.connection.close()
  })
}

