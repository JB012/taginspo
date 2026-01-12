interface ImageProp {
    image_id: string
    url: string
    title: string
    handleImageClick: (image_id : string) => void
}



export default function Image({image_id, url, title, handleImageClick} : ImageProp) {
    return (
        <div id={image_id} className="cursor-pointer" key={image_id} onClick={() => handleImageClick(image_id)}>
            <img id={image_id} src={url} alt={title} width={200} height={200}/>
        </div>
    )
}