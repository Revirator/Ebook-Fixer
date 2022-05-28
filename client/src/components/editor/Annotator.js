import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { ImageInfo } from '../../helpers/EditorHelper'
import AIAnnotator from './AIAnnotator'
import UserAnnotator from './UserAnnotator'
import Classifier from './Classifier'
import {getImgFilename} from '../../helpers/EditImageHelper'
import { getImageMetadataApiCall } from '../../api/GetImageMetadata'
import styles from './Annotator.module.scss'

/**
 * Annotator component is meant to help the user produce an annotation for an image as an end result
 * It has an AI component for classifying images and generating AI descriptions
 * And a user component for letting the user annotate images
 *
 * @param {ImageInfo} currImage Metadata for image
 * @param {String} ebookId The UUID for the ebook generated by server
 * @component
 * @returns The Annotator Component
 */

function Annotator({ currImage, ebookId }) {
    // TODO: could be used to get the annotation history
    const [userAnnotationList, setUserAnnotationList] = useState([])
    const [aiAnnotationList, setAiAnnotationList] = useState([])
    const [imageId, setImageId] = useState(-1)
    const [currClassification, setCurrClassification] = useState(null)
    const [stage, setStage] = useState("")
    const dropdownRef = useRef(null)
    const saveAiChoiceButtonRef = useRef(null)


    // Executed every time the currentImage changes
    useEffect(() => {
        if (!currImage) {
            // saveButton.current.innerText = 'Select image first'
            // saveButton.current.disabled = true
            setStage('classify')
        } else {
            // saveButton.current.innerText = 'Save annotation'
            // saveButton.current.disabled = false
            setStage("classify")
            
            const imgInfo = currImage
            if (imgInfo) {
                const altText = imgInfo.element.alt
                if (altText) {
                    // Initial alt text of image will be displayed if no HUM annotations yet
                    setUserAnnotationList([altText + " (existing ALT-text)"])
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
                        Object.prototype.hasOwnProperty.call(result, 'annotations')
                    ) {
                        console.log('Annotations: ')
                        console.log(result.annotations)
                        console.log('Image metadata: ')
                        console.log(result.image)
                        // Decorative images don't have image descriptions
                        if (currClassification !== 'Decoration') {
                            setStage('overview')
                        }
                        // For each HUM annotation, add to user annotation list (for display in UserAnnotator)
                        // Note that for now this list always contains 1 HUM annotation
                        result.annotations.forEach((el) => {
                            if (el.type === 'HUM') {
                                setUserAnnotationList([...userAnnotationList, el.text])
                                // Disable button if human annotation was saved earlier
                                // saveButton.current.disabled = true
                            } else {
                                // We don't need to display AI suggestions in the overview
                                    // [...aiAnnotationList, result.annotations
                                        // .filter((el) => el.type !== 'HUM')
                                        // .map(({ text, confidence }) => (JSON.stringify({ text, confidence })))])
                            }
                        })
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


    const options = [
        {abr: 'GOOGL', val: 'Google Vision API'},
    ]

    // TODO: is there a way to allow the user to scroll down to the user box, without having the epub move along?
    // (so they can still see the image when doing the manual annotation)

    return (
        <div className={styles.container}>
            {
                {
                'classify': 
                    <Classifier
                        currImage={currImage}
                        ebookId={ebookId}
                        setImageId={setImageId}
                        currClassification={currClassification}
                        setStage={setStage}>
                        {' '}
                    </Classifier>,
                'ai-selection':
                    <div className={styles.ai_input}>

                        <label htmlFor="selectClass">
                            Please select AI to generate annotations
                        </label>
                        <select
                           
                            ref={dropdownRef}
                            className={styles.dropdown}
                            onChange={() => {
                                saveAiChoiceButtonRef.current.disabled = false
                            }}>
                            <option value="none" selected disabled hidden>
                                Select AI
                            </option>
                            {options.map((opt) => (
                                <option value={opt.val}> {opt.val} </option>
                                // TODO: handle AI selected by user
                                // handleMenuOption(ospt)
                            ))}
                        </select>
                        <button
                            type="button"
                            className={styles.save_button}
                            ref={saveAiChoiceButtonRef}
                            onClick={() => setStage("annotate")}>
                            {' '}
                            Save AI{' '}
                        </button>
                    </div> ,
                'annotate': 
                    <div className={styles.container}>
                        <AIAnnotator
                        annotationList={aiAnnotationList}
                        currImage={currImage}
                        ebookId={ebookId}
                        imageId={imageId} >
                            {' '}
                        </AIAnnotator>
                        <UserAnnotator 
                        annotationList={userAnnotationList} 
                        currImage={currImage}
                        ebookId={ebookId}
                        imageId={imageId}
                        setImageId={setImageId}
                        />
                    </div>,
                'overview' : 
                    <div className={styles.overview}>
                    <div className={styles.overview_info}>
                        <br/>
                        <strong> Classification: </strong> {currClassification}
                        <br/>
                    </div>
                    <div className={styles.overview_info}>
                        <strong> Image description: </strong> 
                        {userAnnotationList[userAnnotationList.length - 1]}
                    </div>
                        <button type="button"
                                    className={styles.save_button}
                                    onClick={() => setStage("classify")}>
                                    Restart image annotation
                        </button>
                    </div>

                }[stage]
            }
        </div>
    )
}

Annotator.propTypes = {
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
}

export default Annotator
