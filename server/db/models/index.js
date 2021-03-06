const User = require('./user')
const Party = require('./party')
const Guest = require('./guest')
const Item = require('./item')
const Category = require('./category')
const Image = require('./image')
const Reminder = require('./reminder')

Party.belongsTo(User)
User.hasMany(Party)

Image.belongsTo(Party)
Party.hasMany(Image)
Image.belongsTo(Guest)
Guest.hasMany(Image)

Guest.belongsTo(Party)
Party.hasMany(Guest)

Guest.belongsTo(User)

Item.belongsTo(Party)
Item.belongsTo(Guest)
Guest.hasMany(Item)
Party.hasMany(Item)

Item.belongsTo(Category)
Category.hasMany(Item)

Reminder.belongsTo(Party)

/**
 * If we had any associations to make, this would be a great place to put them!
 * ex. if we had another model called BlogPost, we might say:
 *
 *    BlogPost.belongsTo(User)
 */

/**
 * We'll export all of our models here, so that any time a module needs a model,
 * we can just require it from 'db/models'
 * for example, we can say: const {User} = require('../db/models')
 * instead of: const User = require('../db/models/user')
 */
module.exports = {
  User,
  Party,
  Guest,
  Item,
  Category,
  Image,
  Reminder
}
