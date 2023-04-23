import mongoose from 'mongoose/index.js';
import CollegeData from '../models/collegesData.js';

export const getColleges  = async (req, res)=>{
    try {
        const collegesData = await CollegeData.find();

        res.status(200).json(collegesData);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const createCollege = async (req,res)=>{

    const college = req.body;

    const newCollege = new CollegeData(college);

    try {
        await newCollege.save();

        res.status(201).json("New College Added Successfully");
    } catch (error) {
        res.status(409).json({message: error.message});
    }
}



export const updateCollege = async (req,res)=>{
   
    const college = req.body;
   
    try {
        if(!mongoose.Types.ObjectId.isValid(college.id))return res.status(404).send('No id with that college');
        
        const updateCollege = await CollegeData.findByIdAndUpdate(college.id,{ ...college , _id: college.id }, { new : true });
        
        res.status(200).json("College Updated Successfully");

    } catch (error) {
        
        res.status(500).json({message: error.message});
    
    }


}



export const deleteCollege = async (req,res)=>{
    
    const { id: _id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(_id))return res.status(404).send('No id with that college');
    
    await CollegeData.findByIdAndRemove(_id);

    res.json({message: 'College deleted successfully'})
}

export const getSingleCollege = async (req, res) => {

    const { id: _id } = req.params;
    
    try {
        const college = await CollegeData.findOne({ _id });

        if(!college)return res.status(404).send('No College found');
        
        res.status(200).json(college);
    
    } catch (error) {
    
        res.status(409).json({message: error.message});
    
    }
}
