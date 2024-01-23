export function debounce<T extends any[]>(callback: (...args: T) => void, delay = 250) {
    let timer: any;
    return (...args: T) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback(...args);
        }, delay);
    };
};
