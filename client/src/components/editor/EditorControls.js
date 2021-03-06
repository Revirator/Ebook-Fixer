import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { highlightElement, ImageInfo } from '../../helpers/EditorHelper'
import styles from './EditorControls.module.scss'
import { getImgFilename } from '../../helpers/EditImageHelper'
import { nextImage } from '../../helpers/EbookContext'

/**
 * The EditorControls component handles the controls for the editor.
 * Right now these are a bunch of buttons that scroll pictures from the book into view
 * These are passed as children via props.
 *
 * @param {ImageInfo[]} imageList List of images that epubJS found in the ebook
 * @param {Function} getImage Retrieves the image element from the rendition with the index and imagelist provided
 * @param {external:Render} rendition Render object from ePubJS
 * @param {external:SetStateAction} setCurrentImage Updates the image that is currently being annotated
 * @component
 * @returns The EditorControls component
 */
function EditorControls({ imageList, getImage, rendition, setCurrentImage }) {
    // The index of the image currently being displayed
    const [currentImageIndex, setCurrentImageIndex] = useState(-1)

    const [nextDisabled, setNextDisabled] = useState(false)
    const [prevDisabled, setPrevDisabled] = useState(true)

    const [nextImageFunc, setNextImage] = useAtom(nextImage)

    const navigate = useNavigate()

    const location = useLocation()

    // Get the Image filename from the url
    const { uuid, imgFilename } = useParams()

    // When the imageList is instantiated / filled up (only happens at the beginning or when the image changes)
    useEffect(() => {
        if (imgFilename && rendition && imageList.length > 0) {
            // Get the filename in a decoded format
            const imageFilenameDecoded = decodeURIComponent(imgFilename)
            // Find the index of the image in imageList
            const foundIndex = imageList.findIndex(
                (imageInfo) => imageInfo.asset.href === imageFilenameDecoded
            )
            // If found
            if (foundIndex > -1) {
                changeToImageIndex(foundIndex)
            } else {
                // Alert the user that this link doesn't point to an image
                alert("The image with that name wasn't found in this book!")
            }
        } else if (!imgFilename && currentImageIndex > -1) {
            setCurrentImageIndex(-1)
            setCurrentImage(null)
        }
    }, [imageList, imgFilename])

    // Gets the next index
    function nextIndex() {
        return Math.min(currentImageIndex + 1, imageList.length - 1)
    }

    // Gets the previous index
    function prevIndex() {
        return Math.max(currentImageIndex - 1, 0)
    }

    function handleNext(e) {
        changeToImageIndex(nextIndex())
    }

    function handlePrev(e) {
        changeToImageIndex(prevIndex())
    }

    /**
     * This function handles enabling and disabling the buttons for navigating between images.
     * When at the first image, disables the Previous image button
     * When at the last image, disables the Next image button
     */
    function disableEnableNavButtons() {
        if (currentImageIndex <= 0) {
            setPrevDisabled(true)
        } else {
            setPrevDisabled(false)
        }
        if (currentImageIndex === imageList.length - 1) {
            setNextDisabled(true)
            setNextImage(null)
        } else {
            setNextDisabled(false)
            setNextImage(() => handleNext)
        }
    }

    // Each time the index changes see if the navigation buttons need to be disabled
    useEffect(disableEnableNavButtons, [currentImageIndex, imageList.length])

    /**
     * An asynchronous function to change the view of the book
     * to the image new index given by newIndex.
     *
     * @param {Integer} newIndex The new Index of the image to switch to
     */
    async function changeToImageIndex(newIndex) {
        // Get the image
        const newImage = await getImage(imageList[newIndex], rendition)
        // Scroll to the image
        newImage.scrollIntoView()
        // Highlight the image in red for 5s
        highlightElement(newImage)
        // Set the URL to be of that Image
        const newUrl = `/ebook/${uuid}/image/${encodeURIComponent(
            getImgFilename(imageList[newIndex])
        )}`
        // So that it doesn't navigate to the same image
        if (location.pathname !== newUrl) navigate(newUrl)
        // Set the current image via the props from the parent
        setCurrentImage(imageList[newIndex])
        // Change the current index
        setCurrentImageIndex(newIndex)
    }

    if (rendition)
        return (
            <div className={styles.editor_controls}>
                <button
                    type="button"
                    disabled={prevDisabled}
                    className={styles.arrow + ' ' + styles['arrow--left']}
                    onClick={handlePrev}>
                    <span>Previous image</span>
                </button>

                <div className={styles.block}>
                    <h3>
                        {currentImageIndex === -1
                            ? 'Press arrow to start annotating first image'
                            : currentImageIndex + 1 + '/' + imageList.length}
                    </h3>
                </div>

                <button
                    type="button"
                    disabled={nextDisabled}
                    className={styles.arrow + ' ' + styles['arrow--right']}
                    onClick={handleNext}>
                    {currentImageIndex === -1 ? (
                        <span> First Image </span>
                    ) : (
                        <span>Next image</span>
                    )}
                </button>
            </div>
        )
}

EditorControls.defaultProps = {
    rendition: null,
}

EditorControls.propTypes = {
    imageList: PropTypes.arrayOf(PropTypes.instanceOf(ImageInfo)).isRequired,
    getImage: PropTypes.func.isRequired,
    rendition: PropTypes.shape({}),
    setCurrentImage: PropTypes.func.isRequired,
}

export default EditorControls
