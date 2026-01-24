"""
💬 User-Friendly Error Messages

Maps error codes to user-friendly messages in multiple languages.
"""

ERROR_MESSAGES: dict[str, dict[str, str]] = {
    "VALIDATION_ERROR": {
        "en": "The request contains invalid data. Please check your input and try again.",
        "fr": "La requête contient des données invalides. Veuillez vérifier votre saisie et réessayer.",
    },
    "NOT_FOUND": {
        "en": "The requested resource was not found.",
        "fr": "La ressource demandée n'a pas été trouvée.",
    },
    "AUTHENTICATION_ERROR": {
        "en": "Authentication failed. Please check your credentials and try again.",
        "fr": "L'authentification a échoué. Veuillez vérifier vos identifiants et réessayer.",
    },
    "AUTHORIZATION_ERROR": {
        "en": "You don't have permission to perform this action.",
        "fr": "Vous n'avez pas la permission d'effectuer cette action.",
    },
    "EXTERNAL_SERVICE_ERROR": {
        "en": "An external service is temporarily unavailable. Please try again later.",
        "fr": "Un service externe est temporairement indisponible. Veuillez réessayer plus tard.",
    },
    "PROCESSING_ERROR": {
        "en": "Failed to process the request. Please try again or contact support.",
        "fr": "Échec du traitement de la requête. Veuillez réessayer ou contacter le support.",
    },
    "STORAGE_ERROR": {
        "en": "A storage error occurred. Please try again later.",
        "fr": "Une erreur de stockage s'est produite. Veuillez réessayer plus tard.",
    },
    "RATE_LIMIT_ERROR": {
        "en": "Too many requests. Please wait a moment and try again.",
        "fr": "Trop de requêtes. Veuillez attendre un moment et réessayer.",
    },
    "INTERNAL_SERVER_ERROR": {
        "en": "An unexpected error occurred. Our team has been notified.",
        "fr": "Une erreur inattendue s'est produite. Notre équipe a été informée.",
    },
}


def get_user_friendly_message(error_code: str, language: str = "en") -> str:
    """
    Get a user-friendly error message for an error code.
    
    Args:
        error_code: The error code
        language: Language preference (en/fr)
    
    Returns:
        User-friendly error message
    """
    messages = ERROR_MESSAGES.get(error_code, {})
    return messages.get(language, messages.get("en", "An error occurred."))

