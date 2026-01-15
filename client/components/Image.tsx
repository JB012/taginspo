interface ImageProp {
    image_id: string
    url: string
    alt: string
    handleImageClick: (image_id : string) => void
}



export default function Image({image_id, url, alt, handleImageClick} : ImageProp) {
    return (
        <div id={image_id} className="cursor-pointer" key={image_id} onClick={() => handleImageClick(image_id)}>
            <img id={image_id} src={url} alt={alt} width={200} height={200}/>
        </div>
    )
}