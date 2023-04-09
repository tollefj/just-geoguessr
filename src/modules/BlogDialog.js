import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import useImageClip from '../hooks/useImageClip';
import uploadImage from '../util/upload';
import { storage, db } from '../firebase';
import { setDoc, doc, updateDoc } from 'firebase/firestore';
import { Box } from '@mui/system';
import CountrySelector from '../components/CountrySelect';

const BlogDialog = ({ blog = null, onStatusChange, open, onClose }) => {
    const [country, setCountry] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState([]);

    useEffect(() => {
        if (blog) {
            setCountry(blog.country);
            setContent(blog.content);
            setTags(blog.tags.join(', '));
        }
    }, [blog])

    const reset = () => {
        setCountry("");
        setContent("");
        setTags([]);
    }

    const image = useImageClip();
    useEffect(() => {
        uploadImage(storage, image, setContent);
    }, [image]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const id = new Date().toISOString();
        const docRef = doc(db, "blog", id);

        const tokens = content.toLowerCase().split(" ");
        const countryTokens = !!country ? [country.label.toLowerCase(), country.code.toLowerCase()] : []

        setDoc(docRef, {
            country: country,
            content: content,
            tags: tags.split(',').map((tag) => tag.trim()),
            searchTokens: tokens.concat(tags).concat(countryTokens),
            posted: id
        }).then(() => {
            onStatusChange && onStatusChange(`Added new meta for ${country.label}`);
            reset();
        });
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        const docRef = doc(db, "blog", blog.id);
        updateDoc(docRef, {
            content: content,
            country: country,
            tags: tags.split(',').map((tag) => tag.trim()),
            edited: new Date().toISOString(),
        }).then(() => {
            onStatusChange && onStatusChange(`Updated meta for ${country.label}`);
            reset();
        })
    }

    return (
        <>
            <Dialog open={open} fullWidth onClose={onClose} >
                {/* <DialogTitle>{!!blog ? "Edit meta" : "Add meta"}</DialogTitle> */}
                {/* adjust by row */}
                <DialogContent
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                    }}
                >
                    {/* <Typography variant="body2">Title of meta, country etc...</Typography>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    /> */}
                    <Typography variant="body2">Country</Typography>
                    <CountrySelector
                        handleChange={(c) => setCountry(c)}
                        value={country}
                    />
                    {/* tags, separated by comma */}
                    <Typography variant="body2">Tags, separated by comma</Typography>
                    <TextField
                        label="Tags"
                        value={tags}
                        onChange={(event) => setTags(event.target.value)}
                    />
                    <Typography variant="body2">Content to be shown, text, pasted images...</Typography>
                    <TextField
                        label="Content"
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        style={{
                            minHeight: '100%'
                        }}
                        multiline
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        onClick={(e) => { !!blog ? handleUpdate(e) : handleSubmit(e) }}
                    >
                        {!!blog ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default BlogDialog;
