const express = require('express');
const cors = require('cors')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const bodyParser = require('body-parser');
const passport = require('passport');
const appConfig = require('../config/app.config')
const checkAdminMiddleware = require('./lib/common').checkAdminMiddleware



module.exports = app => {
  app.use(cors())
  // load the .env.development file ; it loads a bunch of environment variables
  // we are not doing this for production, where the variables are coming from the actual environment
  if (appConfig.nodeEnvironment !== 'production' || appConfig.forceDotEnv ){
      console.log(`Importing .env file : ${__dirname}/../.env.${appConfig.nodeEnvironment}` )
      require('dotenv').config({ path: `${__dirname}/../.env.${appConfig.nodeEnvironment}` })
  }
  const logger = require('./lib/logger');
  require('./auth/auth');

  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }))
  // parse requests of content-type - application/json
  app.use(bodyParser.json());
  // set the default file
  app.use(express.static(__dirname + '/public',{index: 'index.html'}));
  // import api routes
  const awxRoutes = require('./routes/awx.routes')
  const ansibleRoutes = require('./routes/ansible.routes')
  const queryRoutes = require('./routes/query.routes')
  const expressionRoutes = require('./routes/expression.routes')
  const userRoutes = require('./routes/user.routes')
  const groupRoutes = require('./routes/group.routes')
  const ldapRoutes = require('./routes/ldap.routes')
  const credentialRoutes = require('./routes/credential.routes')
  const formRoutes = require('./routes/form.routes')
  const loginRoutes = require('./routes/login.routes')
  const schemaRoutes = require('./routes/schema.routes')
  const tokenRoutes = require('./routes/token.routes')
  const configRoutes = require('./routes/config.routes')

  // using json web tokens as middleware
  const authobj = passport.authenticate('jwt', { session: false })

  // import vue routes
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/api/v1/auth', loginRoutes)
  app.use('/api/v1/schema', schemaRoutes)
  app.use('/api/v1/token', tokenRoutes)
  app.use('/api/v1/awx', authobj, awxRoutes)
  app.use('/api/v1/ansible', authobj, ansibleRoutes)
  app.use('/api/v1/query', authobj, queryRoutes)
  app.use('/api/v1/expression', authobj, expressionRoutes)
  app.use('/api/v1/user', authobj, checkAdminMiddleware, userRoutes)
  app.use('/api/v1/group', authobj, checkAdminMiddleware, groupRoutes)
  app.use('/api/v1/ldap', authobj, checkAdminMiddleware, ldapRoutes)
  app.use('/api/v1/credential', authobj, checkAdminMiddleware, credentialRoutes)
  app.use('/api/v1/config', authobj, configRoutes)
}
