import axiosInstance from "../utils/axiosInstance";
import React, { useState, useEffect } from 'react';

const Categories = () => {
    const [categories, setCategories] = useState([]);

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/categorie/');
            setCategories(response.data);
        }
        catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const deleteCategorie = async (id) => {
        try {
            await axiosInstance.delete(`/categorie/del/${id}`, { withCredentials: true }); // Fixed endpoint
            fetchCategories(); // Refresh categories after deletion
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };
    

    const addCategorie = async (e) => {
        e.preventDefault();
        const newCategory = e.target.elements.categoryName.value;
        try {
            await axiosInstance.post('/categorie/add', { name: newCategory });
            fetchCategories();
        } catch (error) {
            console.error('Failed to add category:', error);
        }
    }




    return (
        <div>
            <h2>Categories</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((categorie) => (
                        <tr key={categorie._id}>
                            <td>{categorie.name}</td>
                            <td>
                                <button onClick={() => deleteCategorie(categorie._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <form onSubmit={(e) => {
                addCategorie(e);
                e.target.elements.categoryName.value = ""; // Clear the input field
            }}>
                <input type="text" name="categoryName" placeholder="New Category" required />
                <button type="submit">Add Category</button>
            </form>
        </div>
    );
};

export default Categories;