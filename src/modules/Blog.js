import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Grid, Snackbar, Alert, LinearProgress, CircularProgress } from '@mui/material';
import { collection, getDocs, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import BlogDialog from './BlogDialog';

import firebase from 'firebase/compat/app';
import BlogEntry from '../components/BlogEntry';
import { Link, useNavigate, useParams } from 'react-router-dom';

const coll = collection(db, "blog");

const randomCountries = [
    "sweden",
    "equatorial guinea",
    "guinea-bissau",
    "mexico",
    "slovenia",
    "egypt",
    "lesotho",
    "new zealand",
    "sri lanka",
]
const TITLE = `is this just ${randomCountries[Math.floor(Math.random() * randomCountries.length)]}?`;
const DEFAULT_METAS = [
    "signs",
    "roads",
    "bollards",
    "language",
]


const _where = (t) => where("tags", "array-contains", t);

const Blog = () => {
    const [status, setStatus] = useState(null);

    const [user, setUser] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [rawBlogs, setRawBlogs] = useState([]);

    const navigate = useNavigate();

    // this is inside the RouterProvider context
    // get the /tags/:tag route param
    const { tag } = useParams();

    useEffect(() => {
        const getBlogs = async () => {
            let q;
            if (!!tag) {
                q = query(coll, _where(tag), orderBy("title"));
            } else {
                q = query(coll, orderBy("title"));
            }
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                setBlogs(querySnapshot.docs.map((doc) => {
                    return {
                        id: doc.id,
                        ...doc.data(),
                    }
                }));
            });
            setStatus("Loading blogs...done")
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

    const addTag = (t) => {
        const currTags = tag ? tag.split("+") : [];
        let nextTags;

        if (currTags.includes(t)) {
            // remove tag, such that tag1+tag2 => tag1
            nextTags = currTags.filter((tag) => tag !== t);
            if (nextTags.length === 0) {
                navigate(`/`);
                return;
            }
        } else {
            nextTags = currTags.concat(t);
        }
        navigate(`/tag/${nextTags.join("+")}`);
    }

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
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                        {DEFAULT_METAS.map((meta) => (
                            <Button
                                variant={tag && tag.split("+").includes(meta) ? "contained" : "outlined"}
                                key={meta}
                                onClick={() => addTag(meta)}
                                sx={{ m: 1, }}
                            >{meta}</Button>
                        ))}
                    </Grid>
                    {tag && (<Typography variant="body2" color="text.secondary" component="p" textAlign={"center"}>
                        {/* tags are separated by +, illustrate by #1 #2 */}
                        Filtered by: {tag.split("+").map((tag, index) => <span id="tag" key={index}>#{tag}</span>)
                        }
                    </Typography>)}
                    {tag && (<Link to="/"><Button>Clear tag filter</Button></Link>)}
                </Box>

                {status !== null && !status.includes("Loading") ? (
                    <Box my={5} display="flex" justifyContent="center" alignItems="center">
                        <CircularProgress />
                    </Box>
                ) : (
                    blogs.map((blog) => (
                        <BlogEntry key={blog.id} blog={blog} user={user} />
                    ))
                )}
                <Snackbar
                    open={!!status && !status.includes("Loading")}
                    autoHideDuration={1000}
                    onClose={() => setStatus(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert severity="info">
                        {status}
                    </Alert>
                </Snackbar>

                {/* <Typography variant="body2" color="text.secondary" component="p" textAlign={"center"}>
                    This is a page by <a href="https://github.com/tollefj">me</a>.
                </Typography> */}
            </div>
        </>
    );
}

export default Blog;
