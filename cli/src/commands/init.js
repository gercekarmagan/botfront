import chalk from 'chalk';
import shell from 'shelljs';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import { URL } from 'url';
import { Docker } from 'docker-cli-js';
import ora from 'ora';
import inquirer from 'inquirer';
import boxen from 'boxen';
import { dockerComposeUp } from './services';
import { uniqueNamesGenerator } from 'unique-names-generator';
import { getServices, updateProjectFile, generateDockerCompose, failSpinner, startSpinner, succeedSpinner, verifySystem, consoleError, stopSpinner, getMissingImgs, getContainerNames } from '../utils';

const access = promisify(fs.access);
const copy = promisify(ncp);

export async function initCommand(cmd) {
    try {
        await verifySystem();
        let images = {};
        if (cmd) {
            images = Object.assign(images, {
                botfront: cmd.imgBotfront,
                'botfront-api': cmd.imgBotfrontApi,
                rasa: cmd.imgRasa
            });
        }
        
        const currentDirEmpty = fs.readdirSync(process.cwd()).length === 0;
        const ci = cmd && cmd.ci
        const spinner = ci ? null : ora();
        if (!ci && currentDirEmpty) {
            const { current } = await inquirer.prompt({
                type: 'confirm',
                name: 'current',
                message: 'Create a new project in the current directory?',
                default: true
            });
            if (current) return await createProject(null, images);
        }

        if (!ci && !currentDirEmpty){
            const { subDir } = await inquirer.prompt({
                type: 'input',
                name: 'subDir',
                message:
                    'The project will be created in a subdirectory. How do you want to name it?',
                default: uniqueNamesGenerator({ length: 2 }),
            })
            return await createProject(subDir, images)
        }

        if (cmd && cmd.path) {
            return await createProject(cmd.path, images, ci);
        }
        consoleError('No conditions for anything was met. Nothing to do.')
    } catch (e) {
        consoleError(e)
    }
}

async function copyTemplateFilesToProjectDir(targetAbsolutePath, images) {
    try {
        const currentFileUrl = import.meta.url;
        const templateDir = path.resolve(new URL(currentFileUrl).pathname, '../../../project-template');
        await access(templateDir, fs.constants.R_OK);
        await copy(templateDir, targetAbsolutePath, {
            clobber: false
        });
        updateProjectFile(targetAbsolutePath, images)
        generateDockerCompose()
    } catch (e) {
        consoleError(e);
    }
}

export async function pullDockerImages(images, 
        spinner,
        message = `Downloading Docker images... This may take a while, why don\'t you grab a ☕ and read the ${chalk.cyan('http://docs.botfront.io')} 😉?`, 
        ) {  
    const docker = new Docker({});
    startSpinner(spinner, 'Checking Docker images')
    let download = false;
    const timeout = setTimeout(() => {
        startSpinner(spinner, message);
        download = true;
    }, 3000);
    const pullPromises = images.map(i => docker.command(`pull ${i}`));
    try {
        await Promise.all(pullPromises);
        if (download) return succeedSpinner(spinner, 'Docker images ready.');
        return stopSpinner(spinner)
    } catch (e) {
        consoleError(e)
        failSpinner(spinner, 'Could not download Docker images');
        throw(e);
    } finally {
        stopSpinner()
        clearTimeout(timeout);
    }
}

export async function removeDockerImages(spinner = ora()) {  
    const docker = new Docker({});
    startSpinner(spinner, 'Removing Docker images...')
    const rmiPromises = getServices().map(i => docker.command(`rmi ${i}`).catch(()=>{}));
    try {
        await Promise.all(rmiPromises);
        return succeedSpinner(spinner, 'Docker images removed.');
    } catch (e) {
        consoleError(e)
        failSpinner(spinner, 'Could not remove Docker images');
        throw(e);
    } finally {
        stopSpinner()
    }
}

export async function removeDockerContainers(spinner = ora()) {  
    const docker = new Docker({});
    startSpinner(spinner, 'Removing Docker containers...')
    const rmPromises = getContainerNames().map(i => docker.command(`rm ${i}`).catch(()=>{}));
    try {
        await Promise.all(rmPromises);
        return succeedSpinner(spinner, 'Docker containers removed.');
    } catch (e) {
        consoleError(e)
        failSpinner(spinner, 'Could not remove Docker containers');
        throw(e);
    } finally {
        stopSpinner()
    }
}

export async function createProject(targetDirectory, images, ci = false) {
    const spinner = !ci ? ora() : null;
    let projectAbsPath = process.cwd();
    let projectCreatedInAnotherDir = false;
    if (targetDirectory) {
        projectAbsPath = path.join(projectAbsPath, targetDirectory);
        if (fs.existsSync(projectAbsPath)) return console.log(boxen(`${chalk.red('ERROR:')} the directory ${chalk.blueBright.bold(targetDirectory)} already exists. Run ${chalk.cyan.bold('botfront init')} again and choose another directory.`))
        fs.mkdirSync(projectAbsPath);
        shell.cd(projectAbsPath);
        projectCreatedInAnotherDir = true;
    }

    try {
        await copyTemplateFilesToProjectDir(projectAbsPath, images);
        await pullDockerImages(await getMissingImgs(), spinner);
        
        console.log(`\n\n        🎉 🎈 ${chalk.green.bold('Your project is READY')}! 🎉 🎈\n`);
        let message = `Useful commands:\n\n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront up')} to start your project \n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront --help')} to see all you can do with the CLI\n` +
                        `\u2022 Run ${chalk.cyan.bold('botfront docs')} to browse the online documentation`;
        if (projectCreatedInAnotherDir) {
            message += `\n\n${chalk.yellow('IMPORTANT: ')} Your project was created in the ${chalk.bold(targetDirectory)} folder.\nRun ${chalk.cyan.bold(`cd ${targetDirectory}`)} before executing Botfront commands.`;
        }
                    
        console.log(boxen(message, { padding: 1 }) + '\n');
        
        if (!ci) {
            const { start } = await inquirer.prompt({
                type: 'confirm',
                name: 'start',
                message: `${chalk.green.bold('Start your project?')}`,
                default: true
            });    
            if (start) dockerComposeUp({ verbose: false }, null, spinner)
        }

        if (ci) dockerComposeUp({ verbose: false }, null, null)
    } catch (e) {
        consoleError(e)
        process.exit(1)
    }
    return true;
}
