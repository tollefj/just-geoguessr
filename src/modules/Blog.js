import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Grid, Snackbar, Alert, LinearProgress, CircularProgress, TextField } from '@mui/material';
import { collection, getDocs, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import BlogDialog from './BlogDialog';

import firebase from 'firebase/compat/app';
import BlogEntry from '../components/BlogEntry';
import { Link, useNavigate, useParams } from 'react-router-dom';

// import the countries list from assets
import { countries } from '../assets/countries';

const coll = collection(db, "blog");

const TITLE = "is this just..."
const DEFAULT_METAS = [
    "signs 🛑",
    "roads 🛣",
    "bollards 🚧",
    "language 🈁",
]
const uid = "qcoGJu8twIeXwhRUASB9JNWiqOn1"

const _where = (t) => where("tags", "array-contains", t);

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const Blog = () => {
    const [status, setStatus] = useState(null);
    const [user, setUser] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);
    const [searchStr, setSearchStr] = useState("");
    const [availableTags, setAvailableTags] = useState(DEFAULT_METAS);
    const [showTags, setShowTags] = useState(false);

    // this is inside the RouterProvider context
    // get the /tags/:tag route param
    const { tag } = useParams();

    useEffect(() => {
        const getBlogs = async () => {
            let q;
            if (!!tag) { q = query(coll, _where(tag), orderBy("title")); }
            else { q = query(coll, orderBy("title")); }
            let allTags = [];
            // const unsubscribe =...
            onSnapshot(q, (querySnapshot) => {
                let blogs = [];
                querySnapshot.docs.map((doc) => {
                    allTags = [...allTags, ...doc.data().tags];
                    return blogs.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                });
                setBlogs(blogs);
                setAllBlogs(blogs);
            });
            setAvailableTags([...new Set(allTags)]);
            setStatus("Loading blogs...done")
        }
        getBlogs();
    }, [tag]);

    // check on search string change:
    useEffect(() => {
        if (searchStr.length > 0) {
            // split a search like "sweden road signs" into ["sweden", "road", "signs"]
            // match all these search tokens
            let s = searchStr.toLowerCase().split(" ");

            setBlogs(allBlogs.filter((blog) => {
                // combine all tokens from title, content and tags
                const titleTokens = blog.title.toLowerCase().split(" ");
                const contentTokens = blog.content.toLowerCase().split(" ");
                const tagsTokens = blog.tags;
                const countryTokens = !!blog.country ? [blog.country.label.toLowerCase()] : []
                // countrytags
                const allTokens = [...titleTokens, ...contentTokens, ...tagsTokens, ...countryTokens];
                // and check if any of them contains the search string
                return s.every((searchToken) => allTokens.some((token) => token.includes(searchToken)));
            }))
        } else {
            setBlogs(allBlogs);
        }
    }, [searchStr, allBlogs])

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (user && user.uid === uid) {
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
        <Box id="content" w={1}>
            <Box id="title" textAlign='center'>
                <Typography variant="h3" color="text.primary">
                    {TITLE}
                </Typography>
            </Box>
            <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' pt={3} px={2}>
                {/* search field that debounces setSearchStr and keeps its value */}
                <TextField
                    autoFocus
                    fullWidth
                    label="Search..."
                    placeholder='Search for countries, signs, bollard, languages...'
                    value={searchStr}
                    onChange={(e) => debounce(setSearchStr(e.target.value), 500)}
                />
                {/* update meta modal */}
                {user && (<BlogDialog onStatusChange={(status) => setStatus(status)} />)}

                {tag && (<Typography variant="body2" color="text.secondary" component="p" textAlign={"center"}>
                    {/* tags are separated by +, illustrate by #1 #2 */}
                    Filtered by: {tag.split("+").map((tag, index) => <span id="tag" key={index}>#{tag}</span>)
                    }
                </Typography>)}
                {tag && (<Link to="/"><Button>Clear tag filter</Button></Link>)}
            </Box>
            {status !== null && !status.includes("Loading") ? (
                <Box my={5} display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>
            ) : (
                <Box >
                    {blogs.map((blog) => (
                        <BlogEntry
                            key={blog.id}
                            blog={blog}
                            user={user}
                            onStatusChange={(status) => setStatus(status)}
                        />
                    ))}
                </Box>
            )}
            <Snackbar
                open={!!status && !status.includes("Loading")}
                autoHideDuration={1000}
                onClose={() => setStatus(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="info">{status}</Alert>
            </Snackbar>
            {/* <Typography variant="body2" color="text.secondary" component="p" textAlign={"center"}>
                This is a page by <a href="https://github.com/tollefj">me</a>.
            </Typography> */}
        </Box>
    );
}

export default Blog;
