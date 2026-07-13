const TeamMember = require('./teamMember.model');
const StatCounter = require('./statCounter.model');
const ValueProp = require('./valueProp.model');
const ProcessPillar = require('./processPillar.model');
const PartnerBrand = require('./partnerBrand.model');
const PageContent = require('../content/pageContent.model');

// ─── Public aggregate endpoint ───────────────────────────
exports.getAboutPageData = async (req, res, next) => {
  try {
    const [teamMembers, statCounters, valueProps, processPillars, partnerBrands, heroContent, missionContent, ctaContent] = await Promise.all([
      TeamMember.findAll({ where: { is_active: true }, order: [['sort_order', 'ASC']] }),
      StatCounter.findAll({ where: { is_active: true }, order: [['sort_order', 'ASC']] }),
      ValueProp.findAll({ order: [['sort_order', 'ASC']] }),
      ProcessPillar.findAll({ order: [['sort_order', 'ASC']] }),
      PartnerBrand.findAll({ where: { is_active: true }, order: [['sort_order', 'ASC']] }),
      PageContent.findOne({ where: { page_key: 'about_hero' } }),
      PageContent.findOne({ where: { page_key: 'about_mission' } }),
      PageContent.findOne({ where: { page_key: 'about_cta' } }),
    ]);

    res.json({
      teamMembers,
      statCounters,
      valueProps,
      processPillars,
      partnerBrands,
      heroContent: heroContent?.content || null,
      missionContent: missionContent?.content || null,
      ctaContent: ctaContent?.content || null,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Generic CRUD helper ─────────────────────────────────
function crudFor(Model) {
  return {
    getAll: async (req, res, next) => {
      try {
        const items = await Model.findAll({ order: [['sort_order', 'ASC']] });
        res.json(items);
      } catch (error) { next(error); }
    },
    create: async (req, res, next) => {
      try {
        const item = await Model.create(req.body);
        res.status(201).json(item);
      } catch (error) { next(error); }
    },
    update: async (req, res, next) => {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.update(req.body);
        res.json(item);
      } catch (error) { next(error); }
    },
    delete: async (req, res, next) => {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.destroy();
        res.json({ message: 'Deleted' });
      } catch (error) { next(error); }
    }
  };
}

exports.teamMembers = crudFor(TeamMember);
exports.statCounters = crudFor(StatCounter);
exports.valueProps = crudFor(ValueProp);
exports.processPillars = crudFor(ProcessPillar);
exports.partnerBrands = crudFor(PartnerBrand);
