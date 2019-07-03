import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { StoryGroups } from './storyGroups.collection';
import { StoryGroupSchema } from './storyGroups.schema';

Meteor.methods({
    'storyGroups.delete'(storyGroup) {
        check(storyGroup, Object);
        return StoryGroups.remove(storyGroup);
    },

    'storyGroups.insert'(storyGroup) {
        check(storyGroup, Object);
        StoryGroupSchema.validate(storyGroup, { check });
        return StoryGroups.insert(storyGroup);
    },

    'storyGroups.update'(storyGroup) {
        check(storyGroup, Object);
        return StoryGroups.update({ _id: storyGroup._id }, { $set: storyGroup });
    },
});
