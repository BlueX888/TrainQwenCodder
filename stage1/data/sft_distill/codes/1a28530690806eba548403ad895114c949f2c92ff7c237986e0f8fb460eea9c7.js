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

// 可验证的状态变量
let currentProgress = 0;
const maxProgress = 15;
let progressBar;
let progressBackground;
let progressText;
let completeText;
let timerEvent;
let isComplete = false;

function preload() {
  // 无需加载外部资源
}

function create() {
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 280;

  // 创建进度条背景（深灰色）
  progressBackground = this.add.graphics();
  progressBackground.fillStyle(0x555555, 1);
  progressBackground.fillRect(barX, barY, barWidth, barHeight);

  // 创建进度条边框
  const border = this.add.graphics();
  border.lineStyle(3, 0xffffff, 1);
  border.strokeRect(barX, barY, barWidth, barHeight);

  // 创建进度条前景（白色）
  progressBar = this.add.graphics();

  // 创建进度文本
  progressText = this.add.text(400, 350, `进度: ${currentProgress}/${maxProgress}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);

  // 创建标题文本
  const titleText = this.add.text(400, 200, '进度条演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  completeText = this.add.text(400, 400, '✓ 完成！', {
    fontSize: '36px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: incrementProgress,
    callbackScope: this,
    loop: true
  });

  // 绘制初始进度条
  updateProgressBar(barX, barY, barWidth, barHeight);
}

function update(time, delta) {
  // 每帧更新进度条显示（虽然进度只在定时器中更新，但这样可以确保视觉同步）
  if (!isComplete) {
    updateProgressBar(100, 280, 600, 40);
  }
}

function incrementProgress() {
  if (currentProgress < maxProgress) {
    currentProgress++;
    progressText.setText(`进度: ${currentProgress}/${maxProgress}`);

    // 检查是否完成
    if (currentProgress >= maxProgress) {
      isComplete = true;
      completeProgress();
    }
  }
}

function updateProgressBar(x, y, width, height) {
  // 清除之前的进度条
  progressBar.clear();

  // 计算当前进度百分比
  const progress = currentProgress / maxProgress;
  const currentWidth = width * progress;

  // 绘制白色进度条
  progressBar.fillStyle(0xffffff, 1);
  progressBar.fillRect(x, y, currentWidth, height);
}

function completeProgress() {
  // 停止定时器
  if (timerEvent) {
    timerEvent.remove();
  }

  // 显示完成文本
  completeText.setVisible(true);

  // 添加完成动画效果
  completeText.setScale(0);
  game.scene.scenes[0].tweens.add({
    targets: completeText,
    scale: 1.2,
    duration: 500,
    ease: 'Back.easeOut',
    yoyo: true,
    repeat: 0,
    onComplete: () => {
      completeText.setScale(1);
    }
  });

  console.log('进度条已完成！最终进度:', currentProgress);
}

const game = new Phaser.Game(config);