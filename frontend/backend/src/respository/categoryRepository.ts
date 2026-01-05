import { ICategoryResponse } from "../dtos/CategoryResponse";
import { ICategoryRepository } from "../interface/category/!CategoryRepository";
import { Messages } from "../messages/messages";
import Category, { ICategory } from "../model/categoryModel";
import baseRepository from "./baseRespository";





class categoryRepository extends baseRepository<ICategory> implements ICategoryRepository {
    constructor() {
        super(Category)
    }

    async deleteCategory(id: string): Promise<string | null> {
        try {
            const deleting = await Category.findOneAndDelete({ _id: id })
            if (deleting) {
                return Messages.CategoryDeleted;
            }
            return Messages.CategoryNotDeleted;
        } catch (error) {
            return error as string
        }
    }

    async searchCategory(name: string): Promise<string | ICategoryResponse[] | null> {
        try {
            const response = await Category.find({
                name: { $regex: `^${name}`, $options: 'i' }
            }).lean<ICategoryResponse[]>();
            return response;
        } catch (error) {
            return error as string;
        }
    }

    async findCategoryByName(name: string): Promise<string> {
        try {
            const lowerName = name.toLowerCase()
            const allCategories = await Category.find();
            const foundCategory = allCategories.find(
                (category) => category.name.toLowerCase() == lowerName
            );
            if (foundCategory) {
                return Messages.CategoryAlreadyExist;
            } else {
                return Messages.CategoryNotExist;
            }
        } catch (error) {
            return error as string
        }
    }

    async addCategory(name: string, isActive: boolean, photo: string | undefined): Promise<string> {
        try {
            const addingCategory = new Category({
                name: name,
                isActive: isActive,
                image: photo
            })
            await addingCategory.save()
            return Messages.Added
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getAllCategory(skip: number, limit: number): Promise<{ getCategories: ICategoryResponse[], totalCount: number } | string> {
        try {
            const getCategories = await Category.find().sort({ updatedAt: -1 }).skip(skip).limit(limit);
            const totalCount = await Category.countDocuments();
            return { getCategories, totalCount }
        } catch (error) {
            return error as string
        }
    }

    async getCategory(id: string): Promise<ICategoryResponse | string> {
        try {
            const getCategory = await Category.findOne({ _id: id });
            if (!getCategory) {
                return Messages.CategoryNotFound
            }
            return getCategory
        } catch (error) {
            return error as string
        }
    }

    async updateCategory(id: string, name: string, isActive: boolean): Promise<string> {
        try {
            const updatingCategory = await Category.findOneAndUpdate(
                { _id: id },
                { $set: { name: name, isActive: isActive } },
                { new: true }
            )

            if (!updatingCategory) {
                return Messages.CategoryNotUpdated;
            }
            return Messages.CategoryUpdated
        } catch (error) {
            return error as string
        }
    }
}


export default categoryRepository