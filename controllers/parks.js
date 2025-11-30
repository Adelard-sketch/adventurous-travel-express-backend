const Park = require('../models/park');

exports.getParks = async (req, res, next) => {
  try {
    const { search, country, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (country) query.country = country;
    if (minPrice || maxPrice) {
      query.entryFee = {};
      if (minPrice) query.entryFee.$gte = Number(minPrice);
      if (maxPrice) query.entryFee.$lte = Number(maxPrice);
    }

    const parks = await Park.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Park.countDocuments(query);

    res.json({
      success: true,
      count: parks.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: parks
    });
  } catch (error) {
    next(error);
  }
};

exports.getPark = async (req, res, next) => {
  try {
    const park = await Park.findById(req.params.id);
    if (!park) return res.status(404).json({ success: false, message: 'Park not found' });
    res.json({ success: true, data: park });
  } catch (error) {
    next(error);
  }
};

exports.createPark = async (req, res, next) => {
  try {
    const park = await Park.create(req.body);
    res.status(201).json({ success: true, data: park });
  } catch (error) {
    next(error);
  }
};

exports.updatePark = async (req, res, next) => {
  try {
    const park = await Park.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!park) return res.status(404).json({ success: false, message: 'Park not found' });
    res.json({ success: true, data: park });
  } catch (error) {
    next(error);
  }
};

exports.deletePark = async (req, res, next) => {
  try {
    const park = await Park.findById(req.params.id);
    if (!park) return res.status(404).json({ success: false, message: 'Park not found' });
    await park.deleteOne();
    res.json({ success: true, message: 'Park deleted' });
  } catch (error) {
    next(error);
  }
};
