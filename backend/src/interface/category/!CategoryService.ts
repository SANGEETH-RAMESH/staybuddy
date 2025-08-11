import { ICategoryResponse } from "../../dtos/CategoryResponse";



export interface ICategoryService {
    addCategory(name: string, isActive: boolean, photo: string | undefined): Promise<string>,
    getAllCategory(skip: number, limit: number): Promise<{ getCategories: ICategoryResponse[], totalCount: number } | string>,
    getCategory(id: string): Promise<ICategoryResponse | string>,
    updateCategory(id: string, name: string, isActive: boolean): Promise<string>,
    deleteCategory(id: string): Promise<string | null>,
    searchCategory(name: string): Promise<ICategoryResponse[] | string | null>,
}