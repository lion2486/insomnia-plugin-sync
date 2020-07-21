### Insomnia Core sync plugin
A simple plugin to sync (upload and download) workspaces via import/export through a web server.

You need a server that can handle GET & POST requests in order to fetch and store insomnia exported workspaces, in JSON files. 

You can click "Sync upload" to upload your workspace, "Sync Download" to download the workspace.

The upload/download is made via the workspace name, but Insomnia will create a new Workspace if the same id doesn't exist (and eventually you will have 2 workspaces with the same name, at the first download).

