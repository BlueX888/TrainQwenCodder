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

// 三角形计数器
let triangleCount = 0;
let timerEvent = null;

function preload() {
  // 使用 Graphics 生成粉色三角形纹理
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(30, 10);  // 顶点
  graphics.lineTo(10, 50);  // 左下
  graphics.lineTo(50, 50);  // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('pinkTriangle', 60, 60);
  
  // 清除 graphics 对象
  graphics.destroy();
}

function create() {
  // 添加标题文本
  this.add.text(400, 30, '每3秒生成一个粉色三角形（最多5个）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 显示当前数量
  const countText = this.add.text(400, 60, `当前数量: ${triangleCount}/5`, {
    fontSize: '18px',
    color: '#ffff00'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每3秒触发一次
  timerEvent = this.time.addEvent({
    delay: 3000,           // 3秒
    callback: spawnTriangle,
    callbackScope: this,
    loop: true,
    args: [countText]      // 传递文本对象用于更新显示
  });
  
  // 立即生成第一个三角形
  spawnTriangle.call(this, countText);
}

function spawnTriangle(countText) {
  // 检查是否已达到最大数量
  if (triangleCount >= 5) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 显示完成消息
    this.add.text(400, 550, '已生成5个三角形！', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    return;
  }
  
  // 生成随机位置（留出边距）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(100, 550);
  
  // 创建三角形图像
  const triangle = this.add.image(x, y, 'pinkTriangle');
  
  // 添加缩放动画效果
  this.tweens.add({
    targets: triangle,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 增加计数
  triangleCount++;
  
  // 更新显示文本
  countText.setText(`当前数量: ${triangleCount}/5`);
}

// 创建游戏实例
new Phaser.Game(config);