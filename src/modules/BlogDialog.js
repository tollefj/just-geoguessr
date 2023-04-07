import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import useImageClip from '../hooks/useImageClip';
import uploadImage from '../util/upload';
import { storage, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { Box } from '@mui/system';

const BlogDialog = () => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [saving, setSaving] = useState(false);

    const image = useImageClip();
    useEffect(() => {
        uploadImage(storage, image, setContent);
    }, [image]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async (event) => {
        setSaving(true);
        event.preventDefault();
        const id = new Date().toISOString();
        await setDoc(doc(db, "blog", id), {
            title: title,
            content: content,
            tags: tags.split(',').map((tag) => tag.trim()),
        });
        handleClose();
    };

    return (
        <div>
            <Box m={2}>
                <Button onClick={handleOpen}>Update meta</Button>
            </Box>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
            >
                <DialogTitle>Add meta</DialogTitle>
                {/* adjust by row */}
                <DialogContent
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                    }}
                >
                    <Typography variant="body2">Title of meta, country etc...</Typography>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
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
                    <Button type="submit" onClick={handleSubmit}>Create</Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={saving}
                message="Saving blog post... Refresh when done."
                autoHideDuration={5000}
                onClose={() => setSaving(false)}
            />
        </div >
    );
}

export default BlogDialog;
