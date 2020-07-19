const fs = require('fs')
const axios = require('axios')
const { v4 } = require('uuid')

const storeKey = key => `insomnia-plugin-sync-${key}`

const getOrSetEndpoint = async context => {
  if (await context.store.hasItem(storeKey('endpoint'))) {
    return context.store.getItem(storeKey('endpoint'))
  } else {
    const endpoint = await context.app.prompt('set endpoint')
    await context.store.setItem(storeKey('endpoint'), endpoint)
    return endpoint
  }
}

const depositExport = async content => {
  if (!fs.existsSync(__dirname+'/deposit')) fs.mkdirSync(__dirname+'/deposit')
  fs.writeFileSync(__dirname+'/deposit/'+Date.now()+'_export.json', JSON.stringify(content))
}

module.exports.workspaceActions = [
  {
    label: 'Sync upload',
    icon: 'fa-upload',
    action: async (context, models) => {

      const endpoint = await getOrSetEndpoint(context)

      const workspace = await context.data.export.insomnia({
        includePrivate: false,
        format: 'json',
        workspace: models.workspace,
      })

      const revision = v4()
      await context.store.setItem(storeKey('revision'), revision)

      const data = {
        workspace,
        revision
      }

      await depositExport(data)

      await axios.post(endpoint, data, {
        headers: {'Content-Type': 'application/json'}
      }).then((res) => {
        console.log('insomnia-plugin-sync', 'upload', res)
      }).catch((err) => {
        console.error('insomnia-plugin-sync', 'upload', err)
      })
    }
  },
  {
    label: 'Sync download',
    icon: 'fa-download',
    action: async (context, models) => {
      const endpoint = await getOrSetEndpoint(context)

      await axios.get(endpoint).then((res) => {

        const data = res.data

        if (typeof data !== 'object' || typeof data.workspace === 'undefined') {
          context.app.alert('Invalid API data type. See console...')
          console.warn('sync upload', res.data)
          return
        }

        context.store.setItem(storeKey('revision'), data.revision)
        context.data.import.raw(data.workspace).then((res) => {
          console.log('insomnia-plugin-sync', 'download')
        }).catch((err) => {
          console.error('insomnia-plugin-sync', 'download', err)
        })
      })
    },
  },
  {
    label: 'Sync check',
    icon: 'fa-check',
    action: async (context, models) => {
      const endpoint = await getOrSetEndpoint(context)
      const revision = await context.store.getItem(storeKey('revision'))

      await axios.get(endpoint).then((res) => {
        context.app.alert('Sync plugin', revision === res.data.revision ? 'Up to date' : 'Update ready')
      })
    },
  }

]
