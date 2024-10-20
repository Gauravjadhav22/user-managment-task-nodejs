class CustomError extends Error {
    status: number;
    success: boolean;
    data: [];

    constructor({ success = false, message, status = 200, data = [] }: { success?: boolean; message: string; status?: number, data?: [] }) {
        super(message);
        this.status = status;
        this.success = success;
        this.data = data
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}

export default CustomError;
