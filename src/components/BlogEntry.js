import React, { useState, useEffect } from 'react';
import { TextField, Typography, Box, IconButton, LinearProgress, Snackbar } from '@mui/material';
import { Markdown, MarkdownMath } from './Markdown';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

// const id = new Date().toISOString();
// await setDoc(doc(db, "blog", id), {
//     title: title,
//     content: content,
//     type: format,
// });


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

// a changing textfield--typography component
// depending on editing status
// render a <Typography> or <TextField>
const EditableText = ({ text, editing, onChange, variant = "body2", primary = false }) => {
    const comp = variant.includes("h") ? "h1" : "p";
    // const color = variant.includes("h") ? "text.primary" : "text.secondary";
    const color = primary ? "text.primary" : "text.secondary";

    return editing ? (
        <TextField
            value={text}
            onChange={onChange}
            multiline
            fullWidth
        />
    ) : (
        <Typography
            variant={variant}
            color={color}
            component={comp}>
            {text}
        </Typography>
    )
}

const BlogEntry = ({ blog, user }) => {
    const [editing, setEditing] = useState(false);

    const [title, setTitle] = useState(blog.title);
    const [tags, setTags] = useState(blog.tags);
    const [content, setContent] = useState(blog.content);

    const [status, setStatus] = useState("");
    const { tag } = useParams();

    const navigate = useNavigate();

    const onSave = () => {
        setEditing(!editing);
        setStatus("Saving...");
        // update the firebase document
        // doc id = blog.id
        updateDoc(doc(db, "blog", blog.id), {
            title: title,
            content: content,
            edited: new Date().toISOString(),
        }).then(() => {
            setStatus("Saved");
        })
    }

    const handleDelete = () => {
        deleteDoc(doc(db, "blog", blog.id)).then(() => {
            setStatus("Deleted");
        })
    }

    const currTags = tag ? tag.split("+") : [];

    const addTag = (tag) => {
        if (currTags.includes(tag)) {
            return;
        }
        navigate(`/tag/${currTags.concat(tag).join("+")}`);
    }

    return (
        <Box
            p={2}
            m={2}
            borderBottom={2}
            borderColor="grey.800"
        >
            <EditableText
                text={title}
                editing={editing}
                variant="h4"
                onChange={(e) => setTitle(e.target.value)}
                primary
            />
            {/* <Typography variant="h4" color="text.secondary">
                {title}
            </Typography> */}
            <Typography variant="body2" color="text.secondary" component="p">
                {`Posted ${docIdToIso(blog.id)} ${blog.edited ? `(edited ${docIdToIso(blog.edited)})` : ""}`}
            </Typography>
            {/* render tags with hastags, so from a list [tag1, tag2] */}
            {/* to #tag1 #tag2 */}
            {/* render by row, not column */}
            <Box display="flex" flexDirection="row" justifyContent="flex-start">
                {tags.map((tag) => (
                    // browserrouter navigation Link
                    <Box
                        key={tag}
                        id="tag"
                        onClick={() => addTag(tag)}
                        style={{
                            cursor: "pointer",
                        }}
                    >
                        {/* the link should add additional tags */}
                        {/* e.g. localhost:3000/tag/road */}
                        {/* =>  */}
                        {/* localhost:3000/tag/road+signs */}
                        {/* localhost:3000/tag/road+signs+speed */}
                        {`#${tag}`}
                    </Box>
                ))}
            </Box>
            {
                editing ? (
                    <EditableText
                        text={content}
                        editing={editing}
                        onChange={(e) => setContent(e.target.value)}
                        variant="body2"
                    />
                ) : (
                    <Box maxWidth={"100%"} style={{
                        overflow: 'auto',
                        textAlign: 'left',
                    }}>
                        {blog.type === "math" ? (
                            <MarkdownMath markdown={content} />
                        ) : (
                            <Markdown markdown={content} />
                        )}
                    </Box>
                )
            }
            {/* flex rows */}
            {
                user && (
                    <Box display="flex" flexDirection="row" justifyContent="flex-end">
                        {/* edit button */}
                        <IconButton onClick={() => {
                            if (editing) {
                                onSave();
                            } else {
                                setEditing(!editing);
                            }
                        }}>
                            {editing ? <SaveIcon /> : <EditIcon />}
                        </IconButton>
                        <IconButton onClick={handleDelete}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                )
            }
            <Snackbar open={status.length > 0} autoHideDuration={3000} onClose={() => setStatus("")} message={status} />
        </Box >
    )
}

export default BlogEntry;
