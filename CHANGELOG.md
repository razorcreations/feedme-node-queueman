# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2018-06-13

### Added

- Added optional parameters for custom beanstalk host and port

### Fixed

- Fixed queue crashing after error

## [1.1.1] - 2018-06-12

### Fixed

- Fixed sending error back to API not working ([#447])
- Fixed queue retrying failed jobs

## [1.1.0] - 2018-06-08

### Added

 - Added ability to accept a priority when adding a job to the queue ([#417])

## [1.0.2] - 2018-05-23

### Fixed

- Fixed error handler not being passed correctly

## [1.0.1] - 2018-05-18

### Added

- Added additional logging where appropriate

### Fixed

- Fixed taking up a ton of CPU ([#392])
- Fixed error handler sometimes not being called correctly

[1.0.1]: https://bitbucket.org/razorcreations/feedme-node-queueman-library/compare/1.0.1..1.0.0
[1.0.2]: https://bitbucket.org/razorcreations/feedme-node-queueman-library/compare/1.0.2..1.0.1
[1.1.0]: https://bitbucket.org/razorcreations/feedme-web-refresh/branches/compare/1.1.0..1.0.2
[1.1.1]: https://bitbucket.org/razorcreations/feedme-web-refresh/branches/compare/1.1.1..1.1.0
[1.2.0]: https://bitbucket.org/razorcreations/feedme-web-refresh/branches/compare/1.2.0..1.1.1

[#392]: https://app.activecollab.com/160962/projects/18/tasks/1248
[#417]: https://app.activecollab.com/160962/projects/18/tasks/1327
[#447]: https://app.activecollab.com/160962/projects/18/tasks/1373