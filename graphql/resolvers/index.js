const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const { dateToString } = require('../../helpers/date');

const transformEvent = (event) => {
  return {
    ...event._doc,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator)
  }
}

const transformBooking = (booking) => {
  return {
    ...result._doc,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(result._doc.createdAt),
    updatedAt: dateToString(result._doc.updatedAt),
  }
}

const user = async (userId) => {
  try {
    const user = await User.findById(userId)
      return {
        ...user._doc, 
        createdEvents: events.bind(this, user.createdEvents)
      }
  }
  catch (err) {
    throw err;
  }
}

const events = async (eventIds) => {
  try {
    
    const events = await Event.find({ _id: { $in: eventIds }})
    console.log("this is events:");
    return events.map(event => {
      return transformEvent(event)
    })
  }
  catch (err) {
    throw err;
  }
}

const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    console.log("this is single event:", event._doc);
    return transformEvent(event)
  } catch (err) {
    throw err;
  }
}

module.exports = {
  events: async () => {
    try {
      const events = await Event.find()
        return events
          .map((event) => {
            return transformEvent(event)
        });
    }
    catch (err) {
      throw err;
    };
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find()
      return bookings.map(booking => {
        return transformBooking(booking);
      })
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (args) => {
   const event = new Event({
     title: args.eventInput.title,
     description: args.eventInput.description,
     price: +args.eventInput.price,
     date: new Date(args.eventInput.date),
     creator: '5cbe773717a7dc0ce5e57b74'
   });
   try {
    const result = await event.save()
    const createdEvent = transformEvent(result);
    const user = await User.findById('5cbe773717a7dc0ce5e57b74')
    if (!user) {
      throw new Error('User doesn\'t exist');
    }
    user.createdEvents.push(event);  // add relation(between Event and User) to User document
    await user.save();

    return createdEvent;
   } catch (err) {
      throw err;
    };
  },
  createUser: async (args) => {
    try {
      const user = await User.findOne({
        email: args.userInput.email
      })
      if (user) {
        throw new Error('User already exists.')
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
      const newUser = new User({
        email: args.userInput.email,
        password: hashedPassword
      })
      const result = await newUser.save();
      return {
        ...result._doc, 
        password: null
      }
    } catch (err) { 
      throw err;
    }
  },
  bookEvent: async (args) => {
    try {
      const fetchedEvent = await Event.findById({ _id: args.eventId });
      const booking = new Booking({
        user: '5cbe773717a7dc0ce5e57b74',
        event: fetchedEvent
      })
      const result = await booking.save();
      return transformBooking(result);
    } catch (err) {
      throw err;
    }
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
}