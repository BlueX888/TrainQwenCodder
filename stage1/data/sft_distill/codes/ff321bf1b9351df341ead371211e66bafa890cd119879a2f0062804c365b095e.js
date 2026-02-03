const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let currentProgress = 0;
const maxProgress = 20;
let progressBar;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 进度条配置
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 280;

  // 创建进度条背景（灰色）
  const background = this.add.graphics();
  background.fillStyle(0x555555, 1);
  background.fillRect(barX, barY, barWidth, barHeight);

  // 创建进度条边框
  const border = this.add.graphics();
  border.lineStyle(3, 0xffffff, 1);
  border.strokeRect(barX, barY, barWidth, barHeight);

  // 创建进度条前景（蓝色）
  progressBar = this.add.graphics();

  // 创建进度文本
  progressText = this.add.text(400, 250, '进度: 0 / 20', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  completeText = this.add.text(400, 350, '✓ 完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 创建定时器，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每1000毫秒（1秒）
    callback: updateProgress,   // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true,                 // 循环执行
    args: [barX, barY, barWidth, barHeight]  // 传递参数
  });

  // 初始绘制进度条
  drawProgressBar(barX, barY, barWidth, barHeight);
}

function updateProgress(barX, barY, barWidth, barHeight) {
  // 增加进度
  currentProgress++;

  // 更新进度条和文本
  drawProgressBar(barX, barY, barWidth, barHeight);
  progressText.setText(`进度: ${currentProgress} / ${maxProgress}`);

  // 检查是否完成
  if (currentProgress >= maxProgress) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
    }

    // 显示完成文本
    completeText.setVisible(true);

    // 添加完成动画效果
    this.tweens.add({
      targets: completeText,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      yoyo: true,
      ease: 'Bounce.easeOut'
    });

    console.log('Progress completed!'); // 控制台输出验证
  }
}

function drawProgressBar(barX, barY, barWidth, barHeight) {
  // 清除之前的绘制
  progressBar.clear();

  // 计算当前进度宽度
  const progressRatio = currentProgress / maxProgress;
  const currentWidth = barWidth * progressRatio;

  // 绘制蓝色进度条
  if (currentWidth > 0) {
    // 使用渐变色效果
    const blueShade = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x1e90ff),
      Phaser.Display.Color.ValueToColor(0x00bfff),
      100,
      progressRatio * 100
    );
    const color = Phaser.Display.Color.GetColor(blueShade.r, blueShade.g, blueShade.b);

    progressBar.fillStyle(color, 1);
    progressBar.fillRect(barX, barY, currentWidth, barHeight);
  }
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
  // 所有更新通过定时器回调处理
}

// 创建游戏实例
new Phaser.Game(config);