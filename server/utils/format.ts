export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
    }).format(amount);
};

export const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR');
};
