import mongoose from "mongoose";
const { Schema, model } = mongoose;

const reviewSchema = new Schema({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
  commentReplies: [Object],
}, { timestamps: true });

const linkSchema = new Schema({
  title: String,
  url: String,
});

const commentSchema = new Schema({
  user: Object,
  question: String,
  questionReplies: [Object],
}, { timestamps: true });

const quizSchema = new Schema({
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      option: String,
      isCorrect: Boolean,
    },
  ],
}, { timestamps: true });

const courseDataSchema = new Schema({
  videoUrl: String,
  videoThumbnail: Object,
  title: String,
  videoSection: String,
  description: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  suggestion: String,
  questions: [commentSchema],
});

const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  categories: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  estimatedPrice: {
    type: Number,
  },
  thumbnail: {
    public_id: String,
    url: String,
  },
  tags: {
    type: String,
    required: true,
  },

  pdf: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },

  
  level: {
    type: String,
    required: true,
  },
  demoUrl: {
    type: String,
    required: true,
  },
  benefits: [{ title: String }],
  prerequisites: [{ title: String }],

  reviews: [reviewSchema],
  courseData: [courseDataSchema],
  quizzes: [quizSchema],
  ratings: {
    type: Number,
    default: 0,
  },
  purchased: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const CourseModel = model("Course", courseSchema);

export default CourseModel;