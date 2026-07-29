const HeroBanner = require('./heroBanner.model');

exports.getAllBanners = async (req, res, next) => {
  try {
    const banners = await HeroBanner.findAll({
      order: [['sort_order', 'ASC']]
    });
    res.json(banners);
  } catch (error) {
    next(error);
  }
};

exports.createBanner = async (req, res, next) => {
  try {
    const banner = await HeroBanner.create(req.body);
    res.status(201).json(banner);
  } catch (error) {
    next(error);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await HeroBanner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Hero banner not found' });
    }
    await banner.update(req.body);
    res.json(banner);
  } catch (error) {
    next(error);
  }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await HeroBanner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Hero banner not found' });
    }
    await banner.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
