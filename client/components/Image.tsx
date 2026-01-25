interface ImageProp {
    image_id: string
    url: string
    title: string
    alt: string
    handleImageClick: (image_id : string) => void
}



export default function Image({image_id, url, title, alt, handleImageClick} : ImageProp) {
    return (
        <div data-testid={`image-${title}`} id={image_id} className="flex justify-center items-center cursor-pointer m-2 w-[200px] h-[200px] xxs:w-32 xxs:h-32" key={image_id} onClick={() => handleImageClick(image_id)}>
            <img className="max-w-[200px] max-h-[200px] xxs:max-w-32 xxs:max-h-32 object-contain" id={image_id} src={url} alt={alt} />
        </div>
    )
}