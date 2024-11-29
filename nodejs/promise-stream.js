const main = async () => {
  return new Promise(async (resolve, reject) => {
    process.stdin.on('data', key => {
      console.log('process', key.toString(), typeof key.toString());
      // process.stdin.setEncoding('utf8');
      // process.stdin.resume();
      const s = key.toString();
      if (s === 's') {
        console.log('s');
        // clearInterval(timerId);
        // const time =
        //   Math.floor(new Date().getTime() / 1000) -
        //   Math.floor(new Date(task.start).getTime() / 1000);
        //
        // taskService.update({
        //   id: task.id,
        //   end: getFormatedDate(),
        //   projectId: task.project_id,
        //   time,
        // });
        resolve(process.exit);
        process.exit();
      }
    });
  });
};

const main2 = async() => {
  await main();
}
main2();
