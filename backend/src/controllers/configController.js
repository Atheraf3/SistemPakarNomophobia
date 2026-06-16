const CfOption = require('../models/CfOption');
const TingkatPenyakit = require('../models/TingkatPenyakit');

//Get all config
exports.getSystemConfig = async (req, res) => {
    try {
        const cfOptions = await CfOption.find().sort({ value: -1 });
        const levels = await TingkatPenyakit.find().sort({ batas_min: 1 });

        res.status(200).json({
            success: true,
            data: {
                cfOptions,
                levels
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};