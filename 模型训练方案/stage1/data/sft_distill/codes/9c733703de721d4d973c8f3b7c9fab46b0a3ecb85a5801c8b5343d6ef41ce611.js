const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局状态变量
let progress = 0; // 当前进度值 (0-3)
let progressBar = null; // 进度条前景
let progressText = null; // 进度文本
let completeText = null; // 完成文本
let timerEvent = null; // 计时器事件

const MAX_PROGRESS = 3; // 最大进度值
const BAR_WIDTH = 400; // 进度条总宽度
const BAR_HEIGHT = 40; // 进度条高度

function preload() {
  // 不需要加载外部资源
}

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;

  // 创建标题文本
  const titleText = this.add.text(centerX, centerY - 100, '进度条演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  titleText.setOrigin(0.5);

  // 创建进度条背景（灰色）
  const progressBg = this.add.graphics();
  progressBg.fillStyle(0x555555, 1);
  progressBg.fillRect(centerX - BAR_WIDTH / 2, centerY - BAR_HEIGHT / 2, BAR_WIDTH, BAR_HEIGHT);

  // 创建进度条前景（白色）
  progressBar = this.add.graphics();

  // 创建进度文本
  progressText = this.add.text(centerX, centerY + 60, `进度: ${progress} / ${MAX_PROGRESS}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, centerY + 100, '✓ 完成！', {
    fontSize: '28px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 创建计时器，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: onTimerTick,
    callbackScope: this,
    loop: true
  });

  // 初始绘制进度条
  updateProgressBar();
}

function update(time, delta) {
  // 每帧更新进度条显示（虽然值在 timer 中更新）
  updateProgressBar();
}

function onTimerTick() {
  // 增加进度
  if (progress < MAX_PROGRESS) {
    progress++;
    progressText.setText(`进度: ${progress} / ${MAX_PROGRESS}`);

    // 检查是否完成
    if (progress >= MAX_PROGRESS) {
      completeText.setVisible(true);
      // 停止计时器
      if (timerEvent) {
        timerEvent.remove();
        timerEvent = null;
      }
    }
  }
}

function updateProgressBar() {
  if (!progressBar) return;

  // 清除之前的绘制
  progressBar.clear();

  // 计算当前进度条宽度
  const currentWidth = (progress / MAX_PROGRESS) * BAR_WIDTH;
  const centerX = config.width / 2;
  const centerY = config.height / 2;

  // 绘制白色进度条
  progressBar.fillStyle(0xffffff, 1);
  progressBar.fillRect(
    centerX - BAR_WIDTH / 2,
    centerY - BAR_HEIGHT / 2,
    currentWidth,
    BAR_HEIGHT
  );
}

// 启动游戏
new Phaser.Game(config);