import mongoose from "mongoose";

const collegeSchema = mongoose.Schema({
    tag : 'String',
    name: 'String',
    subName: 'String',
    description: 'String',
    detail: 'String',
    offeringDegrees: ['String'],
    selectedFile: 'String',
    link1: 'String',
    link2: 'String',
    createdAt:{
        type: Date,
        default: new Date()
    },
});

const CollegeData = mongoose.model('CollegeData',collegeSchema);

export default CollegeData;