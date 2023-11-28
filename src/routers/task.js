const express = require('express')
const Tasks = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']

  const isValidOp = updates.every((update) => {
    return allowedUpdates.includes(update)
  })
  if (!isValidOp) {
    return res.status(400).send({ error: 'invalid operation' })
  }
  try {
    const task = await Tasks.findOne({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      return res.status(404).send('task couldnt found')
    }
    updates.forEach((update) => (task[update] = req.body[update]))

    task.save()
    res.send(task)
  } catch (error) {
    res.status(500).send(error)
  }
})
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Tasks.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      res.status(404).send()
    }
    res.send(task)
  } catch (error) {
    res.status(500).send(error)
  }
})
router.get('/tasks', auth, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }
  if (req.query.sortBy) {
    const part = req.query.sortBy.split(':')
    sort[part[0]] = part[1] === 'desc' ? -1 : 1
  }

  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    })
    const userr = req.user

    res.send(userr.tasks)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const task = await Tasks.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }
    res.status(201).send(task)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/tasks', auth, async (req, res) => {
  const task = new Tasks({
    ...req.body,
    owner: req.user._id,
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (error) {
    res.status(400).send(error)
  }
})

module.exports = router
