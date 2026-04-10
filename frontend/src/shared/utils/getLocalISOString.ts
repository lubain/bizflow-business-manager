// Fonction utilitaire pour convertir une date locale en ISO string avec le bon fuseau horaire
export const getLocalISOString = (date: Date): string => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString();
};