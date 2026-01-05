import createApiClient from "../apis/apiClient";
const AdminApiClient = createApiClient('admin');
const apiUrl = import.meta.env.VITE_BACKEND_URL;





export const addCategory = (formData: FormData) => AdminApiClient.post(`${apiUrl}/category/categories`, formData,
    {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });


export const deleteCategory = (categoryId: string) => AdminApiClient.delete(`${apiUrl}/category/categories/${categoryId}`)

export const getAllCategory = (skip: number, limit: number) => AdminApiClient.get(`${apiUrl}/category/categories`, {
    params: { skip, limit }
})

export const searchCategory = (search:string) => AdminApiClient.get(`${apiUrl}/category/categories/search?name=${search}`)

export const getCategory = (id:string) => AdminApiClient.get(`${apiUrl}/category/categories/${id}`)

export const updateCategory = (id:string,name:string,isActive:boolean) => AdminApiClient.put(
                `${apiUrl}/category/categories/${id}`,
                {
                    name,
                    isActive
                }
            );