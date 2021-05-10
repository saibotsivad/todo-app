const variables = {}

export const get = key => variables[key]
export const set = (key, value) => { variables[key] = value }
