module.exports = {
    version: 1, // Version de la configuration
    apps: [
      {
        name: 'api-root', // Nom de l'application
        script: './server.js', // Point d'entrée de l'application
        instances: 'max', // Nombre d'instances, 'max' utilise autant de processus que de cœurs CPU disponibles
        exec_mode: 'cluster', // Mode d'exécution en cluster
        log_file: '/var/log/api-root.log', // Fichier de log
        error_file: '/var/log/api-root-error.log', // Fichier de log des erreurs
        out_file: '/var/log/api-root-out.log', // Fichier de log de sortie
        pid_file: '/var/run/api-root.pid', // Fichier PID
      },
    ],
  };
  