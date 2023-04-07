import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Grid } from '@mui/material';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import BlogDialog from './BlogDialog';

import firebase from 'firebase/compat/app';
import BlogEntry from '../components/BlogEntry';
import { Link, useParams } from 'react-router-dom';

const coll = collection(db, "blog");

const TITLE = "is this just sweden?";

const Blog = () => {
    const [user, setUser] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [rawBlogs, setRawBlogs] = useState([]);

    // this is inside the RouterProvider context
    // get the /tags/:tag route param
    const { tag } = useParams();

    useEffect(() => {
        const getBlogs = async () => {
            let blogs = rawBlogs;
            if (blogs.length === 0) {
                const querySnapshot = await getDocs(coll);
                blogs = querySnapshot.docs.map((doc) => {
                    return {
                        id: doc.id,
                        ...doc.data(),
                    }
                });
            }
            setRawBlogs(blogs);
            if (tag !== undefined) {
                tag.split("+").forEach((tag) => {
                    blogs = blogs.filter((blog) => blog.tags.includes(tag));
                });
            }
            blogs = blogs.filter((blog) => blog.title && blog.content);
            blogs.sort((a, b) => {
                return b.id.localeCompare(a.id);
            });
            setBlogs(blogs);
        }
        getBlogs();
    }, [tag, rawBlogs]);

    // const uid = "DAwJOYj9TqQ6wBVpDADI772d9Xg1"

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {

            if (user && user.uid !== null) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);


    return (
        <>
            <Box id="title" textAlign='center'>
                <Typography variant="h2" color="text.primary">
                    {TITLE}
                </Typography>
            </Box>
            <div id="content">
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                }}>

                    {user && (<BlogDialog />)}
                    {/* display tags that are filtered: */}
                    {tag && (<Typography variant="body2" color="text.secondary" component="p" textAlign={"center"}>
                        {/* tags are separated by +, illustrate by #1 #2 */}
                        Filtered by: {tag.split("+").map((tag, index) => <span id="tag" key={index}>#{tag}</span>)
                        }
                    </Typography>)}
                    {/* clear tag filter Link */}
                    {tag && (
                        <Link to="/">
                            <Button>Clear tag filter</Button>
                        </Link>
                    )}
                    {/* clear localstorage button */}
                </Box>

                {blogs.map((blog) => (
                    <BlogEntry key={blog.id} blog={blog} user={user} />
                ))
                }

                <Typography variant="body2" color="text.secondary" component="p" textAlign={"center"}>
                    This is a page by <a href="https://github.com/tollefj">me</a>.
                </Typography>
                <Box textAlign={"center"}>
                    {user && (<Button onClick={() => {
                        localStorage.removeItem('blog');
                        localStorage.removeItem('blogUpdated');
                        window.location.reload();
                    }}>Clear local storage</Button>)}
                </Box>
            </div>
        </>
    );
}

export default Blog;
