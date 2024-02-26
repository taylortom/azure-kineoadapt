export default {
  'adapt-authoring-assets': {
    maxFileSize: '500MB'
  },
  'adapt-authoring-logger': {
    levels: [
      'info',
      'warn',
      'error',
      'debug'
    ]
  },
  'adapt-authoring-mongodblogger': {
    maxLogCount: -1
  },
  'adapt-authoring-server': {
    port: process.env.PORT,
    verboseErrorLogging: true
  }
}
