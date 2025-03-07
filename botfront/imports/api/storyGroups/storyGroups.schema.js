import SimpleSchema from 'simpl-schema';

export const StoryGroupSchema = new SimpleSchema(
    {
        name: { type: String },
        projectId: { type: String },
        createdAt: {
            type: Date,
            optional: true,
        },
        updatedAt: {
            type: Date,
            optional: true,
            autoValue: () => new Date(),
        },
    },
    { tracker: Tracker },
);
