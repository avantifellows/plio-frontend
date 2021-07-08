// this is done because Jest expects mocks to be placed in the project root,
// while packages installed via NPM get stored inside node_modules subdirectory
// reference - https://github.com/knee-cola/jest-mock-axios#installation
import mockAxios from "jest-mock-axios";
export default mockAxios;
