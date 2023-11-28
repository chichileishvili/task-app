const mongoose = require('mongoose')
const validator = require('validator')
const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      default: false,
      type: Boolean,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true, 
  }
)

const Tasks = mongoose.model('Tasks', taskSchema)

module.exports = Tasks
