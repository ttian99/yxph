import gulp from 'gulp';
import resMiddle from './gulp-tasks/res-middle-es6';
import resResult from './gulp-tasks/res-result-es6';
import resScale from './gulp-tasks/res-scale';
import resImagemin from './gulp-tasks/res-imagemin-es6';

import cfg from './gulp-tasks/gulp-cfg';
cfg.init('chinaChess', '中国象棋');

gulp.task('default', () => console.log('default task'));

gulp.task('scale', async () => {
  await resScale('res-origin', 'res-middle/res-scale-0.704', 0.704);
});

gulp.task('res:dev', async () => {
  const [tmpDir, dest] = ['res-middle/dev', 'res'];
  const imageminDir = tmpDir + '-imagemin';
  await resMiddle(tmpDir);
  // await resImagemin(tmpDir, imageminDir);
  await resResult(tmpDir, dest, false);

  // mini
  cfg.resOrigin = 'res-origin-mini';
  const [miniTmpDir, miniDest] = ['res-middle/dev-mini', 'res-mini'];
  await resScale('res-origin', cfg.resOrigin, 0.704);
  await resMiddle(miniTmpDir);
  await resResult(miniTmpDir, miniDest, false, true);
});

gulp.task('res:prod', async () => {
  const [tmpDir, dest] = ['res-middle/dev', 'res'];
  const imageminDir = tmpDir + '-imagemin';
  await resMiddle(tmpDir);
  await resImagemin(tmpDir, imageminDir);
  await resResult(imageminDir, dest, true);

  // mini
  cfg.resOrigin = 'res-origin-mini';
  const [miniTmpDir, miniDest] = ['res-middle/dev-mini', 'res-mini'];
  const miniImageminDir = miniTmpDir + '-imamgemin';
  await resScale('res-origin', cfg.resOrigin, 0.704);
  await resMiddle(miniTmpDir);
  await resImagemin(miniTmpDir, miniImageminDir);
  await resResult(miniImageminDir, miniDest, true, true);
});

import buildRuntime from './gulp-tasks/build-runtime-es6';
gulp.task('build:runtime', async () => await buildRuntime());

/**
 * 生成native版本
 * build:android //不含任何sdk的包
 */
import buildNative from './gulp-tasks/build-native-es6';
gulp.task('build:android', async () => await buildNative());  // android-blank包

import publishQQGame from './gulp-tasks/publish-qqgame-es6';  // qqgame资源文件zip
gulp.task('publish', async() => await publishQQGame()); 

import git from 'gulp-git';
gulp.task('git:update-submodule', () => {
  git.updateSubmodule({ args: '--init' });
});

gulp.task('git:update', ['git:update-submodule'], (done) => {
  git.pull('origin', 'master', {args: '--rebase'}, (err) => {
    if (err) throw err;
    done();
  });
});
