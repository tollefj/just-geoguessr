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
import { flagColors } from '../assets/flagColors';
import { Flag } from '@mui/icons-material';

const coll = collection(db, "blog");

const TITLE = "is this just..."
const DEFAULT_METAS = [
    "signs 🛑",
    "roads 🛣",
    "bollards 🚧",
    "language 🈁",
]
const uid = "qcoGJu8twIeXwhRUASB9JNWiqOn1"

// function to map a country name to its country object in countries.js
function getCountry(name) {
    return countries.find((c) => c.label.toLowerCase() === name.toLowerCase());
}

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

// fuzzy search from scratch
// if my blog post contains "sweden, bollard, red, blue, chevron"
// i want to match seden bolard cheron
// implement a lazy search with levenshtein distance
function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    let matrix = [];
    let i;
    for (i = 0; i <= b.length; i++) { matrix[i] = [i]; }

    let j;
    for (j = 0; j <= a.length; j++) { matrix[0][j] = j; }

    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
            }
        }
    }
    return matrix[b.length][a.length];
}
const lazySearch = (searchStr, blog) => {
    if (searchStr.length === 0) return true;
    if (!blog.searchTokens) return false;
    let s = searchStr.toLowerCase().split(" ");
    // compute the levenshtein distance for each search token
    // and each blog token
    let distances = [];
    s.forEach((searchToken) => {
        if (searchToken.length === 0) return;
        blog.searchTokens.forEach((token) => {
            distances.push(levenshtein(searchToken, token));
        })
    })
    // if the minimum distance is less than 3, we have a match
    const min = Math.min(...distances);
    const lazyMatch = 2
    return min < lazyMatch;
}

const Blog = () => {
    const [status, setStatus] = useState(null);
    const [user, setUser] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);
    const [searchStr, setSearchStr] = useState("");
    const [availableTags, setAvailableTags] = useState(DEFAULT_METAS);
    const [flagSearch, setFlagSearch] = useState("");
    const [flagMatches, setFlagMatches] = useState([]);

    const [open, setOpen] = useState(false);  // dialog/editor open
    const [editingBlogId, setEditingBlogId] = useState(null);

    // this is inside the RouterProvider context
    // get the /tags/:tag route param
    const { tag } = useParams();

    useEffect(() => {
        const getBlogs = async () => {
            let q;
            if (!!tag) { q = query(coll, _where(tag), orderBy("posted", "desc")); }
            else { q = query(coll, orderBy("posted", "desc")); }
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
            setBlogs(allBlogs.filter((blog) => lazySearch(searchStr, blog)));
        } else {
            setBlogs(allBlogs);
        }
    }, [searchStr, allBlogs])

    useEffect(() => {
        // call the debounced function max 200ms after typing stop
        const timer = setTimeout(() => {
            let s = flagSearch.toLowerCase().trim();
            if (!s) {
                setFlagMatches([]);
                return;
            }
            // replace yellow->gold if it exists
            if (s.includes("yellow")) {
                s = s.replace("yellow", "gold");
            }
            let separator = s.match(/[^a-zA-Z0-9]/g);
            if (separator) {
                separator = separator[0];
            }
            if (s.endsWith(separator)) {
                s = s.slice(0, -1);
            }
            s = s.split(separator).map((s) => s.trim()).sort().join("|");
            if (s.length > 0) {
                let matches = [];
                for (let [key, value] of Object.entries(flagColors)) {
                    if (key.includes(s)) {
                        matches.push(...value);
                    }
                }
                matches = [...new Set(matches)];
                matches = matches
                    .map((match) => getCountry(match))
                    .filter((match) => !!match);
                setFlagMatches(matches);
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [flagSearch])

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
                {/* [SEARCH]        [Flag Search] */}
                {/* <Box display='flex' justifyContent='center' alignItems='center' flexDirection='row' w={1}> */}
                {/* take up the entire width */}
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            autoFocus
                            fullWidth
                            label="Search..."
                            placeholder='Search for countries, signs, bollard, languages...'
                            value={searchStr}
                            onChange={(e) => debounce(setSearchStr(e.target.value), 500)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            autoFocus
                            fullWidth
                            label="Flag Search..."
                            placeholder="Search for any flag colors"
                            value={flagSearch}
                            onChange={(e) => setFlagSearch(e.target.value)}
                        />
                    </Grid>
                </Grid>
                {/* show the matching flags */}
                {/* layout: */}
                {/* *flag* country       *flag* country        * flag country **/}
                {/* in a grid, scale it */}
                {flagMatches.length > 0 && (
                    <Grid container spacing={1}>
                        {flagMatches.map((country) => (
                            <Grid key={country.code} item xs={4} sm={3} md={2}>
                                <p>
                                    <img
                                        loading="lazy"
                                        src={`https://flagcdn.com/h60/${country.code}.png`}
                                        srcSet={`https://flagcdn.com/h80/${country.code}.png 2x`}
                                        alt={country.label}
                                    />
                                    {country.label}
                                </p>
                            </Grid>
                        ))}
                    </Grid>
                )}
                {/* update meta modal */}
                {user && (
                    <>
                        <Box m={2}>
                            <Button
                                variant="outlined"
                                onClick={() => setOpen(!open)}
                            >
                                Add meta!
                            </Button>
                        </Box>
                        <BlogDialog
                            open={editingBlogId !== null || open}
                            blog={blogs.find((blog) => blog.id === editingBlogId)}
                            onStatusChange={(status) => {
                                setStatus(status);
                                setOpen(false);
                                setEditingBlogId(null);
                            }}
                            onClose={() => {
                                setOpen(false);
                                setEditingBlogId(null);
                            }}
                        />
                    </>
                )}

                {tag && (<Typography variant="body2" color="text.secondary" component="p" textAlign={"center"}>
                    {/* tags are separated by +, illustrate by #1 #2 */}
                    Filtered by: {tag.split("+").map((tag, index) => <span id="tag" key={index}>#{tag}</span>)
                    }
                </Typography>)}
                {tag && (<Link to="/"><Button>Clear tag filter</Button></Link>)}
            </Box>
            {
                status !== null && !status.includes("Loading") ? (
                    <Box my={5} display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>
                ) : (
                    <Box>
                        {blogs.map((blog) => (
                            <BlogEntry
                                key={blog.id}
                                blog={blog}
                                user={user}
                                isEditing={(blog.id === editingBlogId)}
                                onEdit={() => setEditingBlogId(blog.id)}
                                onStatusChange={(status) => setStatus(status)}
                            />
                        ))}
                    </Box>
                )
            }
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
        </Box >
    );
}

export default Blog;
