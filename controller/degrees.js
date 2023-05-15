import mongoose from 'mongoose/index.js';
import DegreesData from '../models/degreesData.js';


export const getDegrees  = async (req, res)=>{
    try {
        const degreesData = await DegreesData.find();

        res.status(200).json(degreesData);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const createDegree = async (req, res) => {
    try {
        const degree = req.body;
        const newDegree = new DegreesData(degree);
        await newDegree.save();
        res.status(201).json("New degree added successfully");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDegree = async (req, res) => {
    try {
        const { id, ...updatedDegree } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send('No degree found with that ID');
        }

        const updated = await DegreesData.findByIdAndUpdate(id, updatedDegree, { new: true });

        if (!updated) {
            return res.status(404).send('No degree found with that ID');
        }

        res.status(201).json("Degree updated successfully");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDegree = async (req,res)=>{
    const { id: _id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(_id))return res.status(404).send('No id with that degree');
    
    await DegreesData.findByIdAndRemove(_id);

    res.json({message: 'degree deleted successfully'})
}

export const getSingleDegree = async (req, res) => {
    
    const { degreename : name} = req.params;
    
    try {
        const degree = await DegreesData.findOne({ name });

        if(!degree)return res.status(404).send('No Degree found');
        
        res.status(200).json(degree);
    
    } catch (error) {
    
        res.status(409).json({message: error.message});
    
    }
}