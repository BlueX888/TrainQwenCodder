const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

let triangleCount = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  triangleCount = 0;

  // 添加标题文本
  this.add.text(400, 30, '蓝色三角形生成器', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 添加计数显示
  const countText = this.add.text(400, 70, `已生成: ${triangleCount}/15`, {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建定时器事件，每隔4秒生成一个三角形
  this.time.addEvent({
    delay: 4000,                    // 4秒间隔
    callback: generateTriangle,     // 回调函数
    callbackScope: this,            // 回调作用域
    loop: false,                    // 不循环
    repeat: 14,                     // 重复14次（加上首次共15次）
    args: [countText]               // 传递计数文本对象
  });

  // 首次立即生成一个三角形
  generateTriangle.call(this, countText);
}

function generateTriangle(countText) {
  // 检查是否已达到最大数量
  if (triangleCount >= 15) {
    return;
  }

  // 生成随机位置（留出边距）
  const x = Phaser.Math.Between(100, 700);
  const y = Phaser.Math.Between(150, 550);

  // 三角形大小
  const size = 30;

  // 使用 Graphics 绘制蓝色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1); // 蓝色
  graphics.lineStyle(2, 0x0044cc, 1); // 深蓝色边框

  // 绘制等边三角形（顶点朝上）
  graphics.beginPath();
  graphics.moveTo(x, y - size);                    // 顶点
  graphics.lineTo(x - size, y + size);             // 左下角
  graphics.lineTo(x + size, y + size);             // 右下角
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();

  // 添加生成动画效果
  graphics.setAlpha(0);
  graphics.setScale(0.5);
  this.tweens.add({
    targets: graphics,
    alpha: 1,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });

  // 增加计数
  triangleCount++;

  // 更新计数文本
  countText.setText(`已生成: ${triangleCount}/15`);

  // 如果达到15个，显示完成提示
  if (triangleCount >= 15) {
    this.add.text(400, 560, '已生成全部15个三角形！', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }
}

new Phaser.Game(config);