import React, { useEffect, useState } from 'react'
import styles from './Annotator.module.scss'
import { ReactComponent as HistorySVG } from '../../assets/svgs/history-icon.svg'
import AIannotator from './AIannotator'
import { ImageInfo } from '../../helpers/EditorHelper'

/**
 * The user Annotator component has a textbox with a button for the history of the annotations for that image.
 * It should receive the history of the annotations.
 * And a function to save the annotation somewhere once the user types it.
 *
 * @param {{annotationList: List of Strings}} List of the annotations for this image
 * @returns The UserAnnotator component
 */
function UserAnnotator(props) {
    const [typing, setTyping] = useState(false)
    const [textValue, setTextValue] = useState('')

    useEffect(() => {
        const list = props.annotationList
        if (list.length > 0) {
            // Display the latest human annotation
            setTextValue(list[list.length - 1])
        } else {
            // No img alt attribute
            setTextValue('')
        }
    }, [props.annotationList])

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
                }} />
            <button
                className={
                    styles.icon + ' ' + (typing ? styles.transparent : '')
                }>
                <HistorySVG title="Annotation History" />
            </button>
        </div>
    )
}

/**
 * Annotator component is meant to help the user produce an annotation for an image as an end result
 * It has an AI component for classifying images and generating AI descriptions
 * And a user component for letting the user annotate images
 *
 * @param {{currImage: ImageInfo}} props The props of the component
 * @param {{currEbook: EbookInfo}} props The props of the component
 * @param {{ebookId: The UUID for the ebook generated by server}} props The props of the component
 * @returns Tha Anotator Component
 */
function Annotator(props) {
    const [userAnnotationList, setUserAnnotationList] = useState([])

    // Executed every time the currentImage changes
    useEffect(() => {
        const imgInfo = props.currImage
        if (imgInfo) {
            console.log(imgInfo)
            const altText = imgInfo.element.alt
            if (altText) {
                // Initial human annotation is the existing ALT-text
                setUserAnnotationList([altText])
            } else {
                // The image has no alt text
                setUserAnnotationList([])
            }
        }
    }, [props.currImage])

    return (
        <div className={styles.container}>
            <AIannotator currImage={props.currImage} ebookId={props.ebookId}>
                {' '}
            </AIannotator>
            <UserAnnotator annotationList={userAnnotationList} />
            <button className={styles.save_button}>Save Annotation</button>
        </div>
    )
}

export default Annotator
