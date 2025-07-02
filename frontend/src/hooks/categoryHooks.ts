import createApiClient from "../services/apiClient";
const AdminApiClient = createApiClient('admin');
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;





export const addCategory = (formData: FormData) => AdminApiClient.post(`${apiUrl}/admin/addCategory`, formData,
    {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });


export const deleteCategory = (categoryId: string) => AdminApiClient.delete(`${apiUrl}/admin/category`, {
    data: { categoryId },
})

export const getAllCategory = (skip: number, limit: number) => AdminApiClient.get(`${apiUrl}/admin/getAllCategory`, {
    params: { skip, limit }
})

export const searchCategory = (search:string) => AdminApiClient.get(`${apiUrl}/admin/search?name=${search}`)

export const getCategory = (id:string) => AdminApiClient.get(`${apiUrl}/admin/getCategory/${id}`)

export const updateCategory = (id:string,name:string,isActive:boolean) => AdminApiClient.put(
                `http://localhost:4000/admin/updateCategory/${id}`,
                {
                    name,
                    isActive
                }
            );