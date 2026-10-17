export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context)
  } catch (error) {
    if (
      specifier.startsWith('.') &&
      context.parentURL?.includes('/@material/material-color-utilities/')
    ) {
      return nextResolve(`${specifier}.js`, context)
    }
    throw error
  }
}
