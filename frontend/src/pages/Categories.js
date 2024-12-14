import axiosInstance from "../utils/axiosInstance";
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Alert } from 'react-bootstrap';
import NavBar from '../components/NavBar';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoading2, setIsLoading2] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get('/user/', { withCredentials: true });
                setUser(response.data);
            } catch (error) {
            } finally {
                setIsLoading(false);
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
        } finally {
            setIsLoading2(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const deleteCategorie = async (id) => {
        try {
            await axiosInstance.delete(`/categorie/del/${id}`, { withCredentials: true });
            setSuccess('Category deleted successfully!');
            fetchCategories();
        } catch (error) {
            setError('Failed to delete category.');
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
        }
    };

    if (isLoading || isLoading2) {
        return (
            <div style={{   display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <img className="loadingImage" src={require('../assets/images/loading.svg').default} alt="Loading" />
            </div>
        );
    }

    return (
        <>
            {user ? (
                <NavBar user={user} />
            ) : (
                <div>Loading...</div>
            )}
            <div className="bod2">
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
