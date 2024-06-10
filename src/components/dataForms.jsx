import React, { useState, useEffect } from "react";
import axios from "axios";
import './dataForms.css';

const API_URL = 'https://main--famous-gecko-6f8dd7.netlify.app/.netlify/functions/api/blogPosts';

function DataForms() {
    const [data, setData] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [commentUser, setCommentUser] = useState('');
    const [error, setError] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [showModal, setShowModal] = useState(false); 
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(API_URL);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || !category) {
            setError('Title, content, and category are required');
            return;
        }
        try {
            const method = editItem ? 'put' : 'post';
            const url = editItem ? `${API_URL}/${editItem._id}` : API_URL;
            const response = await axios[method](url, { title, content, category, tags: tags.split(',').map(tag => tag.trim()) });
            setTitle('');
            setContent('');
            setCategory('');
            setTags('');
            setEditItem(null);
            setError(null);
            fetchData();
            setShowModal(false);
        } catch (error) {
            console.error('Error submitting data:', error);
            setError('Error submitting data');
        }
    };

    const handleEdit = (id) => {
        const itemToEdit = data.find(item => item._id === id);
        setEditItem(itemToEdit);
        setTitle(itemToEdit.title);
        setContent(itemToEdit.content);
        setCategory(itemToEdit.category);
        setTags(itemToEdit.tags.join(', '));
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setData(prevData => prevData.filter(item => item._id !== id));
            setError(null);
        } catch (error) {
            console.error('Error deleting data:', error);
            setError('Error deleting data');
        }
    };

    const handleAddComment = async (postId) => {
        try {
            const response = await axios.post(`${API_URL}/${postId}/comments`, { user: commentUser, content: commentContent });
            setCommentContent('');
            setCommentUser('');
            fetchData();
        } catch (error) {
            console.error('Error adding comment:', error);
            setError('Error adding comment');
        }
    };

    const categories = [...new Set(data.map(post => post.category))];

    return (
        <div>
            <div className="head">
            <h1>Daily Updates</h1>
                <div className="buttons">
                
                    <div className="categorize-button">
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <div className="modal-button">
                            <button onClick={() => setShowModal(true)}>Add Post</button>
                        </div>
                    </div>
                </div>
                {showModal && <div className="modal-overlay"></div>}
                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                            <form className="add-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <input
                                        type='text'
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder='     Title'
                                    />
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="     Content"
                                    />
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="     Category"
                                    />
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="     Tags (comma separated)"
                                    />
                                </div>
                                <button className="add-data" type="submit">{editItem ? 'Update Post' : 'Add Post'}</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <ul className="order">
                {data.filter(post => selectedCategory === '' || post.category === selectedCategory).map(item => (
                    <li className="sample-post" key={item._id}>
                        <div className="post-list">
                            <div className="post">
                                <div className="post-title">{item.title}</div>
                                <div className="post-content"> {item.content}</div>
                                <div className="post-category"> {item.category}</div>
                                <div className="post-tags">Tags: {item.tags.join(', ')}</div>
                                <div className="post-comments">
                                    <h3>Comments</h3>
                                    {item.comments.map((comment, index) => (
                                        <div key={index} className="comment">
                                            <strong>{comment.user}</strong>: {comment.content}
                                        </div>
                                    ))}
                                    <div className="add-comment">
                                        <input
                                            type="text"
                                            value={commentUser}
                                            onChange={(e) => setCommentUser(e.target.value)}
                                            placeholder="Username"
                                        />
                                        <textarea
                                            value={commentContent}
                                            onChange={(e) => setCommentContent(e.target.value)}
                                            placeholder="Your comment"
                                        />
                                        <button onClick={() => handleAddComment(item._id)}>Add Comment</button>
                                    </div>
                                </div>
                            </div>
                            <div className="button-items">
                                <button className="edit-button" onClick={() => handleEdit(item._id)}>Edit Post</button>
                                <button className="delete-button" onClick={() => handleDelete(item._id)}>Delete</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DataForms;
