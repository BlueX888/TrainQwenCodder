const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let progress = 0;
let isCompleted = false;

// UI 元素引用
let progressBarForeground;
let progressText;
let completionText;
let timerEvent;

const PROGRESS_MAX = 3;
const BAR_WIDTH = 400;
const BAR_HEIGHT = 40;
const BAR_X = 200;
const BAR_Y = 280;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 标题文本
  const title = this.add.text(400, 150, '进度条演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);

  // 创建进度条背景（灰色）
  const progressBarBackground = this.add.graphics();
  progressBarBackground.fillStyle(0x555555, 1);
  progressBarBackground.fillRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT);

  // 创建进度条边框
  const progressBarBorder = this.add.graphics();
  progressBarBorder.lineStyle(3, 0xffffff, 1);
  progressBarBorder.strokeRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT);

  // 创建进度条前景（紫色）
  progressBarForeground = this.add.graphics();

  // 进度文本
  progressText = this.add.text(400, 360, `进度: ${progress} / ${PROGRESS_MAX}`, {
    fontSize: '24px',
    color: '#ffffff'
  });
  progressText.setOrigin(0.5);

  // 完成文本（初始隐藏）
  completionText = this.add.text(400, 420, '✓ 完成！', {
    fontSize: '28px',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completionText.setOrigin(0.5);
  completionText.setVisible(false);

  // 提示文本
  const hintText = this.add.text(400, 500, '每秒自动增加 1', {
    fontSize: '18px',
    color: '#aaaaaa'
  });
  hintText.setOrigin(0.5);

  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: incrementProgress,
    callbackScope: this,
    loop: true
  });

  // 初始绘制进度条
  updateProgressBar();
}

function update(time, delta) {
  // 每帧更新进度条显示（确保视觉同步）
  updateProgressBar();
}

function incrementProgress() {
  if (progress < PROGRESS_MAX) {
    progress++;
    
    // 更新进度文本
    progressText.setText(`进度: ${progress} / ${PROGRESS_MAX}`);
    
    // 检查是否完成
    if (progress >= PROGRESS_MAX) {
      isCompleted = true;
      completionText.setVisible(true);
      
      // 停止定时器
      if (timerEvent) {
        timerEvent.remove();
      }
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completionText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
  }
}

function updateProgressBar() {
  // 清除之前的绘制
  progressBarForeground.clear();
  
  // 计算当前进度条宽度
  const progressRatio = progress / PROGRESS_MAX;
  const currentWidth = BAR_WIDTH * progressRatio;
  
  // 绘制紫色进度条
  progressBarForeground.fillStyle(0x9b59b6, 1); // 紫色
  progressBarForeground.fillRect(BAR_X, BAR_Y, currentWidth, BAR_HEIGHT);
}

// 启动游戏
new Phaser.Game(config);

// 导出状态变量供测试验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { progress, isCompleted, PROGRESS_MAX };
}