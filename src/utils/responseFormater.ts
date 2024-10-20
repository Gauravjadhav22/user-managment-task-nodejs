
type FormatResponseParams = {
    data?: any;
    success?: boolean;
    message?: string;
};

export const FormatResponse = ({
    data = [],
    success = true,
    message = "",
}: FormatResponseParams) => {
    return {
        data,
        success,
        message,
    };
};

