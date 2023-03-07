

import {pinyinify} from 'hanzi-tools';

export const helloFromLambdaHandler = async () => {
    console.info(pinyinify("你好！你今天吃饭了"));
    return "Done";
}
