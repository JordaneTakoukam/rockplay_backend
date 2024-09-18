module.exports = {
    version: '1.0.1',
    apps: [
        {
            name: 'api-root',
            script: './server.js',

            log_file: '/var/log/api-root.log', // Fichier de log
            error_file: '/var/log/api-root-error.log', // Fichier de log des erreurs
            out_file: '/var/log/api-root-out.log', // Fichier de log de sortie
            pid_file: '/var/run/api-root.pid', // Fichier PID

            watch: true,
            watch_options: {
                followSymlinks: false,
            },
        },
    ],

};
