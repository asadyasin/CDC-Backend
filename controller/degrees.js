import mongoose from 'mongoose/index.js';
import DegreesData from '../models/degreesData.js';


export const getDegrees  = async (req, res)=>{
    try {
        const degreesData = await DegreesData.find();

        res.status(200).json(degreesData);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const createDegree = async (req,res)=>{
    const degree = req.body;

    const newDegree = new DegreesData(degree);

    try {
        await newDegree.save();

        res.status(201).json("New Degree Added successfully");
    } catch (error) {
        res.status(409).json({message: error.message});
    }
}

export const updateDegree = async (req,res)=>{
    
    const degree = req.body;
    
    if(!mongoose.Types.ObjectId.isValid(degree.id))return res.status(404).send('No id with that degree');

    const updateDegree = await DegreesData.findByIdAndUpdate(degree.id,{ ...degree , _id: degree.id }, { new : true });

    res.status(201).json("Degree Updated successfully");

}

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