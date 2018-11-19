const {Party, User, Guest, Item} = require('../db/models')
const router = require('express').Router()

router.get('/:id', async (req, res, next) => {
  try {
    let partyId = req.params.id
    const party = await Party.findById(partyId, {
      include: [
        {model: User, attributes: ['firstName', 'lastName']},
        {
          model: Guest,
          attributes: ['id', 'status', 'email'],
          order: [['status', 'ASC']]
        },
        {
          model: Item,
          include: [{model: Guest, attributes: ['email']}],
          attributes: ['id', 'title', 'description']
        }
      ]
    })
    res.json(party)
  } catch (err) {
    next(err)
  }
})

// POST /api/parties/addParty
router.post('/', async (req, res, next) => {
  try {
    const newParty = await Party.create({
      title: req.body.info.title,
      description: req.body.info.description,
      location: req.body.info.location,
      date: req.body.info.date,
      userId: req.body.info.userId,
      imageUrl: req.body.info.imageUrl
    })

    //Creates guests using email and party id
    Promise.all(
      req.body.guestEmails.forEach(email => {
        const guest = Guest.create({email, partyId: newParty.id})
        //TODO need to send guest an email with guest token
      })
    )

    res.json(newParty)
  } catch (err) {
    next(err)
  }
})

// GET /api/parties/user/:userId
// Return an array of parties that this user is hosting
router.get('/user/:userId', async (req, res, next) => {
  try {
    const parties = await Party.findAll({where: {userId: req.params.userId}})
    res.json(parties)
  } catch (err) {
    next(err)
  }
})

router.get('/rsvp/:guestPartyToken', async (req, res, next) => {
  try {
    const {guestPartyToken} = req.params
    let guest = await Guest.findOne({where: {guestPartyToken: guestPartyToken}})
    res.json(guest.status)
  } catch (error) {
    next(error)
  }
})
router.put('/rsvp/:guestPartyToken', async (req, res, next) => {
  try {
    const {guestPartyToken} = req.params
    const {status} = req.body
    let guest = await Guest.findOne({where: {guestPartyToken: guestPartyToken}})
    if (guest) {
      await guest.update({status})
      res.json(guest.status)
    }
  } catch (error) {
    next(error)
  }
})

// GET /api/parties/user/:userId
// Return an object that will contain information
// about a current users parties.
// The object will look like this:
/*
 {
   upcoming: {} // an object of the closest upcoming event
   hosting: [...] // array of objects
   attending: [...] // array of objects
   past_events: [...] // array of objects past events
 }
*/
router.get('/user/:userId', async (req, res, next) => {
  try {
    // upcoming parties
    const user = await User.findById(req.params.userId)

    const hosting = await Party.findAll({
      where: {
        $and: [
          {userId: user.id},
          {
            date: {
              $gte: moment()
                .utc()
                .toDate()
            }
          }
        ]
      },
      order: [['date', 'ASC']]
    })

    const upcomingEventToHost = await Party.findAll({
      where: {
        $and: [
          {userId: user.id},
          {
            date: {
              $gte: moment()
                .utc()
                .toDate()
            }
          }
        ]
      },
      limit: 1,
      order: [['date', 'ASC']]
    })

    const attending = await Guest.findAll({
      where: {
        email: user.email
      },
      include: [
        {
          model: Party,
          where: {
            date: {
              $gte: moment()
                .utc()
                .toDate()
            }
          }
        }
      ]
    })

    // sort ASCENDING by the party date
    attending.sort(function(left, right) {
      return moment.utc(left.party.date).diff(moment.utc(right.party.date))
    })

    const pastHosting = await Party.findAll({
      where: {
        $and: [
          {userId: user.id},
          {
            date: {
              $lt: moment()
                .utc()
                .toDate()
            }
          }
        ]
      },
      order: [['date', 'ASC']]
    })

    const pastAttending = await Guest.findAll({
      where: {
        email: user.email
      },
      include: [
        {
          model: Party,
          where: {
            date: {
              $lt: moment()
                .utc()
                .toDate()
            }
          }
        }
      ]
    })

    const pastEvents = [...pastHosting, ...pastAttending]

    res.json({upcomingEventToHost, hosting, attending, pastEvents})
  } catch (err) {
    next(err)
  }
})

module.exports = router
