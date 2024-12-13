import axiosInstance from "../utils/axiosInstance";
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Alert } from 'react-bootstrap';
import NavBar from '../components/NavBar';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState(null);  // Initialize user as null

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get('/user/', { withCredentials: true });
                setUser(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };
        fetchUser();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/categorie/');
            setCategories(response.data);
        } catch (error) {
            setError('Failed to fetch categories.');
            console.error('Failed to fetch categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const deleteCategorie = async (id) => {
        try {
            await axiosInstance.delete(`/categorie/del/${id}`, { withCredentials: true });
            setSuccess('Category deleted successfully!');
            fetchCategories(); // Refresh categories after deletion
        } catch (error) {
            setError('Failed to delete category.');
            console.error('Failed to delete category:', error);
        }
    };

    const addCategorie = async (e) => {
        e.preventDefault();
        const newCategory = e.target.elements.categoryName.value;
        try {
            await axiosInstance.post('/categorie/add', { name: newCategory });
            setSuccess('Category added successfully!');
            fetchCategories();
        } catch (error) {
            setError('Failed to add category.');
            console.error('Failed to add category:', error);
        }
    };

    return (
        <>
            {/* Check if user is available before rendering NavBar */}
            {user ? (
                <NavBar user={user} />
            ) : (
                <div>Loading...</div> // Show a loading message while user is being fetched
            )}
            <div class="bod2">
            <Container className="mt-5">
                <h2 className="text-center mb-4">Categories</h2>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Table striped bordered hover>
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
                                    <Button variant="danger" onClick={() => deleteCategorie(categorie._id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <Form onSubmit={addCategorie}>
                    <Form.Group className="mb-3">
                        <Form.Label>New Category</Form.Label>
                        <Form.Control
                            type="text"
                            name="categoryName"
                            placeholder="Enter new category name"
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit">Add Category</Button>
                </Form>
            </Container>
            </div>
        </>
        
    );
};

export default Categories;
