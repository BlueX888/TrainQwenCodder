const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  progress: 0,
  maxProgress: 12,
  isCompleted: false,
  elapsedTime: 0
};

let progressBar;
let progressFill;
let progressText;
let completeText;
let timerEvent;

const PROGRESS_MAX = 12;
const BAR_WIDTH = 600;
const BAR_HEIGHT = 40;
const BAR_X = 100;
const BAR_Y = 280;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建标题
  const title = this.add.text(400, 150, '进度条演示 (0/12)', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  title.setOrigin(0.5);

  // 创建进度条背景（灰色）
  progressBar = this.add.graphics();
  progressBar.fillStyle(0x555555, 1);
  progressBar.fillRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT);

  // 创建进度条边框
  progressBar.lineStyle(3, 0xffffff, 1);
  progressBar.strokeRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT);

  // 创建进度条填充（红色）
  progressFill = this.add.graphics();

  // 创建进度文本
  progressText = this.add.text(400, BAR_Y + BAR_HEIGHT / 2, '0%', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  completeText = this.add.text(400, 400, '✓ 完成！', {
    fontSize: '48px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: onProgressTick,
    callbackScope: this,
    loop: true
  });

  console.log(JSON.stringify({
    event: 'game_start',
    progress: window.__signals__.progress,
    maxProgress: PROGRESS_MAX
  }));
}

function onProgressTick() {
  if (window.__signals__.progress < PROGRESS_MAX) {
    window.__signals__.progress++;
    window.__signals__.elapsedTime += 1;

    console.log(JSON.stringify({
      event: 'progress_update',
      progress: window.__signals__.progress,
      percentage: Math.round((window.__signals__.progress / PROGRESS_MAX) * 100)
    }));

    // 检查是否完成
    if (window.__signals__.progress >= PROGRESS_MAX) {
      window.__signals__.isCompleted = true;
      timerEvent.remove();
      
      completeText.setVisible(true);
      
      console.log(JSON.stringify({
        event: 'progress_complete',
        progress: window.__signals__.progress,
        totalTime: window.__signals__.elapsedTime
      }));
    }
  }
}

function update(time, delta) {
  // 更新进度条填充
  const progress = window.__signals__.progress;
  const fillWidth = (progress / PROGRESS_MAX) * BAR_WIDTH;
  
  progressFill.clear();
  if (fillWidth > 0) {
    progressFill.fillStyle(0xff0000, 1);
    progressFill.fillRect(BAR_X, BAR_Y, fillWidth, BAR_HEIGHT);
  }

  // 更新进度文本
  const percentage = Math.round((progress / PROGRESS_MAX) * 100);
  progressText.setText(`${percentage}% (${progress}/${PROGRESS_MAX})`);

  // 添加脉动效果（完成时）
  if (window.__signals__.isCompleted) {
    const scale = 1 + Math.sin(time / 200) * 0.1;
    completeText.setScale(scale);
  }
}

new Phaser.Game(config);