const Tour = require('../models/tour');

exports.getTours = async (req, res, next) => {
  try {
    const { search, minPrice, maxPrice, duration, tags, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) query.$text = { $search: search };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (duration) query.durationDays = Number(duration);
    if (tags) query.tags = { $in: tags.split(',') };

    const tours = await Tour.find(query)
      .populate('operator', 'name email')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Tour.countDocuments(query);

    res.json({
      success: true,
      count: tours.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: tours
    });
  } catch (error) {
    next(error);
  }
};

exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id).populate('operator', 'name email');
    if (!tour) return res.status(404).json({ success: false, message: 'Tour not found' });
    res.json({ success: true, data: tour });
  } catch (error) {
    next(error);
  }
};

exports.createTour = async (req, res, next) => {
  try {
    req.body.operator = req.user.id;
    const tour = await Tour.create(req.body);
    res.status(201).json({ success: true, data: tour });
  } catch (error) {
    next(error);
  }
};

exports.updateTour = async (req, res, next) => {
  try {
    let tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ success: false, message: 'Tour not found' });
    if (tour.operator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: tour });
  } catch (error) {
    next(error);
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ success: false, message: 'Tour not found' });
    if (tour.operator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await tour.deleteOne();
    res.json({ success: true, message: 'Tour deleted' });
  } catch (error) {
    next(error);
  }
};
