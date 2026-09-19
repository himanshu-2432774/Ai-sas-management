const swaggerJsdoc = require("swagger-jsdoc");

const backendUrl =
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "AI SaaS Management API",
            version: "1.0.0",
            description: "API documentation for AI SaaS Management System"
        },

        servers: [
            {
                url: backendUrl
            }
        ],

        tags: [
            {
                name: "Admin",
                description: "Admin management and analytics APIs"
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },

        security: [
            {
                bearerAuth: []
            }
        ],

        paths: {
            //api/admin/users
               "/api/admin/users": {
         get: {
        tags: ["Admin"],
        summary: "Get all users",
        description: "Returns a list of all registered users. Admin access is required.",

        security: [
            {
                bearerAuth: []
            }
        ],

        responses: {
            200: {
                description: "Users fetched successfully",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                count: {
                                    type: "integer",
                                    example: 1
                                },
                                users: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            _id: {
                                                type: "string",
                                                example: "68b9c123456789abcdef1234"
                                            },
                                            name: {
                                                type: "string",
                                                example: "Himanshu"
                                            },
                                            email: {
                                                type: "string",
                                                example: "user@example.com"
                                            },
                                            role: {
                                                type: "string",
                                                example: "user"
                                            },
                                            plan: {
                                                type: "string",
                                                example: "free"
                                            },
                                            credits: {
                                                type: "integer",
                                                example: 10
                                            },
                                            isVerified: {
                                                type: "boolean",
                                                example: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },

            401: {
                description: "Unauthorized - JWT token required"
            },

            403: {
                description: "Forbidden - Admin access required"
            },

            500: {
                description: "Internal server error"
            }
        }
    }
},
            // ==========================================
            // ADMIN STATS
            // ==========================================

            "/api/admin/stats": {
                get: {
                    tags: ["Admin"],
                    summary: "Get admin statistics",
                    description:
                        "Returns overall statistics for the admin dashboard.",

                    security: [
                        {
                            bearerAuth: []
                        }
                    ],

                    responses: {
                        200: {
                            description:
                                "Admin statistics fetched successfully"
                        },

                        401: {
                            description: "Unauthorized - JWT token required"
                        },

                        403: {
                            description:
                                "Forbidden - Admin access required"
                        },

                        500: {
                            description: "Internal server error"
                        }
                    }
                }
            },

            // ==========================================
            // ADMIN SERVICE STATS
            // ==========================================

            "/api/admin/stats/services": {
                get: {
                    tags: ["Admin"],
                    summary: "Get service statistics",
                    description:
                        "Returns usage statistics for AI SaaS services.",

                    security: [
                        {
                            bearerAuth: []
                        }
                    ],

                    responses: {
                        200: {
                            description:
                                "Service statistics fetched successfully"
                        },

                        401: {
                            description: "Unauthorized - JWT token required"
                        },

                        403: {
                            description:
                                "Forbidden - Admin access required"
                        },

                        500: {
                            description: "Internal server error"
                        }
                    }
                }
            }
        }
    },

    apis: [
        "./routes/*.js",
        "./routes/v1/*.js"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;