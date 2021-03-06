import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './Annotator.module.scss'
import { classifyImageApiCall } from '../../api/ClassifyImage'
import { ImageInfo } from '../../helpers/EditorHelper'
import {
    getImgFilename,
    getLocation,
    getRawContext,
} from '../../helpers/EditImageHelper'

/**
 * The Classifier component is in charge of letting the user classify the image under annotation.
 * Decorative images will not be annotated.
 * 
 * @param {ImageInfo} currImage Metadata for current image under annotation
 * Note that changing of the image is propagated to this child
 * @param {String} ebookId The UUID for the ebook generated by server
 * @param {external:SetStateAction} setImageId Updates image id stored on client, generated by server
 * @param {String} currClassification Classification for this image stored on server
 * @param {external:SetStateAction} setCurrClassification Sets the current classification
 * @param {external:SetStateAction} setStage Sets next stage in annotation process 
 * @component
 * @returns The Classifier component
 */
function Classifier({ currImage, ebookId, setImageId, currClassification, setCurrClassification, setStage }) {

    // References/hooks to React DOM elements
    const saveButtonRef = useRef(null)
    const dropdownRef = useRef(null)

    // Creates a hook that executes the arrow func. every time imageSelected or classification changes
    useEffect(() => {
        if (!currImage) {
            saveButtonRef.current.disabled = true
            saveButtonRef.current.innerText = 'Select image first'
        } else {
            saveButtonRef.current.disabled = false
            saveButtonRef.current.innerText = 'Save classification'

            if (currClassification != null) {
                saveButtonRef.current.disabled = true
                // Show the selected classification
                const idx = options.findIndex(opt => opt.val === currClassification || opt.abr === currClassification) + 1;
                dropdownRef.current.selectedIndex = idx;
            } else {
                // Show the label
                dropdownRef.current.selectedIndex = 0
                saveButtonRef.current.disabled = false
            }
        }
    }, [currImage, currClassification])

    /**
     * @returns the currently selected classification
     */
    function getClassification() {
        if (currImage) {
            const choice =
                dropdownRef.current.options[dropdownRef.current.selectedIndex]
                    .value
            if (choice === 'Decoration') {
                // TODO: for now this is only an alert, but this may be changed still
                window.alert(
                    'Decorative images should not be annotated, please proceed to next image.'
                )
            }
            if (dropdownRef.current.selectedIndex === 0) {
                window.alert('This option is not allowed!')
                return 'Invalid'
            }
            return choice
        }
    }

    /**
     * Makes API call to server and disables "Save" button
     */
    function handleSubmit() {
        if (currImage) {
            // When only the client is run during development, we still want to inspect this function though
            if (!ebookId) {
                console.log('No e-book UUID stored on client!')
            }
            // Store current classification for this image on client (but will only be fetched from server when image changes)
            const choice = getClassification()
            setCurrClassification(choice)

            classifyImageApiCall(
                ebookId,
                getImgFilename(currImage),
                getLocation(currImage),
                choice,
                getRawContext(currImage)
            ).then((result) => {
                // console.log(JSON.stringify(result));
                // Keep image id up to date after classifying
                if (Object.prototype.hasOwnProperty.call(result, 'id')) {
                    setImageId(result.id)
                }
            })

            if (choice !== 'Invalid') {
                saveButtonRef.current.disabled = true
                saveButtonRef.current.innerText = 'Classification Saved'
            } else {
                saveButtonRef.current.disabled = false
            }

            // For decorative images, user will not proceed to next stage
            if (choice !== 'Decoration' && choice !== 'Invalid') {
                setStage('ai-selection')
            } 
        }
    }

    const options = [
        {abr: 'DECO', val: 'Decoration'},
        {abr: 'INFO', val: 'Information'},
        {abr: 'PHOTO', val: 'Photo'},
        {abr: 'ILLUS', val: 'Illustration'},
        {abr: 'FIG', val: 'Figure'},
        {abr: 'SYM', val: 'Symbol'},
        {abr: 'ART', val: 'Art'},
        {abr: 'SIG', val: 'Signature'},
        {abr: 'TXT', val: 'Text'},
        {abr: 'FLAG', val: 'Flag'},
        {abr: 'COM', val: 'Comic'},
        {abr: 'LOGO', val: 'Logo'},
        {abr: 'GRAPH', val: 'Graph'},
        {abr: 'MAP', val: 'Map'},
    ]

    return (
        <div className={styles.ai_input}>
            <label htmlFor="selectClass">
                Please classify your selected image
            </label>
            <select
                name="selectedClass"
                id="selectClass"
                ref={dropdownRef}
                className={styles.dropdown}
                onClick={() => {
                    saveButtonRef.current.disabled = false
                }}>
                <option value="none" selected disabled hidden>
                    Classify image
                </option>
                {options.map((opt) => (
                    <option value={opt.val}> {opt.val} </option>
                ))}
            </select>
            <button
                type="button"
                className={styles.save_button}
                ref={saveButtonRef}
                onClick={() => handleSubmit()}>
                {' '}
                Save classification{' '}
            </button>
        </div>
    )
}

Classifier.propTypes = {
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
    setImageId: PropTypes.func.isRequired,
    currClassification: PropTypes.string.isRequired,
    setCurrClassification: PropTypes.func.isRequired,
    setStage: PropTypes.func.isRequired,
}

export default Classifier
