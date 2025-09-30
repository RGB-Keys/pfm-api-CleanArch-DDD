export const validateString = (
	value: string | null | undefined,
	fieldName: string,
) => {
	if (!value || value.trim().length === 0) {
		throw new Error(`${fieldName} não pode ser vazio`)
	}
}
