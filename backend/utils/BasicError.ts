type BasicError = {
    msg: string
}

const basicError = (msg: string): BasicError => {
    return {
        msg
    }
}

export default basicError