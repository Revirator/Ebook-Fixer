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

                // loading or rejected epub
                return response.json()
            }
            throw new Error('Response code: ' + response.status, {
                cause: response.status,
            })
        })
        .then((response) => response)
        .catch((error) => {
            throw error
        })
}

export function pollForFile(fileId, processStatusFunc) {
    processStatusFunc('Polling...')
    processStatusFunc('Polling...')
    return getFileBlob(fileId)
        .then((file) => {
            if (file.status) {
                // Process status
                console.log(file)
                processStatusFunc(file.status)
                setTimeout(() => pollForFile(fileId, processStatusFunc), 1000)
            } else {
                return file
            }
        })
        .catch((err) => {
            throw err
        })
}
