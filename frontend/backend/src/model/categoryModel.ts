import mongoose,{Document,Schema} from 'mongoose'

export interface ICategory extends Document{
    name:string;
    image:string;
    isActive:boolean;
}

const categorySchema:Schema = new Schema(
    {
        name:{
            type:String,
            required:true
        },
        image:{
            type:String,
            required:true
        },
        isActive:{
            type:Boolean,
            required:true
        }
    },
    {timestamps:true}
)

const Category = mongoose.model<ICategory>('Category',categorySchema)

export default Category