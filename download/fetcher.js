import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";

document.addEventListener("DOMContentLoaded", () => {
    // const repoInput = document.getElementById("repoInput");
    // const tokenInput = document.getElementById("tokenInput");
    // const fetchBtn = document.getElementById("fetchBtn");
    const statusLog = document.getElementById("statusLog");
    const statusOutput = document.getElementById("statusOutput");
    const fileListElement = document.getElementById("fileList");
    const fileListWrapper = document.getElementById("fileListWrapper");
    // const toggleTokenBtn = document.getElementById("toggleTokenBtn");
    // const tokenInfo = document.getElementById("tokenInfo");

    let fetchedFiles = [];
    let progressPercentage = 0;

    const updateStatus = (message) => {
        statusLog.textContent = message;
        statusOutput.style.display = "block";
    };

    const updateProgress = (percent) => {
        progressPercentage = percent;
        statusLog.style.background = `linear-gradient(to right, rgba(100, 255, 218, 0.3) ${percent}%, transparent ${percent}%)`;
        statusLog.innerHTML = `${statusLog.textContent} <span style="color: #64FFDA;">${percent}% Complete</span>`;
    };

    const fetchFolderContents = async (octokit, owner, repo, path) => {
        const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
        });
        return response.data;
    };

    const fetchFileContent = async (octokit, owner, repo, path, fileName, totalSize) => {
        const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            mediaType: {
                format: "raw",
            },
        });
        updateStatus(`Fetching ${fileName}`);
        updateProgress(100);
        return response.data;
    };

    const processFolderContents = async (octokit, owner, repo, folder, zip, path = "") => {
        for (const item of folder) {
            if (item.type === "file") {
                updateStatus(`Queueing fetch of ${item.name}`);
                const fileContent = await fetchFileContent(octokit, owner, repo, item.path, item.name, item.size);
                fetchedFiles.push(item);
                updateFileList();
                zip.file(item.name, fileContent);
            } else if (item.type === "dir") {
                const subFolder = await fetchFolderContents(octokit, owner, repo, item.path);
                const subFolderZip = zip.folder(item.name);
                await processFolderContents(octokit, owner, repo, subFolder, subFolderZip, item.path);
            }
        }
    };

    const fetchRepositoryContents = async (octokit, owner, repo, path) => {
        try {
            const folderData = await fetchFolderContents(octokit, owner, repo, path);
            const zip = new JSZip();
            await processFolderContents(octokit, owner, repo, folderData, zip, path);
            return zip;
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    };

    const updateFileList = () => {
        fileListElement.innerHTML = "";
        fetchedFiles.forEach((file) => {
            const li = document.createElement("li");
            li.textContent = file.name;
            fileListElement.appendChild(li);
        });
        fileListWrapper.style.display = "block";
        fileListElement.scrollTop = fileListElement.scrollHeight;
    };

    const fetchRepo = async () => {
        updateStatus("");
        fetchedFiles = [];
        fileListWrapper.style.display = "none";
        const urlParams = new URLSearchParams(document.location.search);
        // const repoUrl = decodeURIComponent(urlParams.repo);
        const owner = decodeURIComponent(urlParams.get('owner'));
        const repo = decodeURIComponent(urlParams.get('repo'));
        const path = decodeURIComponent(urlParams.get('path'));
        const token = decodeURIComponent(urlParams.get('token'));

        // if (!repoUrl.includes("github.com")) {
        //     updateStatus("Invalid URL. Please enter a valid GitHub repository URL.");
        //     return;
        // }

        // const [, , , owner, repo, , , ...dirParts] = repoUrl.split("/");
        // const path = dirParts.join("/");

        const octokit = new Octokit({ auth: token });

        updateStatus("Fetching repository contents...");
        try {
            const zip = await fetchRepositoryContents(octokit, owner, repo, path);

            updateStatus("Compressing files...");
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${path ? path.replace(/\/|%20/g, "-") : repo}.zip`);

            const fileList = zip.file(/.*/);

            updateProgress(0);
            updateStatus(
                `Fetched ${fileList.length} files\nUser: ${owner}\nRepository: https://github.com/${owner}/${repo}\nFolder: ${path}\nSize: ${(
                    content.size /
                    1024 /
                    1024
                ).toFixed(2)} MB`
            );
        } catch (error) {
            if (error.status === 403) {
                updateStatus("Rate limit exceeded. Please try again in a few minutes or use a GitHub Personal Access Token.");
            } else {
                updateStatus(`Error: ${error.message}`);
            }
        }
    };

    // fetchBtn.addEventListener("click", fetchRepo);
    // repoInput.addEventListener("keydown", (e) => {
    //     if (e.key === "Enter") {
    //         fetchRepo();
    //     }
    // });

    // toggleTokenBtn.addEventListener("click", () => {
    //     const isHidden = tokenInput.style.display === "none";
    //     tokenInput.style.display = isHidden ? "block" : "none";
    //     tokenInfo.style.display = isHidden ? "block" : "none";
    //     toggleTokenBtn.textContent = isHidden ? "Hide Token" : "Use Token";
    // });

    // repoInput.focus();

    fetchRepo();
});
