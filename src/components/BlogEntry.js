import React, { useState, useEffect } from 'react';
import { TextField, Typography, Box, IconButton, Autocomplete } from '@mui/material';
import { Markdown } from './Markdown';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import CountrySelector from './CountrySelect';

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

const BlogEntry = ({ blog, user, onStatusChange }) => {
    const [editing, setEditing] = useState(false);

    const [title, setTitle] = useState(blog.title);
    const [tags, setTags] = useState(blog.tags);
    const [country, setCountry] = useState(blog.country);
    const [content, setContent] = useState(blog.content);

    const { tag } = useParams();

    const navigate = useNavigate();

    const onSave = () => {
        setEditing(!editing);
        onStatusChange("Saving...");
        // update the firebase document
        // doc id = blog.id
        updateDoc(doc(db, "blog", blog.id), {
            title: title,
            content: content,
            country: country,
            tags: tags,
            edited: new Date().toISOString(),
        }).then(() => {
            onStatusChange("Saved");
        })
    }

    const handleDelete = () => {
        deleteDoc(doc(db, "blog", blog.id)).then(() => {
            onStatusChange("Deleted");
        })
    }

    const currTags = tag ? tag.split("+") : [];

    const addTag = (tag) => {
        if (currTags.includes(tag)) {
            return;
        }
        navigate(`/tag/${currTags.concat(tag).join("+")}`);
    }
    console.log(country)

    return (
        <>
            {/* <Box sx={{
                backgroundImage: !!country ?
                    `url(https://flagcdn.com/w160/${country.code.toLowerCase()}.png)`
                    : "none",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                filter: "blur(10px)",
                zIndex: -1,
            }}
            /> */}
            <Box p={2} m={2} id="entry" sx={{
                backgroundImage: !!country ?
                    `url(https://flagcdn.com/w160/${country.code.toLowerCase()}.png)`
                    : "none",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                // filter: "blur(10px)",
                // backdropFilter: "blur(100px)",
                zIndex: -1,
            }} >
                {/* 

                Split the title of a blog entry as follows:

                TITLE           TAGS
                Posted at ...
            */}
                <Box display="flex" flexDirection="row" justifyContent="space-between">
                    <Box display="flex" flexDirection="column" justifyContent="flex-start">
                        <EditableText
                            text={title}
                            editing={editing}
                            variant="h5"
                            onChange={(e) => setTitle(e.target.value)}
                            primary
                        />
                    </Box>
                    <Box>
                        {editing ? (
                            <TextField fullWidth value={tags.join(",")} onChange={(e) => setTags(e.target.value.split(","))} />
                        ) : (
                            <Box display="flex" flexDirection="row" justifyContent="flex-start">
                                {tags.map((tag) => (
                                    <Box
                                        key={tag}
                                        id="tag"
                                        onClick={() => addTag(tag)}
                                    >
                                        {`#${tag}`}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
                <Box>
                    {!editing && (
                        <Typography variant="body2" color="text.secondary" component="p">
                            {`Posted ${docIdToIso(blog.id)} ${blog.edited ? `(edited ${docIdToIso(blog.edited)})` : ""}`}
                        </Typography>
                    )}
                </Box>
                <Box>
                    {editing ? (
                        <CountrySelector handleChange={(c) => setCountry(c)} />
                    ) : (
                        !!country && (
                            <Typography variant='h6' color="text.primary">
                                <img
                                    loading="lazy"
                                    src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                                    srcSet={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png 2x`}
                                    alt={country.label}
                                />
                                &nbsp;{country.label}, 📞+{country.phone}
                            </Typography>
                        )
                    )}
                </Box>
                {/* render tags with hastags, so from a list [tag1, tag2] */}
                {/* to #tag1 #tag2 */}
                {/* render by row, not column */}
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
                            <Markdown markdown={content} />
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
            </Box>
        </>
    )
}

export default BlogEntry;
