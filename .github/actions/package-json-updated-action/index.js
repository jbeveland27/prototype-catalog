const { setOutput, setFailed, getInput } = require('@actions/core');
const { GitHub, context } = require('@actions/github');

const getPackageJson = async (ref, octokit) => {
    // const wd = process.env[`GITHUB_WORKSPACE`] || "";
    // const inputPath = core.getInput("path", { required: true });
    // const packageJsonPath = path.join(wd, inputPath, "package.json");

    const packageJSONData = (await octokit.repos.getContents({
        ...context.repo,
        path: 'package.json',
        ref,
    })).data.content;
    if (!packageJSONData) {
        throw new Error(`Could not find package.json for commit ${ref}`);
    }
    return JSON.parse(Buffer.from(packageJSONData, 'base64').toString());


    /**
     * Need to play with this idea and see how we can get the owner, repo, and path
     * from the forked repo (that's submitting the PR) to do a diff on the
     * contents of package.json
     * 
     * ref: https://github.com/octokit/rest.js/issues/845
     * 
     */
    // octokit.repos.getContent({
    //     owner: 'octokit',
    //     repo: 'rest.js',
    //     path: 'examples/getContent.js'
    // }).then(result => {
    //     // content will be base64 encoded
    //     const content = Buffer.from(result.data.content, 'base64').toString()
    //     console.log(content)
    // })
};

const run = async () => {
    const token = process.env['GITHUB_TOKEN'];
    if (!token) {
        throw new Error('GITHUB_TOKEN not provided');
    }

    const octokit = new GitHub(token);
    // const currentRef = context.sha;
    // const previousRef = ((await octokit.repos.getCommit({
    //     ...context.repo,
    //     ref: currentRef,
    // })).data.parents[0] || {}).sha;
    const currentRef = getInput('currentRef');
    const previousRef = getInput('previousRef');

    const currentPackageJSON = await getPackageJson(currentRef, octokit);
    setOutput('current-package-version', currentPackageJSON.version);

    if (!previousRef) {
        setOutput('has-updated', true);
        return;
    }

    const previousPackageJSON = await getPackageJson(previousRef, octokit);
    setOutput('has-updated', currentPackageJSON.version !== previousPackageJSON.version);
}

run().catch(error => {
    setFailed(error.message);
});