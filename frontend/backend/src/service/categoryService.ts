import { ICategoryResponse } from "../dtos/CategoryResponse";
import { ICategoryRepository } from "../interface/category/!CategoryRepository";
import { ICategoryService } from "../interface/category/!CategoryService";
import { Messages } from "../messages/messages";




class CategoryService implements ICategoryService {
    constructor(private _categoryRepository: ICategoryRepository) { }

    async deleteCategory(id: string): Promise<string | null> {
        try {
            const response = await this._categoryRepository.deleteCategory(id);
            return response
        } catch (error) {
            return error as string
        }
    }

    async searchCategory(name: string): Promise<ICategoryResponse[] | string | null> {
        try {
            const response = await this._categoryRepository.searchCategory(name);
            return response;
        } catch (error) {
            return error as string;
        }
    }


    async addCategory(name: string, isActive: boolean, photo: string | undefined): Promise<string> {
        try {

            const alreadyCategory = await this._categoryRepository.findCategoryByName(name);
            if (alreadyCategory == Messages.CategoryAlreadyExist) {
                return Messages.CategoryAlreadyExist;
            }
            const response = await this._categoryRepository.addCategory(name, isActive, photo)
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getAllCategory(skip: number, limit: number): Promise<{ getCategories: ICategoryResponse[], totalCount: number } | string> {
        try {
            const response = await this._categoryRepository.getAllCategory(skip, limit);
            return response
        } catch (error) {
            return error as string
        }
    }

    async getCategory(id: string): Promise<ICategoryResponse | string> {
        try {
            const response = await this._categoryRepository.getCategory(id)
            return response
        } catch (error) {
            return error as string
        }
    }

    async updateCategory(id: string, name: string, isActive: boolean): Promise<string> {
        try {
            const response = await this._categoryRepository.updateCategory(id, name, isActive);
            return response
        } catch (error) {
            return error as string
        }
    }
}


export default CategoryService