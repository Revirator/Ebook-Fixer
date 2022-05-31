import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import styles from './Annotator.module.scss'
import { ImageInfo } from '../../helpers/EditorHelper'
import { getImgFilename } from '../../helpers/EditImageHelper'
import { getGoogleAnnotation, getMicrosoftAnnotation} from '../../api/AnnotateImage'

/**
 * The AIAnnotator handles generating AI image descriptions / labels
 * from different external APIs such as Google Vision or Microsoft Azure.
 * 
 * @param {String[]} aiAnnotationList All labels/descriptions generated by the AI
 * @param {external:SetStateAction} setAiAnnotationList Updates the list of AI annotations 
 * @param {ImageInfo} currImage Metadata for current image under annotation
 * @param {String} ebookId The UUID for the ebook generated by server
 * @param {String} imageId The image id generated by server
 * @param {String} aiChoice The choice of AI selected by user
 * @param {String} sentence The description generated by AI
 * @param {external:SetStateAction} setSentence Updates the description generated by AI
 * @component
 * @returns The AIAnnotator component
 */
function AIAnnotator({aiAnnotationList, setAiAnnotationList, currImage, ebookId, imageId, aiChoice, sentence, setSentence, setStage}) {

    const generateButtonRef = useRef(null)
    const savedTextButton = "Generated"
    const notSavedTextButton = "Get AI suggestions"

    useEffect(() => {

        if (aiAnnotationList.length > 0) {
            // Order annotation labels by confidence descendingly  
            aiAnnotationList.sort((a, b) => b.confidence - a.confidence)
            // Remove duplicate annotations
            // TODO: server should not send duplicates in image metadata view?
            // const uniqueAnnotations = [...new Set(aiAnnotationList)];
            // setAiAnnotationList(uniqueAnnotations)
            generateButtonRef.current.disabled = true
            generateButtonRef.current.innerText = savedTextButton
        } else {
            generateButtonRef.current.disabled = false
        }

    }, [])


    /**
     * 
     * @param {Annotation object} labelObject returned by server
     * Example object:
     * confidence: "0.8987"
     *  id: 1253
     * image: 264
     * text: "Black"
     * type: "GG"
     * @returns CSS classname proportional to confidence, to scale the font size
     */
    function getProportionalClass(labelObject) {
        const classes = [styles.conf_zero, styles.conf_one, styles.conf_two, styles.conf_three,
                        styles.conf_four, styles.conf_five, styles.conf_six, styles.conf_seven,
                        styles.conf_eight, styles.conf_nine, styles.conf_ten]
        const conf = labelObject.confidence
        switch(conf.charAt(2)) {
            case '0':
                if (conf.charAt(0) === '1') {
                    return classes[10]
                }
                return classes[0]
            case '1':
                return classes[1]
            case '2':
                return classes[2]
            case '3':
                return classes[3]
            case '4':
                return classes[4]
            case '5':
                return classes[5]
            case '6':
                return classes[6]
            case '7':
                return classes[7]
            case '8':
                return classes[8]
            case '9':
                return classes[9]
            default:
                return classes[0]
            } 
        }

    /**
     * Makes API call to server for fetching AI annotations
     * and disables "Generate" button
     */
    function handleClick() {
        if (currImage) {
            
            // When only the client is run during development, we still want to inspect this function though
            if (!ebookId) {
                console.log('No e-book UUID stored on client!')
            }

            switch(aiChoice) {
                case 'Google Vision':
                    // Loading spinner while user waits for AI annotations
                    setStage('loading')
                    console.log('Fetching Google Vision labels...')
                     getGoogleAnnotation(
                    ebookId,
                    imageId,
                    getImgFilename(currImage)
                ) .then(result => {
                    setStage('annotate')
                    if (Object.prototype.hasOwnProperty.call(result, "annotations")){ 
                        // Order annotation labels by confidence ascendingly  
                        setAiAnnotationList(result.annotations)
                       }
                })
                break

                case 'Microsoft Azure':
                    // Loading spinner while user waits for AI annotations
                    setStage('loading')
                    console.log('Fetching Microsoft Azure labels and description...')
                    getMicrosoftAnnotation(
                        ebookId,
                        imageId,
                        getImgFilename(currImage)
                    ) .then(result => {
                        setStage('annotate')
                        if (Object.prototype.hasOwnProperty.call(result, "annotations")){
                                setSentence(result.annotations.pop().text)
                                // Order annotation labels by confidence ascendingly
                                setAiAnnotationList(result.annotations)
                           }
                    })
                    break
                
                default :
                    // TODO: hide AI annotator boxes
            }
            
            generateButtonRef.current.disabled = true
            generateButtonRef.current.innerText = savedTextButton
        }
    }

    
        return (
            <div className={styles.ai_control}>
                <label htmlFor="AiLabelsBox" className={styles.box_label}> Generated labels </label>
                <div className={styles.ai_labels_box} id="AiLabelsBox"> 
                    {aiAnnotationList.map((obj) => (<p className={getProportionalClass(obj)}> {obj.text} </p>))} 
                </div>
                {aiChoice === 'Microsoft Azure' &&
                    <div>
                        <label htmlFor="AiSentenceBox" className={styles.box_label}> <br/> Generated description </label>
                        <div className={styles.ai_labels_box} id="AiSentenceBox">
                            {sentence}
                        </div>
                    </div>}
                <button type="button"
                    className={styles.save_button}
                    ref={generateButtonRef}
                    onClick={() => handleClick()}>
                        {notSavedTextButton}
                </button>
            </div>
        )
}

AIAnnotator.propTypes = {
    aiAnnotationList: PropTypes.arrayOf(PropTypes.string).isRequired,
    setAiAnnotationList: PropTypes.func.isRequired,
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
    imageId: PropTypes.string.isRequired,
    aiChoice: PropTypes.string.isRequired,
    sentence: PropTypes.string.isRequired,
    setSentence: PropTypes.func.isRequired,
    setStage: PropTypes.func.isRequired
}

export default AIAnnotator
