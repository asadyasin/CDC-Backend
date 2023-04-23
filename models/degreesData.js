import mongoose from "mongoose";

const degreeSchema = mongoose.Schema({
    tag : 'String',
    name: 'String',
    degType: 'String',
    subName: 'String',
    description: 'String',
    selectedFile: 'String',
    subjects: 
    [
        ['String']
     ],
    jobs: ['String'],
    createdAt:{
        type: Date,
        default: new Date()
    },
});

const DegreeData = mongoose.model('DegreeData',degreeSchema);

export default DegreeData;
