const { spawn } = require('child_process');

const listMonorepoDeps = () => new Promise((resolve, reject) => {
    const proc = spawn('pnpm', ['list', '-r', '--json', '--long']);

    const results = [];
    const errors = [];

    proc.stdout.on('data', data => {
        results.push(data);
    });

    proc.stderr.on('data', error => {
        console.error(`stderr: ${data}`);
        errors.push(error);
    });

    proc.on('close', code => {
        console.log(`child process exited with code ${code}`);
        if (errors.length > 0) {
            return resolve(errors);
        }

        const jsonResult = JSON.parse(results.join(''));
        resolve(jsonResult);
    });
});

module.exports = listMonorepoDeps;
