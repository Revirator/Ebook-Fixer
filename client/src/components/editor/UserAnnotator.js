import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { ImageInfo } from '../../helpers/EditorHelper'
import {saveUserAnnotation} from '../../api/AnnotateImage'
import {getImgFilename} from '../../helpers/EditImageHelper'
import styles from './Annotator.module.scss'

/**
 * The user Annotator component has a textbox with a button for the history of the annotations for that image.
 * It should receive the history of the annotations.
 * And a function to save the annotation somewhere once the user types it.
 *
 * @param {{annotationList: List of Strings}} props List of the annotations for this image
 * @param {{currImage: ImageInfo}} props Metadata for image
 * @param {{ebookId: String}} props The UUID for the ebook generated by server
 * @param {{imageId: String}} props The image id generated by server
 * @param {{setImageId: SetStateAction}} props Updates image id
 * @returns The UserAnnotator component
 */
function UserAnnotator({ annotationList, currImage, ebookId, imageId, setImageId }) {

    const [typing, setTyping] = useState(false)
    const [textValue, setTextValue] = useState('')
    const saveButton = useRef(null)

    useEffect(() => {
        const list = annotationList
        if (list.length > 0) {
            // Display the latest human annotation
            setTextValue(list[list.length - 1])
        } else {
            // No img alt attribute
            setTextValue('')
        }
    }, [annotationList])


    function handleClick() {
        saveUserAnnotation(
            ebookId,
            imageId,
            getImgFilename(currImage),
            textValue
        ).then((result) => {
            // console.log(JSON.stringify(result));
            // Keep image id up to date after annotating
            if (Object.prototype.hasOwnProperty.call(result, 'image')) {
                setImageId(result.image)
            }
        })
        saveButton.current.innerText = 'Annotation saved'
        saveButton.current.disabled = true
    }

    return (
        <div className={styles.user_control}>
            <textarea
                value={textValue}
                onChange={(e) => {
                    setTextValue(e.target.value)
                }}
                placeholder="Your annotation here..."
                onFocus={() => {
                    setTyping(true)
                }}
                onBlur={() => {
                    setTyping(false)
                }}
            />
            <button type="button"
                        className={styles.save_button}
                        ref={saveButton}
                        onClick={() => handleClick()}>
                        Save Annotation
            </button> 
            {/* // History button!
            <button
                type="button"
                className={
                    styles.icon + ' ' + (typing ? styles.transparent : '')
                }>
                <HistorySVG title="Annotation History" />
            </button> */}
        </div>
    )
}

UserAnnotator.propTypes = {
    annotationList: PropTypes.arrayOf(PropTypes.string).isRequired,
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired, 
    imageId: PropTypes.number.isRequired,
    setImageId: PropTypes.func.isRequired
}

export default UserAnnotator