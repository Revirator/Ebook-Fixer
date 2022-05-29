import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import styles from './Annotator.module.scss'
import { ImageInfo} from '../../helpers/EditorHelper'
import {getImgFilename} from '../../helpers/EditImageHelper'
import {  getAiAnnotation} from '../../api/AnnotateImage'

/**
 * Handles generating AI image descriptions / labels
 * 
 * @param {{annotationList: List of Strings}} props all labels/descriptions generated by the AI
 * @param {{currImage: ImageInfo}} props Metadata for image
 * @param {{ebookId: String}} props The UUID for the ebook generated by server
 * @param {{imageId: String}} props The image id generated by server
 * @param {{aiChoice: String}} props The choice of AI selected
 * 
 * @returns The AIAnnotator component
 */
function AIAnnotator({annotationList, currImage, ebookId, imageId, aiChoice}) {

    const generateButtonRef = useRef(null)
    const [labels, setLabels] = useState([])

    useEffect(() => {
        if (!currImage) {
            generateButtonRef.current.disabled = true
            generateButtonRef.current.innerText = "Generated"
            
        } else {
            generateButtonRef.current.disabled = false
            generateButtonRef.current.innerText = "Generate"
            setLabels([])
            
        }

        const list = annotationList
        if (list.length > 0) {
            // Display the latest ai annotation
            setLabels(list[list.length - 1])
        } else {
            // No img alt attribute
            setLabels([])
        }
        
    }, [currImage, annotationList])


    /**
     * 
     * @param {Annotation object} labelObject returned by server
     * Example object:
     * confidence: "0.8987"
     *  id: 1253
     * image: 264
     * text: "Black"
     * type: "BB"
     * @returns CSS classname proportional to confidence, to scale the font size
     */
    function getProportionalClass(labelObject) {
        const classes = [
            styles.conf_zero,
            styles.conf_one, 
            styles.conf_two, 
            styles.conf_three,
            styles.conf_four, 
            styles.conf_five,
            styles.conf_six, 
            styles.conf_seven, 
            styles.conf_eight,
            styles.conf_nine 
        ]
        const conf = labelObject.confidence
        switch(conf.charAt(2)) {
            case '0':
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
    



    function handleClick() {
        if (currImage) {
            // When only the client is run during development, we still want to inspect this function though
            if (!ebookId) {
                console.log('No e-book UUID stored on client!')
            }
            switch(aiChoice) {
                case 'GOOGL':
                     getAiAnnotation(
                    ebookId,
                    imageId,
                    getImgFilename(currImage)
                ) .then(result => {
                //    console.log(JSON.stringify(result));
                    if (Object.prototype.hasOwnProperty.call(result, "annotations")){
                            setLabels(result.annotations)
                       }
                })
                break

                case 'MICRO' :
                    // change when endpoints are updated
                    getAiAnnotation(
                        ebookId,
                        imageId,
                        getImgFilename(currImage)
                    ) .then(result => {
                    //    console.log(JSON.stringify(result));
                        if (Object.prototype.hasOwnProperty.call(result, "annotations")){
                                setLabels(result.annotations)
                           }
                    })
                    break
                
                default :
                    // hide ai annotator box
            }
            
            generateButtonRef.current.disabled = true
            generateButtonRef.current.innerText = "Generated"
            // generateRef.current.style.visibility = 'hidden'
        }
    }

    
        return (
            <div className={styles.ai_control}>
                <label htmlFor="AiLabelsBox" className={styles.box_label}> Generated Labels </label>
                <div className={styles.ai_labels_box} id="AiLabelsBox"> 
                    {labels.map((obj) => (<p className={getProportionalClass(obj)}> {obj.text} </p>))} 
                </div>
                {aiChoice=='MICRO' &&
                    <div className={styles.ai_control}>
                        <label htmlFor="AiSentanceBox" className={styles.box_label}> Generated Annotation </label>
                        <div className={styles.ai_labels_box}>
                            MY SENTANCE
                        </div>
                    </div>}
                <button type="button"
                className={styles.save_button}
                ref={generateButtonRef}
                onClick={() => handleClick()}>
                Get AI suggestions
                </button>
            </div>
        )
}

AIAnnotator.propTypes = {
    annotationList: PropTypes.arrayOf(PropTypes.string).isRequired,
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
    imageId: PropTypes.string.isRequired,
    aiChoice: PropTypes.string.isRequired,
}

export default AIAnnotator