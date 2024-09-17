module.exports = {
    version: 1, // Version de la configuration
    apps: [
        {
            name: 'service-crash', // Nom de l'application
            script: './app.js', // Point d'entrée de l'application
            //instances: 'max', // Nombre d'instances, 'max' utilise autant de processus que de cœurs CPU disponibles
            //exec_mode: 'cluster', // Mode d'exécution en cluster
            log_file: '/var/log/service-crash.log', // Fichier de log
            error_file: '/var/log/service-crash-error.log', // Fichier de log des erreurs
            out_file: '/var/log/api-root-out.log', // Fichier de log de sortie
            pid_file: '/var/run/api-root.pid', // Fichier PID

            watch: true,  // Activer la surveillance des fichiers pour redémarrer l'application en cas de changement
            // ignore_watch: ['public'],  // Ignorer les changements dans ces répertoires pour éviter les redémarrages inutiles
            watch_options: {
              followSymlinks: false,  // Ne pas suivre les liens symboliques pour éviter des comportements inattendus
            },
      
        },
    ],

};
