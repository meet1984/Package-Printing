const Template = require('./template.model');

exports.getTemplates = async (req, res, next) => {
  try {
    const { status, productType } = req.query;
    const where = {};
    
    // If not admin, force status to published
    if (!req.user || req.user.role !== 'admin') {
      where.status = 'published';
    } else if (status) {
      where.status = status;
    }
    
    if (productType) {
      where.productType = productType;
    }

    const templates = await Template.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

exports.getTemplateById = async (req, res, next) => {
  try {
    const template = await Template.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // If not admin and not published, hide it
    if ((!req.user || req.user.role !== 'admin') && template.status !== 'published') {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    next(error);
  }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const { name, productType, baseImageUrl, thumbnailUrl, printArea, constraints, shadingMapUrl, status, faces } = req.body;
    
    const firstFace = (faces && faces.length > 0) ? faces[0] : {};
    
    const template = await Template.create({
      name,
      productType,
      baseImageUrl: baseImageUrl || firstFace.baseImageUrl || '',
      thumbnailUrl,
      printArea: printArea || firstFace.printArea || null,
      constraints: constraints || firstFace.constraints || null,
      shadingMapUrl: shadingMapUrl || firstFace.shadingMapUrl || null,
      status: status || 'draft',
      faces: faces || []
    });
    
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const template = await Template.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    const { name, productType, baseImageUrl, thumbnailUrl, printArea, constraints, shadingMapUrl, status, faces } = req.body;
    
    const firstFace = (faces && faces.length > 0) ? faces[0] : {};
    
    await template.update({
      name: name !== undefined ? name : template.name,
      productType: productType !== undefined ? productType : template.productType,
      baseImageUrl: baseImageUrl !== undefined ? baseImageUrl : (firstFace.baseImageUrl || template.baseImageUrl),
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : template.thumbnailUrl,
      printArea: printArea !== undefined ? printArea : (firstFace.printArea || template.printArea),
      constraints: constraints !== undefined ? constraints : (firstFace.constraints || template.constraints),
      shadingMapUrl: shadingMapUrl !== undefined ? shadingMapUrl : (firstFace.shadingMapUrl || template.shadingMapUrl),
      status: status !== undefined ? status : template.status,
      faces: faces !== undefined ? faces : template.faces
    });
    
    res.json(template);
  } catch (error) {
    next(error);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    await template.destroy();
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    next(error);
  }
};
