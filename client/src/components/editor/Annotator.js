import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { ReactComponent as HistorySVG } from '../../assets/svgs/history-icon.svg'
import { ImageInfo } from '../../helpers/EditorHelper'
import AIAnnotator from './AIAnnotator'
import Classifier from './Classifier'
import {saveUserAnnotation} from '../../api/AnnotateImage'
import {getImgFilename} from '../../helpers/EditImageHelper'
import { getImageMetadataApiCall } from '../../api/GetImageMetadata'
import styles from './Annotator.module.scss'

/**
 * The user Annotator component has a textbox with a button for the history of the annotations for that image.
 * It should receive the history of the annotations.
 * And a function to save the annotation somewhere once the user types it.
 *
 * @param {{annotationList: List of Strings}} props List of the annotations for this image
 * @param {{setTextValue: SetStateAction}} props Updates text value in user annotation box
 * @param {{textValue: String}} props Human annotation entered by user
 * @returns The UserAnnotator component
 */

function UserAnnotator({ annotationList, setTextValue, textValue, setTyping }) {
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

    return (
        <div className={styles.user_input}>
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
    setTextValue: PropTypes.func.isRequired,
    textValue: PropTypes.string.isRequired,
    setTyping: PropTypes.func.isRequired,
}

/**
 * Annotator component is meant to help the user produce an annotation for an image as an end result
 * It has an AI component for classifying images and generating AI descriptions
 * And a user component for letting the user annotate images
 *
 * @param {{currImage: ImageInfo}} props Metadata for image
 * @param {{ebookId: String}} props The UUID for the ebook generated by server
 * @returns The Annotator Component
 */

function Annotator({ currImage, ebookId }) {
    // TODO: could be used to get the annotation history
    const [userAnnotationList, setUserAnnotationList] = useState([])
    const [aiAnnotationList, setAiAnnotationList] = useState([])
    const [imageId, setImageId] = useState(-1)
    const [textValue, setTextValue] = useState('')
    const [currClassification, setCurrClassification] = useState(null)
    const [typing, setTyping] = useState(false)

    const saveButton = useRef(null)
    // Executed every time the currentImage changes
    useEffect(() => {
        if (!currImage) {
            saveButton.current.innerText = 'Select image first'
            saveButton.current.disabled = true
        } else {
            saveButton.current.innerText = 'Save annotation'
            saveButton.current.disabled = false

            const imgInfo = currImage

            if (imgInfo) {
                const altText = imgInfo.element.alt
                if (altText) {
                    // Initial alt text of image will be displayed if no HUM annotations yet
                    setUserAnnotationList([altText])
                    setAiAnnotationList([])
                } else {
                    setUserAnnotationList([])
                    setAiAnnotationList([])
                }
            }

            // For each image that is loaded, client fetches all metadata from server (even if the image does not exist yet)
            console.log('Fetching image metadata...')
            getImageMetadataApiCall(ebookId, getImgFilename(currImage)).then(
                (result) => {
                    if (
                        Object.prototype.hasOwnProperty.call(
                            result,
                            'annotations'
                        )
                    ) {
                        console.log('Annotations: ')
                        console.log(result.annotations)
                        console.log('Image metadata: ')
                        console.log(result.image)
                        // For each HUM annotation, add to user annotation list (for display in UserAnnotator)
                        // Note that for now this list always contains 1 HUM annotation
                        result.annotations.forEach((element) => {
                            if (element.type === 'HUM') {
                                setUserAnnotationList([
                                    ...userAnnotationList,
                                    element.text,
                                ])
                                // Disable button if human annotation was saved earlier
                                saveButton.current.disabled = true
                            }
                        })

                        // result.annotations.forEach((element) => {
                        //     console.log(element)
                        //     if (element.type === 'BB') {
                        //         setAiAnnotationList([
                        //             ...aiAnnotationList,
                        //             JSON.stringify(element.text, element.confidence)
                        //         ])
                        //         // Disable button if human annotation was saved earlier
                        //         //  saveButton.current.disabled = true
                        //     }
                         
                        // } )
                        // console.log(aiAnnotationList)

                        setAiAnnotationList([...aiAnnotationList, result.annotations.filter((e) => e.type==='BB').map(({ text, confidence }) => (JSON.stringify({ text, confidence })))])
                    }

                        
                    
                    // TODO: we may also wanna pass this classification to AIAnnotator in the future,
                    //    to allow for different workflows per category
                    if (Object.prototype.hasOwnProperty.call(result, 'image')) {
                        console.log(
                            'Classification stored: ' +
                                result.image.classification
                        )
                        setCurrClassification(result.image.classification)
                    }
                    // Update image id after each new image is loaded
                    if (Object.prototype.hasOwnProperty.call(result, 'image')) {
                        setImageId(result.image.id)
                    }
                },
                (error) => {
                    if (error.cause === 404) {
                        console.log(
                            'Image does not exist on server yet, will be created after the first time classifying.'
                        )
                        setCurrClassification(null)
                    }
                }
            )
        }
    }, [currImage])

    useEffect(() => {
        if (typing) {
            saveButton.current.disabled = false
        }
    }, [typing])

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
        <div className={styles.container}>


            <Classifier
            currImage={currImage}
            ebookId={ebookId}
            setImageId={setImageId}>
                {' '}
            </Classifier>
            <AIAnnotator
            annotationList={aiAnnotationList}
            currImage={currImage}
            ebookId={ebookId}
            imageId={imageId} ></AIAnnotator>
            <UserAnnotator annotationList={userAnnotationList} setTextValue={setTextValue} textValue={textValue}/>
            <button type="button"
                    className={styles.save_button}
                    ref={saveButton}
                    onClick={() => handleClick()}>
                    Save Annotation

            </button>
        </div>
    )
}

Annotator.propTypes = {
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
}

export default Annotator
