import React from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import { Markdown } from './Markdown';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteDoc, doc, } from "firebase/firestore";
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function docIdToIso(docId) {
    // Posted 30 March 2023 at 19:10
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    };
    return new Date(docId).toLocaleString('en-GB', options);
}

const BlogEntry = ({ blog, user, onStatusChange, isEditing, onEdit }) => {
    const { tag } = useParams();
    const currTags = tag ? tag.split("+") : [];

    const navigate = useNavigate();

    const handleDelete = () => {
        deleteDoc(doc(db, "blog", blog.id))
            .then(() => onStatusChange("Deleted"))
    }

    const addTag = (tag) => {
        if (currTags.includes(tag)) { return; }
        navigate(`/tag/${currTags.concat(tag).join("+")}`);
    }

    const imgSize = "w40"  // width-aligned to 40px
    const countryCode = blog.country.code.toLowerCase();
    const imgUrl = `https://flagcdn.com/${imgSize}/${countryCode}.png`;

    return (
        <Box p={2} m={2} id="entry" style={{
            filter: isEditing ? "blur(5px)" : "none",
        }}>
            {/* <Typography variant="h5" color="text.primary" component="h1">
                {blog.title}
            </Typography> */}
            {!!blog.country && (
                <Typography variant='h6' color="text.primary">
                    <img loading="lazy" src={imgUrl} srcSet={`${imgUrl} 2x`}
                        alt={blog.country.label}
                    />
                    &nbsp;{blog.country.label}, 📞+{blog.country.phone}
                </Typography>
            )}
            <Typography variant="body2" color="text.secondary" component="p">
                {`Posted ${docIdToIso(blog.id)} ${blog.edited ?
                    `(edited ${docIdToIso(blog.edited)})` : ""}`}
            </Typography>
            {/* the main content (images, etc.) */}
            <Markdown id="markdown-content" markdown={blog.content} />
            {/* [tag1, tag2, tag3]      [edit, delete] */}
            <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                <Box display="flex" flexDirection="row" justifyContent="flex-start">
                    {blog.tags.map((tag) => (
                        <Box key={tag} id="tag" onClick={() => addTag(tag)}>
                            {`#${tag}`}
                        </Box>
                    ))}
                </Box>
                {user && (
                    <Box display="flex" flexDirection="row" justifyContent="flex-end">
                        <IconButton onClick={onEdit}> <EditIcon /> </IconButton> <IconButton onClick={handleDelete}> <DeleteIcon /> </IconButton>
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default BlogEntry;
