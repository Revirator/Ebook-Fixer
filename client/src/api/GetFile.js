/**
 * makes a get request to get the file with given id from the server
 *
 * @category API
 * @param {String} fileId
 * @returns the file as a blob
 * @throws error if the file is not found
 * @see Server Documentation for description of request & response
 */
export function getFileBlob(fileId) {
    return fetch(
        process.env.REACT_APP_API_URL +
            'ebooks/download/' +
            fileId +
            '/?' +
            new URLSearchParams({
                inject: 'false',
            }) +
            '',
        {
            method: 'GET',
        }
    )
        .then((response) => {
            if (response.ok) {
                if (response.status === 200) {
                    return response.blob()
                }

                // loading epub
                return response.json()
            }
            // Error occured
            throw new BadEpubError(response)
        })
        .then((response) => response)
        .catch((error) => {
            throw error
        })
}

// Error with json and statusCode as well as message
export class BadEpubError extends Error {
    constructor(response) {
        if (response.status === 404) {
            super('Not Found')
        } else {
            super('Invalid State')
        }
        this.json = response.json()
        this.statusCode = response.status
    }
}

const stateMessages = {
    VALIDATING: 'Validating EPUB...',
    UNZIPPING: 'Unzipping EPUB...',
    CONVERTING: 'Converting EPUB...',
    MAKING_ACCESSIBLE: 'Making the EPUB accessible...',
    PROCESSED: 'Processing complete.',
}

const invalidstateMessages = {
    INVALID: 'The EPUB failed EPUBCheck.',
    UNZIPPING_FAILED: 'Unzipping the EPUB failed.',
    CONVERSION_FAILED: 'Converting the EPUB failed.',
    NOT_ACCESSIBLE: 'The EPUB is not accessible.',
}

// compares the state of the message to pre-defined states above
export function interpretServerMessage(msg) {
    if (!msg.state) return 'Received file'
    // Ok state
    if (stateMessages[msg.state]) {
        return stateMessages[msg.state]
    }
    // Error state
    if (invalidstateMessages[msg.state]) {
        return invalidstateMessages[msg.state]
    }
    // Unknown state
    return 'Unknown'
}

/**
 * This function polls the server for the ePub file every 1 second,
 * logging intermediate results and
 * throwing errors if the server rejects / doesn't find the e-book
 *
 * @param {String} fileId The id of the file to poll for
 * @param {Function} processStateFunc the function used to log / process the intermediate respenses of the server
 * @returns
 */
export function pollForFile(fileId, processStateFunc, setEpubCheckReport) {
    return getFileBlob(fileId)
        .then((file) => {
            if (file.state) {
                // Process state
                processStateFunc(interpretServerMessage(file))

                if (
                    file.checker_issues &&
                    file.checker_issues !== '[]' &&
                    setEpubCheckReport
                ) {
                    setEpubCheckReport(file.checker_issues)
                }

                return new Promise((resolve, reject) => {
                    setTimeout(
                        () =>
                            resolve(
                                pollForFile(
                                    fileId,
                                    processStateFunc,
                                    setEpubCheckReport
                                )
                            ),
                        1000
                    )
                })
            }
            return file
        })
        .catch((err) => {
            throw err
        })
}
