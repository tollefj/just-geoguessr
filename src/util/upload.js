import { ref, uploadString, getDownloadURL } from "firebase/storage";

const uploadImage = async (storage, image, setContent) => {
    if (image) {
        const size = image.length / 1024;
        console.log("image size: ", size, "KB")
        const fileName = new Date().toISOString() + ".png";
        const imgRef = ref(storage, `images/${fileName}`);
        uploadString(imgRef, image, 'data_url').then((snapshot) => {
            console.log(snapshot);
            getDownloadURL(imgRef).then((url) => {
                console.log(url)
                const markdownStyle = `![${fileName}](${url})`;
                setContent((prevContent) => `${prevContent}\n${markdownStyle}\n`);
            })
        });
    }
}

export default uploadImage