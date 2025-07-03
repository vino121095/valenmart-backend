const VendorSubmission = require('../model/vendorSubmission');

// Create Vendor Submission
const createVendorSubmission = async (req, res) => {
    try {
        const {
            vendor_id,
            submission_date,
            status,
            notes,
            valid_until
        } = req.body;

        const newSubmission = await VendorSubmission.create({
            vendor_id,
            submission_date,
            status,
            notes,
            valid_until
        });

        res.status(201).json({
            message: 'Vendor submission created successfully',
            data: newSubmission
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get All Vendor Submissions
const getAllVendorSubmissions = async (req, res) => {
    try {
        const submissions = await VendorSubmission.findAll();
        res.status(200).json({ data: submissions });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get Vendor Submission by ID
const getVendorSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await VendorSubmission.findByPk(id);
        if (!submission) {
            return res.status(404).json({ message: 'Vendor submission not found' });
        }
        res.status(200).json({ data: submission });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update Vendor Submission
const updateVendorSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            vendor_id,
            submission_date,
            status,
            notes,
            valid_until
        } = req.body;

        const submission = await VendorSubmission.findByPk(id);
        if (!submission) {
            return res.status(404).json({ message: 'Vendor submission not found' });
        }

        submission.vendor_id = vendor_id !== undefined ? vendor_id : submission.vendor_id;
        submission.submission_date = submission_date !== undefined ? submission_date : submission.submission_date;
        submission.status = status !== undefined ? status : submission.status;
        submission.notes = notes !== undefined ? notes : submission.notes;
        submission.valid_until = valid_until !== undefined ? valid_until : submission.valid_until;

        await submission.save();

        res.status(200).json({
            message: 'Vendor submission updated successfully',
            data: submission
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete Vendor Submission
const deleteVendorSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await VendorSubmission.findByPk(id);
        if (!submission) {
            return res.status(404).json({ message: 'Vendor submission not found' });
        }
        await submission.destroy();
        res.status(200).json({ message: 'Vendor submission deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createVendorSubmission,
    getAllVendorSubmissions,
    getVendorSubmissionById,
    updateVendorSubmission,
    deleteVendorSubmission
};
