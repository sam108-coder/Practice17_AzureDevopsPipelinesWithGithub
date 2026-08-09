require("dotenv").config();

const fs = require("fs");

const {
    saveTestExecution
} = require("../utils/database");

async function main() {

    const resultFile = "test-results/results.json";

    // Check whether JSON report exists
    if (!fs.existsSync(resultFile)) {

        console.error(
            "Playwright JSON report not found."
        );

        process.exit(1);
    }

    // Read Playwright JSON report
    const report = JSON.parse(
        fs.readFileSync(resultFile, "utf8")
    );

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    // Loop through suites
    for (const suite of report.suites || []) {

        for (const spec of suite.specs || []) {

            totalTests++;

            const testResult =
                spec.tests?.[0]?.results?.[0];

            const status = testResult?.status;

            if (status === "passed") {

                passedTests++;

            } else if (status === "skipped") {

                skippedTests++;

            } else {

                failedTests++;
            }
        }
    }

    const executionStatus =
        failedTests > 0 ? "FAILED" : "PASSED";

    const data = {

        buildId:
            process.env.BUILD_BUILDID || "LOCAL",

        buildNumber:
            process.env.BUILD_BUILDNUMBER || "LOCAL",

        branchName:
            process.env.BUILD_SOURCEBRANCHNAME || "LOCAL",

        environment:
            process.env.TEST_ENV || "QA",

        totalTests,

        passedTests,

        failedTests,

        skippedTests,

        durationSeconds: 0,

        executionStatus,

        reportPath:
            "playwright-report/index.html"
    };

    await saveTestExecution(data);

    console.log(
        "Playwright execution saved to MySQL."
    );

    console.log(data);
}

main().catch(error => {

    console.error(
        "Failed to save test execution:"
    );

    console.error(error);

    process.exit(1);

});